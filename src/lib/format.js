// Pure helpers for turning the raw API fields into display values.
// Field meanings: see .claude/instructions/api-reference.md

/** "2026-05-20 16:45:00" -> "16:45" */
export function kickoffTime(dt) {
  if (!dt) return "";
  const m = /\d{4}-\d{2}-\d{2}[ T](\d{2}:\d{2})/.exec(dt);
  return m ? m[1] : "";
}

/** "2026-05-20 16:45:00" -> "20 May" */
export function kickoffDate(dt) {
  if (!dt) return "";
  const d = new Date(dt.replace(" ", "T"));
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const FINISHED = new Set(["finished", "ft", "aet", "pen"]);
// Matches that will not be played as scheduled — must NOT show as "upcoming".
const OFF = new Set(["cancelled", "canceled", "postponed", "abandoned", "suspended", "walkover", "awarded"]);
const OFF_CODES = new Set(["CAN", "PST", "POSTP", "ABD", "SUSP", "WO", "AWD"]);

/** Match status bucket: "live" | "finished" | "upcoming". */
export function statusOf(match) {
  const st = (match.st || "").toLowerCase();
  const sun = (match.sun || "").toLowerCase();
  const mins = (match.mins || "").toUpperCase();
  // Cricket carries its own status fields (cst/bs), not statusKey/sun/mins.
  const cst = (match.cst || "").toLowerCase();
  const bs = (match.bs || "").toLowerCase();
  if (cst || bs) {
    if (cst === "inprogress" || bs === "live") return "live";
    if (/finish|result|complete|abandon|stump|won|lost|draw/.test(`${cst} ${bs}`)) return "finished";
    if (/scheduled|not started|upcoming|delay|preview/.test(`${bs} ${st}`)) return "upcoming";
  }
  // Cancelled / postponed / abandoned — treat as off (not upcoming, not live).
  if (OFF.has(st) || OFF_CODES.has(mins)) return "finished";
  if (FINISHED.has(st) || st === "finished") return "finished";
  // statusKey 4 = finished in observed data; live feeds carry a running minute.
  if (match.statusKey === 4 || sun === "finished") return "finished";
  if (/half|live|playing|\d/.test(sun) || /'/.test(match.mins || "")) return "live";
  return "upcoming";
}

/** Display score "H-A" using current/final score, falling back to full-time. */
export function score(match) {
  // Cricket scores its own way (hs/as = runs, e.g. "421" and "17/0").
  if (match.hs != null || match.as != null) {
    const home = String(match.hs ?? "").trim();
    const away = String(match.as ?? "").trim();
    return { home, away, raw: home || away };
  }
  const s = match.cfs || match.ft || "";
  const [h, a] = s.split("-");
  return { home: (h ?? "").trim(), away: (a ?? "").trim(), raw: s };
}

/** Short status label for the right rail: "67'", "HT", "FT", or kickoff time. */
export function statusLabel(match) {
  const bucket = statusOf(match);
  if (bucket === "finished") return match.mins || "FT";
  // Cricket has no running minute — fall back to its status text (e.g. "Live").
  if (bucket === "live") return match.mins || match.bs || "LIVE";
  return kickoffTime(match.dt || match.gdt);
}

// Outcome names that belong to the match-winner (1·X·2 / moneyline) market.
const HDA = /^(H|D|A|1|X|2|HOME|DRAW|AWAY)$/i;

/** Normalise an outcome name to home | draw | away (or null for other markets). */
function side(name) {
  const n = String(name ?? "").toUpperCase();
  if (n === "H" || n === "1" || n === "HOME") return "home";
  if (n === "A" || n === "2" || n === "AWAY") return "away";
  if (n === "D" || n === "X" || n === "DRAW") return "draw";
  return null;
}

/**
 * The odds payload as a list of markets. Handles both shapes:
 *  - new `multi_odds=1`: array of { market_id, market_name, bookmaker_name, outcomes }
 *  - legacy: a single { outcomes } object.
 */
function marketList(match) {
  const raw = match?.odds;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.outcomes)) return [raw];
  return [];
}

const toNum = (v) => (typeof v === "number" ? v : parseFloat(v));

/** Sum of implied probabilities (overround) for a market's outcomes, or null. */
function marketOverround(m) {
  let s = 0, n = 0;
  for (const o of m.outcomes || []) {
    const p = toNum(o.odds);
    if (p > 1) { s += 1 / p; n += 1; }
  }
  return n >= 2 ? s : null;
}

