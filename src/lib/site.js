/** Ensure a URL has a protocol and no trailing slash (e.g. "www.x.com" → "https://www.x.com"). */
export function normalizeUrl(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s.replace(/\/+$/, "");
}

// Env-configured fallback origin (used by sitemap, robots and JSON-LD). The
// canonical/OG base in page metadata prefers the CMS `site_url` at runtime — see
// the metadataBase resolution in layout.js — so this only applies when the CMS
// value is unavailable. Set NEXT_PUBLIC_SITE_URL to pin a production domain.
export const SITE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://oddscheck.com");
export const SITE_NAME = "OddsCheck.com";

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
