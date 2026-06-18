import { getCategoryArticles, getAuthors, getSettings } from "@/lib/api";

// Shared source of truth for the sitemap index (/sitemap.xml) and every child
// sitemap (/sitemap/{id}.xml). We render the XML ourselves (explicit route
// handlers) instead of the Next metadata convention so the index is always
// emitted and the routes win over the root [slug] catch-all.

const STATIC_PATHS = [
  "", "/live", "/news", "/experts", "/guides", "/tools", "/offers",
  "/football", "/racing", "/tennis", "/basketball", "/cricket", "/baseball", "/golf",
  "/responsible-gambling", "/about", "/contact",
];

// Evergreen article categories. Each one is its OWN child sitemap
// (/sitemap/{category}.xml) listing the clean /article/{slug} pages inside it.
export const ARTICLE_CATEGORIES = [
  "news", "best-betting-offers", "guides", "betting-basics",
  "strategy-value", "bet-types", "offers-bonuses", "sport-specific",
];

// Static guide hub pages (the GUIDES keys in app/guide/[slug]/page.js).
const GUIDE_SLUGS = [
  "implied-probability", "value-bets", "accumulators",
  "free-bets", "prop-bets", "compare-bookmakers",
];

const MAX_PAGES = 20; // safety cap per category

const toDate = (s) => {
  if (!s) return undefined;
  const d = new Date(String(s).replace(" ", "T"));
  return isNaN(d) ? undefined : d;
};

// The full list of child-sitemap ids the index links to (and the only ids the
// child route will serve). "pages" + "experts" + one per article category.
export function sitemapGroupIds() {
  return ["pages", "experts", ...ARTICLE_CATEGORIES];
}

// --- per-group entry builders ----------------------------------------------

// Static pages, guide hubs, and any extra CMS-allowed sports.
async function pagesEntries(base, now) {
  const entries = STATIC_PATHS.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: p === "" ? "hourly" : "daily",
    priority: p === "" ? 1 : 0.7,
  }));

  for (const slug of GUIDE_SLUGS) {
    entries.push({ url: `${base}/guide/${slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }

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

  return entries;
}

// Expert / author profiles.
async function expertsEntries(base, now) {
  const entries = [];
  try {
    const authors = await getAuthors();
    for (const au of authors) {
      if (!au?.slug) continue;
      entries.push({ url: `${base}/experts/${au.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 });
    }
  } catch { /* feed down */ }
  return entries;
}

// One article category, fully paginated and deduped → clean /article/{slug}.
// (An article in several categories may also appear in those categories' child
// sitemaps — crawlers dedupe by URL, so that's harmless.)
async function categoryEntries(base, now, category) {
  const entries = [];
  const seen = new Set();
  try {
    let page = 1;
    let last = 1;
    do {
      const { articles, pagination } = await getCategoryArticles(category, { page, perPage: 50 });
      for (const a of articles) {
        if (!a?.slug || seen.has(a.slug)) continue;
        seen.add(a.slug);
        entries.push({
          url: `${base}/article/${a.slug}`,
          lastModified: toDate(a.start_date) || now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
      last = Math.min(pagination?.last_page || 1, MAX_PAGES);
      page += 1;
    } while (page <= last);
  } catch { /* category feed down — return whatever was collected */ }
  return entries;
}

// Build the <url> entries for one child sitemap id. Returns null for an unknown
// id so the route can answer 404.
export async function sitemapEntries(id, base) {
  const now = new Date();
  if (id === "pages") return pagesEntries(base, now);
  if (id === "experts") return expertsEntries(base, now);
  if (ARTICLE_CATEGORIES.includes(id)) return categoryEntries(base, now, id);
  return null;
}

// --- XML rendering ----------------------------------------------------------

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const iso = (d) => (d ? new Date(d).toISOString() : undefined);

// <urlset> for a single child sitemap.
export function renderUrlset(entries) {
  const body = entries
    .map((e) => {
      const lm = e.lastModified ? `<lastmod>${iso(e.lastModified)}</lastmod>` : "";
      const cf = e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : "";
      const pr = e.priority != null ? `<priority>${e.priority}</priority>` : "";
      return `<url><loc>${xmlEscape(e.url)}</loc>${lm}${cf}${pr}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

// <sitemapindex> listing every child sitemap.
export function renderIndex(children) {
  const body = children
    .map((c) => `<sitemap><loc>${xmlEscape(c.loc)}</loc>${c.lastmod ? `<lastmod>${iso(c.lastmod)}</lastmod>` : ""}</sitemap>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}
