import { NextResponse } from "next/server";

// Simple site-wide gate (HTTP Basic Auth) — not a real user system, just a
// single shared username/password so the preview isn't open to everyone.
// PREVIEW ONLY: the literal fallbacks below must NOT be relied on in production —
// set BASIC_AUTH_USER / BASIC_AUTH_PASS in the environment, or remove this gate
// entirely once a real auth/session layer exists (see PRODUCTION-READINESS.md).
const USER = process.env.BASIC_AUTH_USER || "oddscheck";
const PASS = process.env.BASIC_AUTH_PASS || "preview2026";

// Back-compat: map the old query-string content URLs to the clean path routes.
// Returns a clean (query-free) destination path, or null if no rule matches.
function legacyRedirect(pathname, sp) {
  if (pathname === "/article" && sp.get("slug")) return `/article/${sp.get("slug")}`;
  if (pathname === "/race" && sp.get("id")) return `/race/${sp.get("id")}`;
  if (pathname === "/review" && sp.get("author")) return `/review/${sp.get("author")}`;
  if (pathname === "/event" && sp.get("sport") && sp.get("id")) return `/event/${sp.get("sport")}/${sp.get("id")}`;
  return null;
}

export function proxy(request) {
  // 308-redirect legacy query-string URLs to the clean path (runs before the auth
  // gate so old indexed/bookmarked links consolidate cleanly, no leftover query).
  const dest = legacyRedirect(request.nextUrl.pathname, request.nextUrl.searchParams);
  if (dest) {
    const url = request.nextUrl.clone();
    url.pathname = dest;
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(":");
      const user = decoded.slice(0, i);
      const pass = decoded.slice(i + 1);
      if (user === USER && pass === PASS) return NextResponse.next();
    } catch {
      // fall through to the 401 challenge
    }
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="OddsCheck preview", charset="UTF-8"' },
  });
}

// Gate every route except Next internals and public assets (so the login
// challenge itself and the logo/favicon can still load). The sitemap index
// (sitemap.xml) AND its child sitemaps (sitemap/*.xml) and robots.txt are left
// open so crawlers can fetch them without the Basic-Auth gate.
export const config = {
  matcher: ["/((?!_next/|favicon|oddscheck\\.png|fav_icon\\.ico|og-default\\.svg|robots\\.txt|sitemap\\.xml|sitemap/|goal\\.mp3|crowd-cheers\\.mp3).*)"],
};
