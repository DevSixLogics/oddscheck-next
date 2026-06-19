import { getBaseUrl } from "@/lib/base-url";
import { getCategoryArticles, getAuthors, getSettings } from "@/lib/api";

// Render per-request so the base URL reflects the live request host (vercel/custom
// domain/localhost). The underlying CMS fetches are still cached (revalidate: 300).
export const dynamic = "force-dynamic";

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
  // Base origin comes from the request host (vercel/custom domain/localhost) — not hardcoded.
  const base = await getBaseUrl();

  const entries = STATIC_PATHS.map((p) => ({
    url: `${base}${p || "/"}`,
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
        url: `${base}/article/${a.slug}`,
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
      entries.push({ url: `${base}/experts/${au.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 });
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
        entries.push({ url: `${base}${path}`, lastModified: now, changeFrequency: "daily", priority: 0.6 });
      }
    }
  } catch { /* settings down — static sports still emitted */ }

  // NOTE: per-event pages use query-string URLs (/event?sport=…&id=…). The raw "&"
  // is invalid in a sitemap XML <loc>, and they're transient (today's fixtures), so
  // they're intentionally NOT listed here — crawlers reach them via the sport pages.

  return entries;
}