/**
 * A trustworthy match-winner market: 2–3 H/D/A outcomes AND a believable
 * overround (~100–150%). This filters out garbage book lines from the feed
 * (e.g. a draw priced odds-on, or a 179% margin) before we compare prices.
 */
function isPlausibleWinnerMarket(m) {
  if (!Array.isArray(m.outcomes) || m.outcomes.length > 3) return false;
  if (!m.outcomes.every((x) => HDA.test(String(x.name ?? "")))) return false;
  const ov = marketOverround(m);
  return ov != null && ov >= 0.995 && ov <= 1.5;
}

/** Match-winner markets only (one per bookmaker) — excludes DC / BTTS / garbage. */
function winnerMarkets(match) {
  return marketList(match).filter(isPlausibleWinnerMarket);
}

function invSum(by) {
  let s = 0;
  if (by.home > 0) s += 1 / by.home;
  if (by.draw > 0) s += 1 / by.draw;
  if (by.away > 0) s += 1 / by.away;
  return s;
}

function lineFrom(market) {
  const by = { home: null, draw: null, away: null };
  for (const x of market.outcomes) {
    const s = side(x.name);
    const p = toNum(x.odds);
    if (s && p) by[s] = p;
  }
  return by;
}

/**
 * Best 1·X·2 price for each outcome ACROSS all (plausible) bookmakers, or null.
 * `books` = number of bookmakers compared. Safety guard: if the cross-book best
 * implies an impossible market (<95% — books contradict / bad data), fall back
 * to the single most-coherent book so we never show a fake "surebet".
 */
export function oddsTriple(match) {
  const markets = winnerMarkets(match);
  if (!markets.length) return null;
  let by = { home: null, draw: null, away: null };
  for (const m of markets) {
    for (const x of m.outcomes) {
      const s = side(x.name);
      const p = toNum(x.odds);
      if (!s || !p) continue;
      if (by[s] == null || p > by[s]) by[s] = p; // best (highest) price wins
    }
  }
  // Impossible combined market → books disagree too much; use the single book
  // with the tightest (most coherent) margin instead of the cross-book max.
  const combined = invSum(by);
  let usedFallback = false;
  if (combined > 0 && combined < 0.95) {
    const tightest = markets
      .map((m) => ({ m, ov: marketOverround(m) }))
      .filter((o) => o.ov != null)
      .sort((a, b) => a.ov - b.ov)[0];
    if (tightest) { by = lineFrom(tightest.m); usedFallback = true; }
  }
  if (by.home == null && by.draw == null && by.away == null) return null;
  // twoWay = a 2-outcome market (tennis, basketball moneyline) — no draw.
  // On the fallback path the displayed line comes from ONE book, so report 1 —
  // not markets.length — to avoid implying a comparison that didn't happen.
  return { ...by, twoWay: by.draw == null, type: markets[0].type, books: usedFallback ? 1 : markets.length };
}

// Order 1·X·2 outcomes Home, Draw, Away; everything else keeps feed order.
const OUTCOME_ORDER = { h: 0, "1": 0, home: 0, d: 1, x: 1, draw: 1, a: 2, "2": 2, away: 2 };

/**
 * Group a match's odds by market for the event comparison tabs. Returns
 * [{ name, outcomes:[outcomeName], rows:[{ bookmaker, link, prices:{[outcome]:odds} }], best:{[outcome]:odds} }].
 * Works for any market (1x2, BTTS, Over/Under …) — outcomes are whatever the feed sends.
 */
export function oddsMarkets(match) {
  const groups = new Map();
  for (const m of marketList(match)) {
    const name = (m.market_name || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!groups.has(key)) groups.set(key, { name, outcomes: [], rows: [] });
    const g = groups.get(key);
    const prices = {};
    for (const o of m.outcomes || []) {
      const on = String(o.name ?? "").trim();
      const p = toNum(o.odds);
      if (!on || !(p > 1)) continue;
      prices[on] = p;
      if (!g.outcomes.includes(on)) g.outcomes.push(on);
    }
    if (Object.keys(prices).length) g.rows.push({ bookmaker: m.bookmaker_name || "Bookmaker", link: m.oddsTrackingLink || null, prices });
  }
  const out = [];
  for (const g of groups.values()) {
    if (!g.rows.length) continue;
    g.outcomes.sort((x, y) => (OUTCOME_ORDER[x.toLowerCase()] ?? 9) - (OUTCOME_ORDER[y.toLowerCase()] ?? 9));
    const best = {};
    for (const oc of g.outcomes) {
      let b = null;
      for (const r of g.rows) { const p = r.prices[oc]; if (p > 1 && (b == null || p > b)) b = p; }
      best[oc] = b;
    }
    out.push({ name: g.name, outcomes: g.outcomes, rows: g.rows, best });
  }
  // Every market the feed prices becomes its own tab (1x2, Double Chance, BTTS …) —
  // names are whatever the API returns, no static market list.
  return out;
}

