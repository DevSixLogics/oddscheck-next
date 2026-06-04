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

/** Match status bucket: "live" | "finished" | "upcoming". */
export function statusOf(match) {
  const st = (match.st || "").toLowerCase();
  const sun = (match.sun || "").toLowerCase();
  if (FINISHED.has(st) || st === "finished") return "finished";
  // statusKey 4 = finished in observed data; live feeds carry a running minute.
  if (match.statusKey === 4 || sun === "finished") return "finished";
  if (/half|live|playing|\d/.test(sun) || /'/.test(match.mins || "")) return "live";
  return "upcoming";
}

/** Display score "H-A" using current/final score, falling back to full-time. */
export function score(match) {
  const s = match.cfs || match.ft || "";
  const [h, a] = s.split("-");
  return { home: (h ?? "").trim(), away: (a ?? "").trim(), raw: s };
}

/** Short status label for the right rail: "67'", "HT", "FT", or kickoff time. */
export function statusLabel(match) {
  const bucket = statusOf(match);
  if (bucket === "finished") return match.mins || "FT";
  if (bucket === "live") return match.mins || "LIVE";
  return kickoffTime(match.dt);
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

/** Match-winner markets only (one per bookmaker) — excludes DC / BTTS / etc. */
function winnerMarkets(match) {
  return marketList(match).filter(
    (m) => Array.isArray(m.outcomes) && m.outcomes.length <= 3 && m.outcomes.every((x) => HDA.test(String(x.name ?? "")))
  );
}

const toNum = (v) => (typeof v === "number" ? v : parseFloat(v));

/**
 * Best 1·X·2 price for each outcome ACROSS all bookmakers, or null if no
 * match-winner market is present. `books` = number of bookmakers compared.
 */
export function oddsTriple(match) {
  const markets = winnerMarkets(match);
  if (!markets.length) return null;
  const by = { home: null, draw: null, away: null };
  for (const m of markets) {
    for (const x of m.outcomes) {
      const s = side(x.name);
      const p = toNum(x.odds);
      if (!s || !p) continue;
      if (by[s] == null || p > by[s]) by[s] = p; // best (highest) price wins
    }
  }
  if (by.home == null && by.draw == null && by.away == null) return null;
  // twoWay = a 2-outcome market (tennis, basketball moneyline) — no draw.
  return { ...by, twoWay: by.draw == null, type: markets[0].type, books: markets.length };
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

/** Two-letter crest abbreviation from a team name (logos are not in the API). */
export function initials(name = "") {
  const words = name.replace(/[^\w\s]/g, "").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
