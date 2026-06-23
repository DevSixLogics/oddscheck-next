// Live-socket contract helpers. See the live-match-socket skill.

import { score, statusOf, oddsTriple } from "@/lib/format";

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKETURL || "";

// Tier-1 listing event per sport (channel is always "IPUB"). Sports not listed
// have no live socket — don't subscribe.
const SPORT_EVENT = {
  football: "FootballLiveMatches",
  basketball: "BBMatchesUpdated",
  tennis: "TTMatchesUpdated",
  cricket: "CRICMatchesUpdated",
  hockey: "BBMatchesUpdated",
  "rugby-league": "RBMatchesUpdated",
  "rugby-union": "RBUnMatchesUpdated",
};

export function getSocketSportEvent(sport) {
  return SPORT_EVENT[sport] || "";
}

/**
 * Flatten a Tier-1 payload (`e.data` = array of leagues, each with `matches`)
 * into a flat match[] tagged with the parent league id.
 */
export function flattenSocketLeagues(data) {
  const out = [];
  for (const lg of Array.isArray(data) ? data : []) {
    for (const m of lg.matches || []) out.push({ ...m, tournament_id: m.tournament_id ?? lg.id });
  }
  return out;
}

/**
 * Compact fingerprint of a match's visible, mutable data — score, status,
 * clock/minute and the 1·X·2 best prices. Lets mergeMatch tell whether an
 * update actually changed anything worth highlighting (vs an identical resend).
 */
export function matchSignature(m) {
  if (!m) return "";
  const s = score(m);
  const t = oddsTriple(m) || {};
  return JSON.stringify([
    s.home, s.away, statusOf(m),
    m.mins ?? "", m.sun ?? "", m.min ?? "", m.cst ?? "", m.bs ?? "",
    t.home ?? null, t.draw ?? null, t.away ?? null,
  ]);
}

/** Deep-ish merge of a socket match over the existing one (keep API-only fields). */
export function mergeMatch(prev, incoming) {
  const merged = {
    ...prev,
    ...incoming,
    competitors: { ...(prev?.competitors || {}), ...(incoming?.competitors || {}) },
  };
  // Stamp the moment of a *material* change (score / odds / status / clock) so
  // cards can briefly highlight the updated match, then revert to normal. An
  // identical resend keeps the previous stamp, so it doesn't re-trigger a flash.
  merged._updatedAt =
    matchSignature(prev) !== matchSignature(merged) ? Date.now() : (prev?._updatedAt ?? null);
  return merged;
}