/** Display label for an outcome code — maps 1·X·2 to team names, else the raw name. */
export function outcomeLabel(name, home, away) {
  const n = String(name ?? "").toUpperCase();
  if (n === "H" || n === "1" || n === "HOME") return home || "Home";
  if (n === "A" || n === "2" || n === "AWAY") return away || "Away";
  if (n === "D" || n === "X" || n === "DRAW") return "Draw";
  return name;
}

/** Distinct market names present in a match's odds (e.g. ["1x2", "Double Chance"]). */
export function marketNames(match) {
  const names = [];
  const seen = new Set();
  for (const m of marketList(match)) {
    const n = (m.market_name || "").trim();
    if (n && !seen.has(n.toLowerCase())) { seen.add(n.toLowerCase()); names.push(n); }
  }
  return names;
}

/** The market name of the (plausible) winner market, e.g. "1x2" / "Moneyline", or null. */
export function winnerMarketLabel(match) {
  for (const m of winnerMarkets(match)) {
    const n = (m.market_name || "").trim();
    if (n) return n;
  }
  return null;
}

/**
 * Per-bookmaker 1·X·2 rows for the event comparison table.
 * Returns [{ bookmaker, home, draw, away, link }] sorted best-home first.
 */
export function bookmakerRows(match) {
  return winnerMarkets(match)
    .map((m) => {
      const row = { bookmaker: m.bookmaker_name || "Bookmaker", home: null, draw: null, away: null, link: m.oddsTrackingLink || null };
      for (const x of m.outcomes) {
        const s = side(x.name);
        const p = toNum(x.odds);
        if (s && p) row[s] = p;
      }
      return row;
    })
    .filter((r) => r.home != null || r.away != null)
    .sort((a, b) => (b.home ?? 0) - (a.home ?? 0));
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/** Decimal odds → fractional string (e.g. 2.5 → "3/2", 6 → "5/1"). */
function toFractional(dec) {
  const frac = dec - 1;
  if (frac <= 0) return "—";
  let bestN = 1, bestD = 1, err = Infinity;
  for (let d = 1; d <= 50; d++) {
    const n = Math.round(frac * d);
    if (n < 1) continue;
    const e = Math.abs(frac - n / d);
    if (e < err - 1e-9) { err = e; bestN = n; bestD = d; }
  }
  const g = gcd(bestN, bestD) || 1;
  return `${bestN / g}/${bestD / g}`;
}

/** Decimal odds → American moneyline (e.g. 2.5 → "+150", 1.5 → "-200"). */
function toAmerican(dec) {
  if (dec >= 2) return `+${Math.round((dec - 1) * 100)}`;
  if (dec > 1) return `${Math.round(-100 / (dec - 1))}`;
  return "—";
}

/**
 * Format a decimal odds value for display in the user's chosen format.
 * fmt = "Decimal" | "Fractional" | "American". Falls back to "—" for non-numbers.
 */
export function formatOdds(value, fmt = "Decimal") {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!n || Number.isNaN(n)) return "—";
  if (fmt === "Fractional") return toFractional(n);
  if (fmt === "American") return toAmerican(n);
  return n.toFixed(2);
}

/** "2026-06-02 07:51:55" -> "37 min ago" / "2h ago" / "3d ago" / "12 May". */
export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const then = new Date(dateStr.replace(" ", "T"));
  if (isNaN(then)) return "";
  const sec = Math.max(0, (Date.now() - then.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Two-letter crest abbreviation from a team/author name (logos are not in the API). */
export function initials(name) {
  const clean = String(name ?? "").replace(/[^\w\s]/g, "").trim();
  if (!clean) return "OC";
  const words = clean.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
