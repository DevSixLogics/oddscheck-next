import { getCategoryArticles, getAuthors, getMatches, flattenMatches } from "@/lib/api";

// Shared source of truth for the sitemap index (/sitemap.xml) and every child
// sitemap (/sitemap/{id}.xml). We render the XML ourselves (explicit route
// handlers) instead of the Next metadata convention so the index is always
// emitted and the routes win over the root [slug] catch-all.

// Static / hub pages (NON-sport). Sport hubs live in their own `sports` child.
const STATIC_PATHS = [
  "", "/live", "/offers", "/news", "/guides", "/experts",
  "/tools", "/odds-calculator", "/responsible-gambling", "/about", "/contact",
];

// Per-page crawl hints. Google ignores <priority> and mostly ignores
// <changefreq>, but auditors read them — so they reflect each page's real
// importance and update cadence. Unlisted paths use PAGE_DEFAULT.
const PAGE_META = {
  "": { priority: 1.0, changeFrequency: "daily" },        // homepage — top priority
  "/live": { priority: 0.9, changeFrequency: "hourly" },  // live odds — changes constantly
  "/offers": { priority: 0.9, changeFrequency: "daily" }, // commercial / high value
  "/news": { priority: 0.8, changeFrequency: "daily" },
  "/guides": { priority: 0.8, changeFrequency: "weekly" },
  "/experts": { priority: 0.8, changeFrequency: "weekly" },
  "/tools": { priority: 0.6, changeFrequency: "weekly" },
  "/odds-calculator": { priority: 0.6, changeFrequency: "monthly" }, // standalone tool page
  "/responsible-gambling": { priority: 0.4, changeFrequency: "monthly" },
  "/about": { priority: 0.4, changeFrequency: "monthly" },
  "/contact": { priority: 0.4, changeFrequency: "monthly" },
};
const PAGE_DEFAULT = { priority: 0.6, changeFrequency: "weekly" };

// Sport landing pages. The first seven have dedicated fixture routes; the rest
// resolve (200) via the [slug] catch-all as sport topic pages. All are real,
// crawlable URLs (verified) — none 404.
const SPORT_HUBS = [
  { path: "/football", priority: 0.9 },
  { path: "/horse-racing", priority: 0.9 },
  { path: "/racing", priority: 0.8 },
  { path: "/tennis", priority: 0.8 },
  { path: "/cricket", priority: 0.8 },
  { path: "/basketball", priority: 0.8 },
  { path: "/baseball", priority: 0.8 },
  { path: "/golf", priority: 0.8 },
  { path: "/rugby", priority: 0.8 },
  { path: "/rugby-union", priority: 0.8 },
  { path: "/american-football", priority: 0.8 },
  { path: "/ice-hockey", priority: 0.8 },
];

// Content groups → the CMS article categories each one aggregates (merged and
// deduped by article URL). These become the news / offers / guides child
// sitemaps of clean /article/{slug} URLs.
const CONTENT_GROUPS = {
  news: ["news"],
  offers: ["best-betting-offers", "offers-bonuses"],
  guides: ["guides", "betting-basics", "strategy-value", "bet-types", "sport-specific"],
};

// Static guide hub pages (the GUIDES keys in app/guide/[slug]/page.js).
const GUIDE_SLUGS = [
  "implied-probability", "value-bets", "accumulators",
  "free-bets", "prop-bets", "compare-bookmakers",
];

const MAX_PAGES = 20; // safety cap per category

// Sports whose match detail pages live at /event/{sport}/{id} and have a working
// fixtures feed. (Racing/golf use their own routes; baseball's feed 404s.)
const MATCH_SPORTS = ["football", "tennis", "basketball", "cricket"];

const toDate = (s) => {
  if (!s) return undefined;
  const d = new Date(String(s).replace(" ", "T"));
  return isNaN(d) ? undefined : d;
};

// The child-sitemap ids the index links to, in display order. Public URLs are
// /sitemap-{id}.xml (via next.config rewrites → the /sitemap/{id} route handler):
//   sitemap-pages · sitemap-news · sitemap-matches · sitemap-experts ·
//   sitemap-offers · sitemap-guides · sitemap-sports
export function sitemapGroupIds() {
  return ["pages", "sports", "guides", "news", "experts", "offers", "matches"];
}

// --- per-group entry builders ----------------------------------------------

// Homepage + core static landing pages ONLY (priority/changefreq from PAGE_META).
// Guide detail pages live in the guides sitemap, sport hubs in the sports sitemap.
function pagesEntries(base, now) {
  return STATIC_PATHS.map((p) => {
    const meta = PAGE_META[p] || PAGE_DEFAULT;
    return {
      url: `${base}${p || "/"}`,
      lastModified: now,
      changeFrequency: meta.changeFrequency,
      priority: meta.priority,
    };
  });
}

// Sport hub listing pages — their own child sitemap (/sitemap/sports.xml).
function sportsEntries(base, now) {
  return SPORT_HUBS.map((s) => ({
    url: `${base}${s.path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: s.priority,
  }));
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

// Today's match detail pages (/event/{sport}/{id}) across the match-feed sports.
// These are time-sensitive (a short changefreq), and finished games still carry
// teams / score / stats, so they're included for complete coverage. Each sport's
// feed is fetched in parallel and failures degrade to no entries for that sport.
async function matchesEntries(base, now) {
  const entries = [];
  const seen = new Set();
  const perSport = await Promise.all(
    MATCH_SPORTS.map(async (sport) => {
      try {
        const { groups } = await getMatches(sport);
        return { sport, matches: flattenMatches(groups) };
      } catch {
        return { sport, matches: [] };
      }
    })
  );
  for (const { sport, matches } of perSport) {
    for (const m of matches) {
      if (!m?.id) continue;
      const key = `${sport}/${m.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        url: `${base}/event/${sport}/${m.id}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.5,
      });
    }
  }
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

// Guides child: the static /guide/{slug} education hubs (priority 0.6, monthly)
// PLUS the guide-category articles (/article/{slug}), merged. Guide detail pages
// live HERE, not in pages.xml. Hubs and articles use different paths (no overlap).
async function guidesEntries(base, now) {
  const hubs = GUIDE_SLUGS.map((slug) => ({
    url: `${base}/guide/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  const seen = new Set(hubs.map((h) => h.url));
  const articles = (await contentGroupEntries(base, now, "guides")).filter((a) => !seen.has(a.url));
  return [...hubs, ...articles];
}

// A content group (news / offers / guides) = one or more CMS categories merged
// and deduped by article URL → clean /article/{slug} entries.
async function contentGroupEntries(base, now, group) {
  const out = [];
  const seen = new Set();
  for (const cat of CONTENT_GROUPS[group] || []) {
    for (const e of await categoryEntries(base, now, cat)) {
      if (seen.has(e.url)) continue;
      seen.add(e.url);
      out.push(e);
    }
  }
  return out;
}

// Build the <url> entries for one child sitemap id. Returns null for an unknown
// id so the route can answer 404.
export async function sitemapEntries(id, base) {
  const now = new Date();
  if (id === "pages") return pagesEntries(base, now);
  if (id === "sports") return sportsEntries(base, now);
  if (id === "guides") return guidesEntries(base, now);
  if (id === "experts") return expertsEntries(base, now);
  if (id === "matches") return matchesEntries(base, now);
  if (CONTENT_GROUPS[id]) return contentGroupEntries(base, now, id); // news, offers
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
