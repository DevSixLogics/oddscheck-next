import { headers, cookies } from "next/headers";

// Server-only: the viewer's IANA timezone, resolved by the proxy middleware from
// the request IP (CMS /timezone?ip=) and exposed as the `x-timezone` request
// header (current request) + `timezone` cookie (subsequent requests). Falls back
// to "UTC" only as a hard last resort — there is no configured default zone.
export async function getViewerTimeZone() {
  try {
    const h = await headers();
    const fromHeader = h.get("x-timezone");
    if (fromHeader) return fromHeader;
  } catch {
    /* headers() unavailable */
  }
  try {
    const c = await cookies();
    const fromCookie = c.get("timezone")?.value;
    if (fromCookie) return fromCookie;
  } catch {
    /* cookies() unavailable */
  }
  return "UTC";
}
