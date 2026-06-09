// Entity image URLs — team logos and league/tournament flags — served from the
// shared stats host. Mirrors the conventions in the entity-images skill.

const ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://betwayscores-v2.6lgx.com/").replace(/\/?$/, "/");

export const DEFAULT_TEAM_IMG = `${ORIGIN}assets/images/placeholderimages/default-team.png`;

/**
 * Team/competitor logo URL (sport-aware), or null when there's no id.
 *  - tennis  → country flag (competitors are players → use their country id)
 *  - cricket → cricket team png (cache-busted)
 *  - others  → /images/{sport}/teams/{id}.png
 */
export function teamImageURL(id, sport = "football") {
  if (!id && id !== 0) return null;
  const s = String(sport || "football").toLowerCase();
  if (s === "tennis") return `${ORIGIN}assets/images/flags/country_${id}.png?version=1.1.0`;
  if (s === "cricket") return `${ORIGIN}images/cricket/teams/${id}.png?version=1.1.0`;
  return `${ORIGIN}images/${s}/teams/${id}.png`;
}

/**
 * League / tournament flag URL by category id (`fid`). Cricket competitions use
 * their own competition-id flag. Returns null when there's no id.
 */
export function leagueFlagURL(fid, sport = "football") {
  if (!fid && fid !== 0) return null;
  const s = String(sport || "football").toLowerCase();
  if (s === "cricket") return `${ORIGIN}assets/images/cricket/flags/${fid}.png`;
  return `${ORIGIN}assets/images/flags/country_${fid}.png`;
}
