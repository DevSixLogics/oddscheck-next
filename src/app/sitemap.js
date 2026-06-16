import { SITE_URL } from "@/lib/site";
import { getCategoryArticles, getAuthors, getSettings, getMatches, flattenMatches } from "@/lib/api";

// Sports whose fixtures carry id'd events worth surfacing in the sitemap.
const EVENT_SPORTS = ["football", "tennis", "basketball", "cricket"];

// Re-generate at most hourly. Resilient: dynamic sections degrade to the static
// route list if a feed is unavailable, so the sitemap never fails the build.
export const revalidate = 3600;

const STATIC_PATHS = [
  "", "/live", "/news", "/experts", "/guides", "/tools", "/offers",
  "/football", "/racing", "/tennis", "/basketball", "/cricket", "/baseball", "/golf",
  "/responsible-gambling", "/about", "/contact",
];

const toDate = (s) => {
  if (!s) return undefined;
  const d = new Date(String(s).replace(" ", "T"));
  return isNaN(d) ? undefined : d;
};

export default async function sitemap() {
  const now = new Date();
  const entries = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p || "/"}`,
    lastModified: now,
    changeFrequency: p === "" ? "hourly" : "daily",
    priority: p === "" ? 1 : 0.7,
  }));

  // News / article pages.
  try {
    const { articles } = await getCategoryArticles("news", { perPage: 50 });
    for (const a of articles) {
      if (!a?.slug) continue;
      entries.push({
        url: `${SITE_URL}/article?slug=${a.slug}`,
        lastModified: toDate(a.start_date) || now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch { /* feed down — static routes still emitted */ }

  // Expert / author profiles.
  try {
    const authors = await getAuthors();
    for (const au of authors) {
      if (!au?.slug) continue;
      entries.push({ url: `${SITE_URL}/experts/${au.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 });
    }
  } catch { /* feed down */ }

  // Any extra CMS-allowed sports not already in STATIC_PATHS (ice hockey, rugby, …).
  try {
    const settings = await getSettings();
    const seen = new Set(STATIC_PATHS);
    for (const name of settings?.allowed_sports || []) {
      const slug = String(name).toLowerCase().trim().replace(/\s+/g, "-");
      const path = `/${slug}`;
      if (slug && !seen.has(path)) {
        seen.add(path);
        entries.push({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "daily", priority: 0.6 });
      }
    }
  } catch { /* settings down — static sports still emitted */ }

  // Today's fixtures as /event pages (bounded per sport so the sitemap stays lean).
  for (const sport of EVENT_SPORTS) {
    try {
      const { groups } = await getMatches(sport);
      for (const m of flattenMatches(groups).slice(0, 40)) {
        if (!m?.id) continue;
        entries.push({
          url: `${SITE_URL}/event?sport=${sport}&id=${m.id}`,
          lastModified: now,
          changeFrequency: "hourly",
          priority: 0.5,
        });
      }
    } catch { /* sport feed down — skip its events */ }
  }

  return entries;
}
