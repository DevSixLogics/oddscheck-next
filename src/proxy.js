import { NextResponse } from "next/server";

// Simple site-wide gate (HTTP Basic Auth) — not a real user system, just a
// single shared username/password so the preview isn't open to everyone.
// PREVIEW ONLY: the literal fallbacks below must NOT be relied on in production —
// set BASIC_AUTH_USER / BASIC_AUTH_PASS in the environment, or remove this gate
// entirely once a real auth/session layer exists (see PRODUCTION-READINESS.md).
const USER = process.env.BASIC_AUTH_USER || "oddscheck";
const PASS = process.env.BASIC_AUTH_PASS || "preview2026";

export function proxy(request) {
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
// challenge itself and the logo/favicon can still load).
export const config = {
  matcher: ["/((?!_next/|favicon|oddscheck\\.png|fav_icon\\.ico|og-default\\.svg|robots\\.txt|sitemap\\.xml|goal\\.mp3|crowd-cheers\\.mp3).*)"],
};
