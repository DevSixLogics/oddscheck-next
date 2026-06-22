// Data access for the cms-oddscheck CMS.
// The fixtures/results feed exists per sport at /{sport}/new-matches and
// /{sport}/match/{id}/detail with the same shape (groups → matches → competitors,
// optional 1·X·2 odds). Football also ships a bundled fallback sample.
// See .claude/instructions/*-data-coverage-map.html for the gap analysis.

import sample from "./data/football-new-matches.sample.json";
import { localDay, tzOffsetMinutes } from "./format";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://cms-oddscheck.hneeds.com/api/v1";

// Cache window (seconds) for feed fetches; override via NEXT_PUBLIC_API_REVALIDATE.
const REVALIDATE = Number(process.env.NEXT_PUBLIC_API_REVALIDATE) || 60;

// Sports known to expose the new-matches feed. Racing's endpoint is unstable.
export const SPORTS = ["football", "tennis", "basketball", "cricket", "racing"];

// Date the bundled (football) sample was captured on — populated AND carries odds.
const SAMPLE_DATE = "2026-06-02";

/** YYYY-MM-DD for "today" in the server's timezone. */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchMatches(sport, date, fresh = false) {
  // multi_odds=1 → `odds` is an array of per-bookmaker markets (1x2, DC, BTTS…).
  const url = `${API_BASE}/${sport}/new-matches?type=all&date=${date}&multi_odds=1`;
  const res = await fetch(url, {
    // `fresh` (live poll) bypasses the data cache so each poll sees current
    // scores/minutes; otherwise re-fetch at most once per REVALIDATE window.
    ...(fresh ? { cache: "no-store" } : { next: { revalidate: REVALIDATE } }),
    // The CMS often takes ~7s; an 8s cap made sports randomly time out, so the
    // live board showed a different subset each visit. 15s gives real headroom
    // while still bounding a genuinely hung feed.
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${sport}/new-matches ${date} -> HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/** Number of matches available for a sport today (0 on error/empty). */
export async function getMatchCount(sport) {
  try {
    const { groups } = await getMatches(sport);
    return (groups || []).reduce((n, g) => n + (g.matches?.length || 0), 0);
  } catch {
    return 0;
  }
}

/**
 * Generic sport fixtures/results.
 * Returns { groups, date, source, sport } where source is
 * "live" | "sample-date" | "fallback" (football only) | "empty".
 */
export async function getMatches(sport = "football", date = todayISO(), { fresh = false } = {}) {
  try {
    let groups = await fetchMatches(sport, date, fresh);
    if (groups.length) return { groups, date, source: "live", sport };

    if (date !== SAMPLE_DATE) {
      groups = await fetchMatches(sport, SAMPLE_DATE, fresh);
      if (groups.length) return { groups, date: SAMPLE_DATE, source: "sample-date", sport };
    }
  } catch (err) {
    console.error(`[api] getMatches(${sport}) failed:`, err.message);
  }
  // Only football has a bundled offline snapshot; other sports degrade to empty.
  if (sport === "football") {
    return { groups: sample.data ?? [], date: SAMPLE_DATE, source: "fallback", sport };
  }
  return { groups: [], date, source: "empty", sport };
}

/** Backwards-compatible football helper. */
export function getFootballMatches(date = todayISO()) {
  return getMatches("football", date);
}

/** Add `n` days to a YYYY-MM-DD string (UTC-safe). */
function shiftISO(date, n) {
  const [y, m, d] = String(date).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/**
 * Matches for a sport on the viewer's LOCAL calendar day `localDate` (YYYY-MM-DD)
 * in zone `tz`. The feed buckets by UTC date and a local day overlaps two UTC
 * days, so we fetch the one relevant adjacent UTC feed, merge the league groups,
 * and keep only matches whose LOCAL day == localDate. Same shape as getMatches.
 */
export async function getMatchesByLocalDate(sport, localDate, tz, { fresh = false } = {}) {
  // East-of-UTC (offset>0): local day = UTC [day-1, day]. West: [day, day+1].
  const offset = tzOffsetMinutes(tz, localDate);
  const utcDates =
    offset > 0 ? [shiftISO(localDate, -1), localDate]
    : offset < 0 ? [localDate, shiftISO(localDate, 1)]
    : [localDate];

  // Only the UTC day containing "now" carries live-changing data, so only it
  // needs the uncached `fresh` fetch; the adjacent (past/future) day stays cached.
  const utcToday = todayISO();
  const feeds = await Promise.all(
    utcDates.map((d) => fetchMatches(sport, d, fresh && d === utcToday).catch(() => []))
  );

  // Merge league groups across the fetched UTC days; keep only local-day matches.
  const byGroup = new Map();
  const seen = new Set();
  for (const groups of feeds) {
    for (const g of groups || []) {
      for (const m of g.matches || []) {
        if (localDay(m.dt || m.gdt, tz) !== localDate) continue;
        const mid = String(m.id);
        if (seen.has(mid)) continue;
        seen.add(mid);
        let grp = byGroup.get(g.id);
        if (!grp) { grp = { ...g, matches: [] }; byGroup.set(g.id, grp); }
        grp.matches.push(m);
      }
    }
  }
  const merged = [...byGroup.values()].filter((g) => g.matches.length);
  for (const g of merged) g.match_count = g.matches.length;
  return { groups: merged, date: localDate, source: merged.length ? "live" : "empty", sport };
}

/**
 * Single match detail from /{sport}/match/{id}/detail.
 * Adds team form (htf/atf), nested tournament, and the 1·X·2 odds object.
 * Returns the data object or null.
 */
export async function getMatchDetail(sport = "football", id) {
  if (!id) return null;
  try {
    const res = await fetch(`${API_BASE}/${sport}/match/${id}/detail?multi_odds=1`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) throw new Error(`${sport}/match/${id}/detail -> HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.data ?? null;
    // `odds` and `tabs` are TOP-LEVEL siblings of `data` (not nested) — attach
    // them so oddsMarkets()/oddsTriple() can read d.odds, and the page can read
    // d.tabs (the per-match list of available detail tabs, e.g. teams/standings/info).
    if (data && json.odds != null && data.odds == null) data.odds = json.odds;
    if (data && Array.isArray(json.tabs) && data.tabs == null) data.tabs = json.tabs;
    return data;
  } catch (err) {
    console.error("[api] getMatchDetail failed:", err.message);
    return null;
  }
}

/**
 * Odds for a single match pulled from the LISTING feed (/{sport}/new-matches).
 * Some sports (notably cricket) expose no `odds` on the match-detail endpoint —
 * the listing feed is the only odds source — so the detail page backfills from
 * here. `date` is the match's calendar day (YYYY-MM-DD, from gdt/dt).
 * Returns the per-bookmaker odds array (possibly []); never throws.
 */
export async function getMatchOdds(sport, id, date) {
  if (!id || !date) return [];
  try {
    const groups = await fetchMatches(sport, date, false);
    for (const g of groups) {
      for (const m of g.matches || []) {
        if (String(m.id) !== String(id)) continue;
        const o = m.odds;
        // The feed sends odds as an ARRAY (multi_odds), a SINGLE market object
        // (one bookmaker), or null. Normalise to an array so the detail page
        // shows the same odds the listing has — a single-object payload would
        // otherwise be dropped and the detail would wrongly show "no odds".
        if (Array.isArray(o)) return o;
        if (o && Array.isArray(o.outcomes)) return [o];
        return [];
      }
    }
  } catch (err) {
    console.error("[api] getMatchOdds failed:", err.message);
  }
  return [];
}

/**
 * Cricket group standings for a match: /cricket/match/{id}/standings.
 * Returns an array of non-empty groups, each a row[] of
 * { grp, tnm, tid, pos, mt, wo, lo, dr, pts, nrr, prem }, or [] on error.
 */
export async function getMatchStandings(sport = "cricket", id) {
  if (!id) return [];
  try {
    const res = await fetch(`${API_BASE}/${sport}/match/${id}/standings`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`${sport}/match/${id}/standings -> HTTP ${res.status}`);
    const json = await res.json();
    const groups = Array.isArray(json?.data) ? json.data : [];
    return groups.filter((g) => Array.isArray(g) && g.length);
  } catch (err) {
    console.error("[api] getMatchStandings failed:", err.message);
    return [];
  }
}

/**
 * Generic match-detail TAB fetch: /{sport}/match/{id}/{tab} (teams, standings,
 * info, scorecard, …). Returns the `data` payload or null.
 */
export async function getMatchTab(sport, id, tab) {
  if (!id || !tab) return null;
  try {
    const res = await fetch(`${API_BASE}/${sport}/match/${id}/${tab}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`${sport}/match/${id}/${tab} -> HTTP ${res.status}`);
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error(`[api] getMatchTab(${tab}) failed:`, err.message);
    return null;
  }
}

/**
 * Runners for a race: /horseracing/meeting/{raceId}/runners.
 * Returns the race object { id, st, nm, nor, dis, runner: [{ nm, joc, tra, wei, pos, surl, ... }] } or null.
 */
export async function getRaceRunners(raceId) {
  if (!raceId) return null;
  try {
    const res = await fetch(`${API_BASE}/horseracing/meeting/${raceId}/runners`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`horseracing/meeting/${raceId}/runners -> HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data[0] ?? null : null;
  } catch (err) {
    console.error("[api] getRaceRunners failed:", err.message);
    return null;
  }
}

/**
 * Golf tournaments + leaderboard for a date: /golf/matches?match_type=all&date=.
 * Returns { tournaments, date }. Each tournament: { id, nm, st, et, par, matches:[player] }
 * where player: { id, pid, nm, cnm (country), par (to-par), thru, strk, pos, st, scores:[round] }.
 */
export async function getGolfTournaments(date = todayISO()) {
  const GOLF_SAMPLE = "2026-05-31";
  async function fetchGolf(d) {
    const res = await fetch(`${API_BASE}/golf/matches?match_type=all&date=${d}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`golf/matches ${d} -> HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  }
  try {
    let tournaments = await fetchGolf(date);
    if (tournaments.length) return { tournaments, date, source: "live" };
    if (date !== GOLF_SAMPLE) {
      tournaments = await fetchGolf(GOLF_SAMPLE);
      if (tournaments.length) return { tournaments, date: GOLF_SAMPLE, source: "sample-date" };
    }
  } catch (err) {
    console.error("[api] getGolfTournaments failed:", err.message);
  }
  return { tournaments: [], date, source: "empty" };
}

/**
 * Horse racing meetings for a date: /horseracing/meetings?date=YYYY-MM-DD.
 * Returns { meetings, date }. Each meeting: { id, dt, cnm (course), co (country),
 * wea (weather), go (going), nor (#races), races: [{ id, st, nm, nor, dis, status }] }.
 */
export async function getRacingMeetings(date = todayISO()) {
  try {
    const res = await fetch(`${API_BASE}/horseracing/meetings?date=${date}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`horseracing/meetings -> HTTP ${res.status}`);
    const json = await res.json();
    return { meetings: Array.isArray(json?.data) ? json.data : [], date };
  } catch (err) {
    console.error("[api] getRacingMeetings failed:", err.message);
    return { meetings: [], date };
  }
}

/**
 * News articles from /articles?per_page=&page=.
 * Returns { articles, pagination } (pagination: { total, per_page, current_page, last_page }).
 */
export async function getArticles({ page = 1, perPage = 10 } = {}) {
  try {
    const res = await fetch(`${API_BASE}/articles?per_page=${perPage}&page=${page}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`articles -> HTTP ${res.status}`);
    const json = await res.json();
    return {
      articles: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination ?? null,
    };
  } catch (err) {
    console.error("[api] getArticles failed:", err.message);
    return { articles: [], pagination: null };
  }
}

// Category-name → CMS category slug for the dedicated /article/{slug} feed.
// The CMS exposes no category-listing endpoint and articles carry no slug, so we
// map the slugs we've verified. Unknown categories fall back to feed-filtering.
const CATEGORY_SLUGS = {
  "best betting offers": "best-betting-offers",
};

/** CMS category slug for a category name, or null if we don't have a verified one. */
export function categorySlugFor(name = "") {
  return CATEGORY_SLUGS[name.trim().toLowerCase()] || null;
}

/**
 * Articles for a CMS category feed: /article/{slug}?per_page=&page=.
 * Returns { articles, pagination, seo }. Each article: { id, headline, strapline,
 * slug, start_date, key_values, authorName, authorSlug, categoryName, subjects }.
 */
export async function getCategoryArticles(slug, { page = 1, perPage = 24 } = {}) {
  try {
    const res = await fetch(`${API_BASE}/article/${encodeURIComponent(slug)}?per_page=${perPage}&page=${page}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`article/${slug} -> HTTP ${res.status}`);
    const json = await res.json();
    return {
      articles: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination ?? null,
      seo: json?.seo ?? null,
    };
  } catch (err) {
    console.error("[api] getCategoryArticles failed:", err.message);
    return { articles: [], pagination: null, seo: null };
  }
}

/**
 * Articles for a category by NAME. Uses the dedicated category endpoint when a
 * slug is known; otherwise filters the general /articles feed by categoryName.
 * "" or "all" returns every article.
 */
export async function getArticlesForCategory(name = "All") {
  const slug = categorySlugFor(name);
  if (slug) {
    const { articles } = await getCategoryArticles(slug, { perPage: 30 });
    if (articles.length) return articles;
  }
  const { articles } = await getArticles({ perPage: 50 });
  const n = name.trim().toLowerCase();
  if (!n || n === "all") return articles;
  return articles.filter((a) => (a.categoryName || "").trim().toLowerCase() === n);
}

/**
 * Best betting offers — thin wrapper over the best-betting-offers category feed.
 * Returns an array of offer articles (empty on error).
 */
export async function getOffers({ page = 1, perPage = 12 } = {}) {
  const { articles } = await getCategoryArticles("best-betting-offers", { page, perPage });
  return articles;
}

// Friendly URL slug → CMS category slug for the dynamic /[slug] category route.
const CATEGORY_ALIASES = {
  offers: "best-betting-offers",
  "best-offers": "best-betting-offers",
};

const slugify = (s = "") => s.trim().toLowerCase().replace(/\s+/g, "-");

/**
 * Resolve a URL slug to a category and its articles for the dynamic /[slug] route.
 * Returns { name, slug, articles } or null (→ 404). Resolution order:
 *   1. alias → dedicated /article/{cmsSlug} endpoint,
 *   2. the slug itself as a dedicated /article/{slug} endpoint,
 *   3. slugified categoryName match in the general /articles feed (feed-filter).
 */
export async function getCategoryBySlug(slug = "") {
  const s = slug.trim().toLowerCase();
  if (!s) return null;

  // 1 + 2: dedicated category endpoint (via alias, then the raw slug).
  for (const candidate of [CATEGORY_ALIASES[s], s]) {
    if (!candidate) continue;
    const { articles } = await getCategoryArticles(candidate, { perPage: 50 });
    if (articles.length) {
      return { name: articles[0].categoryName || candidate, slug: candidate, articles };
    }
  }

  // 3: match a category present in the general feed by slugified name.
  const { articles: all } = await getArticles({ perPage: 50 });
  const match = all.find((a) => slugify(a.categoryName) === s);
  if (match) {
    const name = match.categoryName;
    return { name, slug: s, articles: all.filter((a) => a.categoryName === name) };
  }

  return null;
}

/**
 * Site settings / general information from /settings.
 * Carries site title, logos, favicon, social links, theme colours, the header
 * `menu` array, allowed_sports, etc. Returns the `data` object or null.
 */
export async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`settings -> HTTP ${res.status}`);
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error("[api] getSettings failed:", err.message);
    return null;
  }
}

/**
 * SEO-relevant fields from /settings, normalized for use in metadata + JSON-LD.
 * Every field is optional — the CMS currently leaves most blank, so callers must
 * fall back to their own defaults. As the team fills these in (description, OG
 * image, social links, GSC/GA codes, contact details) they flow through with no
 * code change. See .claude/instructions/api-reference.md for field meanings.
 */
export async function getSiteMeta() {
  const s = await getSettings();
  if (!s) return {};
  const clean = (v) => {
    const t = typeof v === "string" ? v.trim() : v;
    return t ? t : null;
  };
  const sameAs = Array.isArray(s.social_links)
    ? s.social_links.map((l) => clean(l?.link)).filter(Boolean)
    : [];
  const addressParts = [s.street_address, s.city, s.state, s.postal_code, s.country]
    .map(clean)
    .filter(Boolean);
  return {
    siteTitle: clean(s.site_title),
    siteUrl: clean(s.site_Url),
    description: clean(s.short_description),
    ogImage: clean(s.site_og_image),
    favicon: clean(s.favicon),
    logo: clean(s.header_dark_logo) || clean(s.header_light_logo),
    headerLogo: clean(s.header_dark_logo) || clean(s.header_light_logo),
    footerLogo: clean(s.footer_dark_logo) || clean(s.footer_light_logo),
    sameAs,
    gscCode: clean(s.google_console_code),
    gaCode: clean(s.google_analytics_code),
    robotsTxt: clean(s.robots_txt_code),
    email: clean(s.email),
    phone: clean(s.phone_no),
    address: addressParts.length ? addressParts.join(", ") : null,
    contact: {
      email: clean(s.email),
      phone: clean(s.phone_no),
      streetAddress: clean(s.street_address),
      city: clean(s.city),
      region: clean(s.state),
      postalCode: clean(s.postal_code),
      country: clean(s.country),
    },
  };
}

/**
 * Per-sport SEO template settings from /seo-settings. Returns the raw `data`
 * object: top-level { site_url, site_title, site_og_image } + a node per sport
 * (football, basketball, tennis, icehockey, cricket) carrying `match_listings`,
 * `match_detail`, `league_detail`, … sections whose {t,d,k,h,pd} strings contain
 * %TOKEN% placeholders (%SITE_NAME%, %HOME_TEAM%, %AWAY_TEAM%, %LEAGUE_NAME%, %DATE%).
 */
export async function getSeoSettings() {
  try {
    const res = await fetch(`${API_BASE}/seo-settings`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`seo-settings -> HTTP ${res.status}`);
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error("[api] getSeoSettings failed:", err.message);
    return null;
  }
}

/** Header menu items from settings, normalized to { href, label, newTab }. */
export async function getHeaderMenu() {
  const settings = await getSettings();
  const menu = Array.isArray(settings?.menu) ? settings.menu : [];
  return menu
    .filter((m) => (m.menu_location || "header") === "header")
    .map((m) => ({
      href: m.external_link || m.link || "#",
      label: m.title || "",
      newTab: !!m.open_in_new_tab,
    }))
    .filter((m) => m.label);
}

/**
 * Distinct authors across the article feeds, enriched with bio + post count from
 * /author/details. There is no authors-list endpoint, so we derive the set from
 * the general feed + the offers feed, then look up each author's profile.
 * Returns [{ slug, name, image, bio, postCount }] sorted by post count desc.
 */
/**
 * Author/bookmaker avatar URL, or null when the CMS returns its generic
 * "default.png" placeholder. Returning null lets the UI fall back to a brand
 * badge or initial circle instead of showing the same default image for every
 * author until real photos are uploaded in the CMS.
 */
export function realAuthorImage(path) {
  if (!path) return null;
  const base = String(path).split(/[?#]/)[0].split("/").pop().toLowerCase();
  return /^default\.(png|jpe?g|webp|svg|gif)$/.test(base) ? null : path;
}

export async function getAuthors() {
  const map = new Map();
  const collect = (arr) => {
    for (const a of arr || []) {
      const slug = (a.authorSlug || "").toLowerCase();
      if (!slug || map.has(slug)) continue;
      map.set(slug, { slug, name: a.authorName || slug, image: realAuthorImage(a.profile_image_path) });
    }
  };

  // The /articles feed caps each page at ~5 items, so page through ALL of it to
  // discover every author (page 1 alone would only surface a handful).
  const MAX_PAGES = 40;
  const first = await getArticles({ page: 1, perPage: 50 });
  collect(first.articles);
  const total = first.pagination?.total || first.articles.length;
  const per = first.articles.length || 5;
  const lastPage = Math.min(Math.ceil(total / per) || 1, MAX_PAGES);
  if (lastPage > 1) {
    const pages = [];
    for (let p = 2; p <= lastPage; p++) pages.push(p);
    const rest = await Promise.all(pages.map((p) => getArticles({ page: p, perPage: 50 })));
    rest.forEach((r) => collect(r.articles));
  }
  // Offers feed too (bookmaker authors).
  collect(await getOffers({ perPage: 50 }));

  const authors = [...map.values()];
  const enriched = await Promise.all(
    authors.map(async (au) => {
      const { detail } = await getAuthorDetails(au.slug);
      // Use the author's real CMS bio verbatim as the card strapline.
      const bio = detail?.bio?.trim() || null;
      return { ...au, bio, postCount: detail?.post_count ?? null };
    })
  );
  return enriched.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
}

/**
 * Author (bookmaker) profile + their articles from /author/details?author_name={slug}.
 * Returns { detail: { slug, name, bio, post_count, socials } | null, articles, random }.
 */
export async function getAuthorDetails(authorName) {
  if (!authorName) return { detail: null, articles: [], random: [] };
  try {
    const res = await fetch(`${API_BASE}/author/details?author_name=${encodeURIComponent(authorName)}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`author/details ${authorName} -> HTTP ${res.status}`);
    const json = await res.json();
    return {
      detail: json?.detail ?? null,
      articles: Array.isArray(json?.data) ? json.data : [],
      random: Array.isArray(json?.randomArticles) ? json.randomArticles : [],
    };
  } catch (err) {
    console.error("[api] getAuthorDetails failed:", err.message);
    return { detail: null, articles: [], random: [] };
  }
}

/**
 * Single article from /articles/{slug}.
 * Returns { article, related, random } or null.
 */
export async function getArticle(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`articles/${slug} -> HTTP ${res.status}`);
    const json = await res.json();
    if (!json?.data) return null;
    let related = Array.isArray(json.relatedArticles) ? json.relatedArticles : [];
    let random = Array.isArray(json.randomArticles) ? json.randomArticles : [];

    // The single-article endpoint omits image_path on its related/random lists,
    // but the category feed carries it — backfill by slug so "More stories" can
    // show thumbnails.
    if ([...related, ...random].some((a) => a && !a.image_path)) {
      const imgBySlug = await articleImageMap();
      const fill = (a) => (a && !a.image_path && imgBySlug[a.slug] ? { ...a, image_path: imgBySlug[a.slug] } : a);
      related = related.map(fill);
      random = random.map(fill);
    }

    return { article: json.data, related, random };
  } catch (err) {
    console.error("[api] getArticle failed:", err.message);
    return null;
  }
}

// slug → image_path map from the feeds that actually carry images (the category
// feeds). Used to backfill thumbnails the single-article endpoint leaves blank.
async function articleImageMap() {
  const map = {};
  try {
    const { articles } = await getCategoryArticles("best-betting-offers", { perPage: 50 });
    for (const a of articles) if (a?.slug && a.image_path) map[a.slug] = a.image_path;
  } catch {
    /* best-effort */
  }
  return map;
}

/**
 * Head-to-head for a match: /{sport}/match/{id}/h2h.
 * Returns { stats, meetings } or null. stats = { homeTeam, awayTeam, wins, draws, average_goal_score, ... }.
 */
export async function getMatchH2H(sport = "football", id) {
  if (!id) return null;
  try {
    const res = await fetch(`${API_BASE}/${sport}/match/${id}/h2h`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${sport}/match/${id}/h2h -> HTTP ${res.status}`);
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;
    const meetings = [];
    for (const g of d.h2h || []) for (const m of g.matches || []) meetings.push({ ...m, league: g.name || g.nm });
    return { stats: d.h2h_stats || null, meetings };
  } catch (err) {
    console.error("[api] getMatchH2H failed:", err.message);
    return null;
  }
}

/** Flatten all groups into a single match[] with the parent league attached. */
export function flattenMatches(groups) {
  const out = [];
  for (const g of groups) {
    for (const m of g.matches ?? []) {
      out.push({ ...m, league: g.name || g.nm, leagueFull: g.nm, isCup: !!g.is_cup, fid: g.fid, is_top: g.is_top });
    }
  }
  return out;
}
