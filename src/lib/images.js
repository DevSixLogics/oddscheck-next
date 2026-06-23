// Entity image URLs — team/competitor logos and league country flags.
//
// Served by the iPublisher image service on the STORAGE host (not the `cms-` API
// host), e.g.
//   https://oddscheck.hneeds.com/v1/sports/{sport}/competitor-logos/{id}.png
//   ?initials=XX&bg=ffffff&fg=000000
// The service renders a themed initials placeholder (the initials/bg/fg query)
// when there's no real logo, so the endpoint NEVER 404s. We resolve the host
// from config (derived from the API base) instead of hardcoding a themed CDN.

import { initials } from "./format";

// Image/storage origin. Prefer an explicit override; otherwise derive it from the
// API base by dropping the `/api/v1` path and the `cms-` API-subdomain prefix
// (iPublisher convention: the API lives on cms-<host>, images on the bare <host>).
function resolveImageBase() {
  const explicit = process.env.NEXT_PUBLIC_IMAGE_BASE;
  if (explicit) return explicit.replace(/\/+$/, "");
  try {
    const u = new URL(process.env.NEXT_PUBLIC_API_BASE || "https://cms-oddscheck.hneeds.com/api/v1");
    u.hostname = u.hostname.replace(/^cms-/, "");
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://oddscheck.hneeds.com";
  }
}

const IMAGE_BASE = resolveImageBase();

// The image service uses canonical sport slugs for a few sports.
const SPORT_REMAP = { "ice-hockey": "hockey", "rugby-union": "rugby", "rugby-league": "rugby" };
const apiSport = (sport) => {
  const s = String(sport || "football").toLowerCase();
  return SPORT_REMAP[s] || s;
};

// 2-letter code seeding the backend-rendered initials placeholder.
const placeholderInitials = (name) => initials(name).slice(0, 2);

/**
 * Team/competitor logo URL (all sports, cricket included). The service renders an
 * initials placeholder when there's no real logo, so this never 404s — `name`
 * seeds that placeholder. Returns null only when there's no usable id.
 */
export function teamImageURL(id, sport = "football", name = "") {
  if (id == null || id === "" || id === "none") return null;
  const q = `initials=${encodeURIComponent(placeholderInitials(name))}&bg=ffffff&fg=000000`;
  return `${IMAGE_BASE}/v1/sports/${apiSport(sport)}/competitor-logos/${id}.png?${q}`;
}

/**
 * League / tournament image = its country flag, served from the app's OWN static
 * assets (public/ip/assets/images/flags/country_{fid}.png), keyed by the league's
 * category flag id (`fid`) — NOT a remote endpoint. Country flags are the same
 * file across sports, so `fid` is all that's needed. Returns null when there's no
 * id; the <Flag> component also renders nothing if the file 404s.
 */
export function leagueFlagURL(fid) {
  if (fid == null || fid === "" || fid === "none") return null;
  return `/ip/assets/images/flags/country_${fid}.png`;
}
