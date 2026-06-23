import { NextResponse, userAgent } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://cms-oddscheck.hneeds.com/api/v1";
const ONE_YEAR = 60 * 60 * 24 * 365;

// 308-redirect the legacy query-string content URLs to their clean path routes so
// old indexed/bookmarked links keep working.
function legacyRedirect(pathname, sp) {
  if (pathname === "/article" && sp.get("slug")) return `/article/${sp.get("slug")}`;
  if (pathname === "/race" && sp.get("id")) return `/race/${sp.get("id")}`;
  if (pathname === "/review" && sp.get("author")) return `/review/${sp.get("author")}`;
  if (pathname === "/event" && sp.get("sport") && sp.get("id")) return `/event/${sp.get("sport")}/${sp.get("id")}`;
  return null;
}

function clientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

export async function proxy(request) {
  // 1) Legacy query-string → clean-path redirects.
  const dest = legacyRedirect(request.nextUrl.pathname, request.nextUrl.searchParams);
  if (dest) {
    const url = request.nextUrl.clone();
    url.pathname = dest;
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  // 2) Resolve the viewer's timezone from their IP (CMS /timezone?ip=) the first
  //    time we see them, cache it in cookies, and forward it to THIS render via
  //    the x-timezone request header so even the first page is rendered in the
  //    right zone (no flash). No fixed default — unresolved → pages fall back to
  //    UTC. Bots are skipped (they'd get UTC; avoids a CMS call on every crawl).
  let tz = request.cookies.get("timezone")?.value;
  let offset = request.cookies.get("difference")?.value;
  let country = request.cookies.get("locinfo")?.value;

  if (!tz && !userAgent(request).isBot) {
    try {
      const ip = clientIp(request);
      const res = await fetch(`${API_BASE}/timezone${ip ? `?ip=${encodeURIComponent(ip)}` : ""}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = (await res.json())?.data;
        tz = data?.timezone || tz;
        offset = data?.utc_offset || offset;
        country = data?.country_code || country;
      }
    } catch {
      /* CMS unreachable — leave tz unset; pages fall back to UTC */
    }
  }

  const requestHeaders = new Headers(request.headers);
  if (tz) requestHeaders.set("x-timezone", tz);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (tz) response.cookies.set("timezone", tz, { maxAge: ONE_YEAR, path: "/" });
  if (offset) response.cookies.set("difference", offset, { maxAge: ONE_YEAR, path: "/" });
  if (country) response.cookies.set("locinfo", country, { maxAge: ONE_YEAR, path: "/" });
  return response;
}

// Run on all page routes (to set/forward the timezone), excluding api, Next
// internals, and any path with a file extension (sitemap*.xml, robots.txt, …).
// The legacy content paths match this too, so their 308 redirects still fire.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
