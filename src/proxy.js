import { NextResponse } from "next/server";

// The site is fully public — the old HTTP Basic-Auth preview gate has been removed.
// This middleware now only 308-redirects the legacy query-string content URLs to
// their clean path routes so old indexed/bookmarked links keep working.
function legacyRedirect(pathname, sp) {
  if (pathname === "/article" && sp.get("slug")) return `/article/${sp.get("slug")}`;
  if (pathname === "/race" && sp.get("id")) return `/race/${sp.get("id")}`;
  if (pathname === "/review" && sp.get("author")) return `/review/${sp.get("author")}`;
  if (pathname === "/event" && sp.get("sport") && sp.get("id")) return `/event/${sp.get("sport")}/${sp.get("id")}`;
  return null;
}

export function proxy(request) {
  const dest = legacyRedirect(request.nextUrl.pathname, request.nextUrl.searchParams);
  if (dest) {
    const url = request.nextUrl.clone();
    url.pathname = dest;
    url.search = "";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Only run on the legacy query-string content paths that need redirecting; every
// other route is served directly (no gate). Clean paths like /article/[slug] have
// their own pathname and are not matched here.
export const config = {
  matcher: ["/article", "/race", "/review", "/event"],
};
