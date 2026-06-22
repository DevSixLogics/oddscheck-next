/** Ensure a URL has a protocol and no trailing slash (e.g. "www.x.com" → "https://www.x.com"). */
export function normalizeUrl(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s.replace(/\/+$/, "");
}

// Env-configured origin (used by sitemap, robots and JSON-LD). Comes from the
// NEXT_PUBLIC_SITE_URL environment variable — no production domain is hardcoded.
// Falls back to localhost for local dev when the env var isn't set. The
// canonical/OG base in page metadata prefers the CMS `site_url` at runtime (see
// the metadataBase resolution in layout.js); this applies when that's absent.
export const SITE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
export const SITE_NAME = "OddsCheck.com";

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
