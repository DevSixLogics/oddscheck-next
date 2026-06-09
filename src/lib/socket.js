// Live-socket contract helpers. See the live-match-socket skill.

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

/** Deep-ish merge of a socket match over the existing one (keep API-only fields). */
export function mergeMatch(prev, incoming) {
  return {
    ...prev,
    ...incoming,
    competitors: { ...(prev.competitors || {}), ...(incoming.competitors || {}) },
  };
}
