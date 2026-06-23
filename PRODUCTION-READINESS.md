# Production Readiness

This document tracks the production-readiness work for the OddsCheck Next.js app and,
crucially, the items that **cannot be fixed inside this repository** and must be owned
(or formally waived) by the platform/infra team before sign-off.

It accompanies the external "Front-End Production Readiness Audit". Re-run that audit at
any time with the **`/production-audit`** slash command (see
[`.claude/commands/production-audit.md`](../.claude/commands/production-audit.md)).

---

## ✅ Done in this repo (code fixes)

| Area | What shipped |
|---|---|
| **SEO** | Dynamic [`sitemap.js`](src/app/sitemap.js) (static routes + CMS articles + experts) and [`robots.js`](src/app/robots.js) pointing at our own sitemap. |
| **Structured data** | JSON-LD via [`JsonLd.js`](src/components/JsonLd.js): Organization + WebSite (SearchAction) site-wide, NewsArticle + Breadcrumb on articles, SportsEvent + Breadcrumb on events. |
| **Canonical** | `metadataBase` + per-page `alternates.canonical` on home, article, event, news, experts, experts/[slug], guides, and the dynamic `[slug]` routes. Query-string URLs are used as canonical **for now** (clean-URL migration deferred — see below). |
| **Security headers** | [`next.config.mjs`](next.config.mjs) `headers()`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. |
| **HTML sanitization** | The only `dangerouslySetInnerHTML` (article body) is sanitized with `isomorphic-dompurify`; CSP is the second layer. |
| **Auth honesty** | Login/Signup forms no longer fake a session redirect — they show a "preview — accounts not enabled" notice. The site is publicly accessible (the preview HTTP Basic Auth gate has been removed). |
| **Accessibility** | Removed all `href="#"` dead links; real `alt` text on content images; replaced fake disabled news tabs with a non-interactive label. Skip-link, focus-visible and `not-found.js` already existed. |
| **Resilience** | Global [`error.js`](src/app/error.js) and [`loading.js`](src/app/loading.js) route boundaries. |
| **Observability hook** | [`WebVitals.js`](src/components/WebVitals.js) (Core Web Vitals) — logs in dev, single hook point for an analytics/Sentry sink. |
| **Tooling** | Flat ESLint config (`eslint-config-next`), Vitest unit tests for `lib/format.js`, Playwright + axe smoke suite, GitHub Actions CI. |

---

## ⛔ Infra-only items — MUST be owned or waived before production

These are out of scope for the front-end repo. Each needs an owner and a decision
(implement / accept-risk-with-waiver) before go-live.

### 1. Secrets & auth
- [x] **Preview Basic-Auth gate removed.** The site-wide HTTP Basic Auth proxy
      (`src/proxy.js`) and its `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` env vars have been
      removed — all pages are now publicly accessible.
- [ ] **Real authentication / sessions.** Login & Signup are non-functional placeholders.
      A real backend session layer (and `/dashboard` protection) is required before
      advertising accounts.
- [ ] Confirm `.env*.local` is git-ignored and no secrets are committed.

### 2. CDN / origin / scale
- [ ] CDN cache policy for static & ISR assets; `stale-if-error` / `stale-while-revalidate`.
- [ ] Origin shielding in front of the CMS (`cms-oddscheck.hneeds.com`).
- [ ] API rate-limiting / quota and a documented fallback when the CMS is down.
- [ ] Load-test targets (RPS, p95 latency) and a passing run on staging.
- [ ] Realtime socket (`NEXT_PUBLIC_SOCKETURL`) capacity & reconnection behaviour under load.

### 3. Observability evidence
- [ ] Wire `WebVitals` to a real sink (analytics + Sentry DSN) and verify dashboards.
- [ ] Error monitoring / alerting on the `error.js` boundary and server logs.
- [ ] Uptime / synthetic checks on key routes.

### 4. SEO operations
- [ ] Set the production `NEXT_PUBLIC_SITE_URL` (canonical/sitemap base; defaults to
      `https://oddscheck.com`).
- [ ] Submit `sitemap.xml` in Google Search Console; verify indexing & structured-data
      eligibility (Rich Results test).
- [ ] Provide a real `/og-default` image and per-section OG art.

### 5. Deferred refactors (decision-logged, not blocking)
- [ ] **Clean-URL migration.** Pages currently use query strings
      (`/article?slug=…`, `/event?sport=…&id=…`). Canonical tags are in place now; the
      route-family migration to `/article/[slug]` etc. is deferred by decision.
- [ ] **`<img>` → `next/image`.** `images.remotePatterns` is already configured in
      `next.config.mjs`, so this is a drop-in when prioritised.
- [ ] **TypeScript migration** (currently JavaScript).
- [ ] **Full sports entity graph** (teams/players/standings structured data) — needs
      feeds that don't currently exist in the CMS.

---

## Verification quick-reference

```bash
npm install
npm run lint          # eslint .
npm run test          # vitest unit tests (lib/format)
npm run build         # clean production build
npm run test:e2e      # playwright smoke + axe (builds & serves automatically)
```

Manual spot-checks (with the app running behind Basic Auth):
- `GET /sitemap.xml` → XML with real article/expert URLs
- `GET /robots.txt` → `Sitemap:` points at our own domain
- `curl -I /` → CSP / HSTS / X-Frame-Options / Referrer-Policy / Permissions-Policy present
- View source of `/article?slug=…` → `application/ld+json` NewsArticle present
- View source of `/event?sport=…&id=…` → SportsEvent present
- No `href="#"` in rendered home/news/tools/login/signup
