// Data access for the cms-oddscheck CMS.
// The fixtures/results feed exists per sport at /{sport}/new-matches and
// /{sport}/match/{id}/detail with the same shape (groups → matches → competitors,
// optional 1·X·2 odds). Football also ships a bundled fallback sample.
// See .claude/instructions/*-data-coverage-map.html for the gap analysis.

import sample from "./data/football-new-matches.sample.json";

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

async function fetchMatches(sport, date) {
  // multi_odds=1 → `odds` is an array of per-bookmaker markets (1x2, DC, BTTS…).
  const url = `${API_BASE}/${sport}/new-matches?type=all&date=${date}&multi_odds=1`;
  const res = await fetch(url, {
    // Treat as live-ish data; re-fetch at most once per REVALIDATE window.
    next: { revalidate: REVALIDATE },
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
    const res = await fetch(`${API_BASE}/${sport}/match/${id}/detail?multi_odds=1`, {
      next: { revalidate: REVALIDATE },
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
      out.push({ ...m, league: g.name || g.nm, leagueFull: g.nm, isCup: !!g.is_cup });
    }
  }
  return out;
}
