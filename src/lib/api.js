// Data access for the cms-oddscheck CMS.
// The fixtures/results feed exists per sport at /{sport}/new-matches and
// /{sport}/match/{id}/detail with the same shape (groups → matches → competitors,
// optional 1·X·2 odds). Football also ships a bundled fallback sample.
// See .claude/instructions/*-data-coverage-map.html for the gap analysis.

import sample from "./data/football-new-matches.sample.json";

export const API_BASE = "https://cms-oddscheck.hneeds.com/api/v1";

// Sports known to expose the new-matches feed. Racing's endpoint is unstable.
export const SPORTS = ["football", "tennis", "basketball", "cricket", "racing"];

// Date the bundled (football) sample was captured on — populated AND carries odds.
const SAMPLE_DATE = "2026-06-02";

/** YYYY-MM-DD for "today" in the server's timezone. */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchMatches(sport, date) {
  const url = `${API_BASE}/${sport}/new-matches?type=all&date=${date}`;
  const res = await fetch(url, {
    // Treat as live-ish data; re-fetch at most once a minute.
    next: { revalidate: 60 },
    // Don't let a slow/unstable sport feed (e.g. racing) hang the request.
    signal: AbortSignal.timeout(8000),
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
export async function getMatches(sport = "football", date = todayISO()) {
  try {
    let groups = await fetchMatches(sport, date);
    if (groups.length) return { groups, date, source: "live", sport };

    if (date !== SAMPLE_DATE) {
      groups = await fetchMatches(sport, SAMPLE_DATE);
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

/**
 * Single match detail from /{sport}/match/{id}/detail.
 * Adds team form (htf/atf), nested tournament, and the 1·X·2 odds object.
 * Returns the data object or null.
 */
export async function getMatchDetail(sport = "football", id) {
  if (!id) return null;
  try {
    const res = await fetch(`${API_BASE}/${sport}/match/${id}/detail`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`${sport}/match/${id}/detail -> HTTP ${res.status}`);
    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    console.error("[api] getMatchDetail failed:", err.message);
    return null;
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
    return {
      article: json.data,
      related: Array.isArray(json.relatedArticles) ? json.relatedArticles : [],
      random: Array.isArray(json.randomArticles) ? json.randomArticles : [],
    };
  } catch (err) {
    console.error("[api] getArticle failed:", err.message);
    return null;
  }
}

/** Flatten all groups into a single match[] with the parent league attached. */
export function flattenMatches(groups) {
  const out = [];
  for (const g of groups) {
    for (const m of g.matches ?? []) {
      out.push({ ...m, league: g.name || g.nm, leagueFull: g.nm, isCup: !!g.is_cup });
    }
  }
  return out;
}
