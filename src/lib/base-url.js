import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";

/**
 * Absolute site origin derived DYNAMICALLY from the incoming request host
 * (so sitemap/robots are correct on any deploy domain — vercel preview, custom
 * domain, localhost). Falls back to the env SITE_URL when no request context.
 * Server-only (uses next/headers) — import only in server files (sitemap/robots).
 */
/** Build an origin from a Headers-like object (request.headers or next/headers). */
export function baseUrlFromHeaders(h) {
  const host = h?.get?.("x-forwarded-host") || h?.get?.("host");
  if (!host) return SITE_URL;
  const isLocal = host.startsWith("localhost") || host.startsWith("127.");
  const proto = h.get("x-forwarded-proto") || (isLocal ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

export async function getBaseUrl() {
  try {
    return baseUrlFromHeaders(await headers());
  } catch {
    /* headers() unavailable (e.g. build-time) — fall back to env */
    return SITE_URL;
  }
}
