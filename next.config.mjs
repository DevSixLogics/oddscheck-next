import path from "node:path";

// Hosts the app talks to at runtime (API + realtime socket) — used to scope the
// Content-Security-Policy connect-src so we don't have to open it to the world.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://cms-oddscheck.hneeds.com/api/v1";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKETURL || "https://socket.ipublisher.app/";
// Image/storage host: the iPublisher image service lives on the bare host, not the
// `cms-` API host. Prefer the explicit override; else derive from the API base.
const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE ||
  API_BASE.replace("://cms-", "://").replace(/\/api\/v1\/?$/, "");

const hostOf = (u) => {
  try { return new URL(u).origin; } catch { return ""; }
};

const API_ORIGIN = hostOf(API_BASE);
const SOCKET_ORIGIN = hostOf(SOCKET_URL);
const IMAGE_ORIGIN = hostOf(IMAGE_BASE);
const WS_ORIGIN = SOCKET_ORIGIN.replace(/^http/, "ws");

// Content-Security-Policy. Next's runtime + our inline JSON-LD/inline styles need
// 'unsafe-inline'; tighten to a nonce later if the inline-style usage is removed.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${API_ORIGIN} ${SOCKET_ORIGIN} ${WS_ORIGIN} ${IMAGE_ORIGIN}`.trim(),
  "media-src 'self'",
  "frame-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This project has its own lockfile; pin the tracing root to silence the
  // "multiple lockfiles" workspace-root warning.
  htmlLimitedBots:
    /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Applebot|PetalBot|SemrushBot|AhrefsBot|MJ12bot|DotBot|Screaming Frog|ClaudeBot|Claude-Web|anthropic-ai|GPTBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|PerplexityBot\/|Google-Extended|CCBot|Bytespider|Amazonbot|Applebot-Extended|cohere-ai|Diffbot|YouBot|Meta-ExternalAgent|Meta-ExternalFetcher/,

  outputFileTracingRoot: path.join(process.cwd()),
  sassOptions: {
    // Modern Dart-Sass API uses loadPaths; lets modules do `@use "tokens"`.
    loadPaths: [path.join(process.cwd(), "src/styles")],
    includePaths: [path.join(process.cwd(), "src/styles")],
  },
  // Allow the iPublisher image host (team/competitor logos) so a future
  // <img> → next/image migration is a drop-in. League flags are local (public/).
  images: {
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "*.hneeds.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Sitemap index at the canonical /sitemap.xml + flat /sitemap-{group}.xml
  // children (sitemap-pages.xml, sitemap-sports.xml, …). We can't use Next's
  // metadata sitemap convention here (the root [slug] catch-all shadows it) nor
  // route handlers literally named *.xml (reserved metadata name → Turbopack
  // panic), so these public URLs rewrite to the real handler at /sitemap/{id}.
  // beforeFiles → beats the [slug] catch-all.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap/index.xml" },
        { source: "/sitemap-pages.xml", destination: "/sitemap/pages.xml" },
        { source: "/sitemap-news.xml", destination: "/sitemap/news.xml" },
        { source: "/sitemap-matches.xml", destination: "/sitemap/matches.xml" },
        { source: "/sitemap-experts.xml", destination: "/sitemap/experts.xml" },
        { source: "/sitemap-offers.xml", destination: "/sitemap/offers.xml" },
        { source: "/sitemap-guides.xml", destination: "/sitemap/guides.xml" },
        { source: "/sitemap-sports.xml", destination: "/sitemap/sports.xml" },
      ],
    };
  },
};

export default nextConfig;
