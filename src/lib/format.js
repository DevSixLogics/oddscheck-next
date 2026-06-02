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

/**
 * 1·X·2 prices from match.odds, or null if the match has no odds yet.
 * The feed carries a single pre-match market with outcomes named H/D/A
 * (Home=1, Draw=X, Away=2) — one bookmaker, no comparison/history.
 */
export function oddsTriple(match) {
  const o = match?.odds;
  if (!o || !Array.isArray(o.outcomes)) return null;
  const by = {};
  for (const x of o.outcomes) by[x.name] = x.odds;
  if (by.H == null && by.D == null && by.A == null) return null;
  return { home: by.H ?? null, draw: by.D ?? null, away: by.A ?? null, type: o.type };
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
