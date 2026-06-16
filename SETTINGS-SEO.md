# CMS-Driven SEO — `/settings` → Metadata & JSON-LD

This document explains how the site's SEO metadata is driven by the CMS `/settings`
API, what every field controls, and how to populate it. **No code change is needed**
to update any of these — fill the field in the CMS and it flows through on the next
revalidate.

- **API:** `GET {NEXT_PUBLIC_API_BASE}/settings` (e.g. `https://cms-oddscheck.hneeds.com/api/v1/settings`)
- **Normalizer:** [`getSiteMeta()`](src/lib/api.js) — maps raw `/settings` fields into a clean, optional-everywhere object.
- **Consumers:** [`src/app/layout.js`](src/app/layout.js) (site-wide metadata + Organization/WebSite JSON-LD) and [`src/app/page.js`](src/app/page.js) (home title).
- Field meanings: [`.claude/instructions/api-reference.md`](../.claude/instructions/api-reference.md).

---

## How it works

```
/settings (CMS)  ──►  getSettings()  ──►  getSiteMeta()  ──►  generateMetadata() + buildSiteSchema()
                                          (normalize/clean)     (layout.js, page.js)
```

`getSiteMeta()` runs `clean()` on every value: strings are trimmed and empty strings
become `null`. Consumers then **omit** any field that is `null` — so a blank CMS field
produces no tag at all (rather than an empty or fake one). Settings are cached with a
5-minute revalidate (`getSettings` → `next: { revalidate: 300 }`).

---

## Field map

`getSiteMeta()` key → raw `/settings` field → what it drives → status today.

| `getSiteMeta` key | `/settings` field | Drives | Currently in CMS |
| --- | --- | --- | --- |
| `siteTitle` | `site_title` | `<title>` (home + template `%s \| {site_title}`), `og:title`, `twitter:title`, Organization + WebSite `name` | `"oddscheck"` ✅ |
| `description` | `short_description` | `<meta name="description">`, `og:description`, `twitter:description` | empty → omitted |
| `ogImage` | `site_og_image` | `og:image`, `twitter:image` | ✅ set |
| `favicon` | `favicon` | `icon`, `shortcut icon`, `apple-touch-icon` | ✅ set |
| `logo` | `header_dark_logo` \|\| `header_light_logo` | Organization JSON-LD `logo` | ✅ set |
| `sameAs` | `social_links[].link` (non-empty) | Organization JSON-LD `sameAs[]` | all empty → omitted |
| `gscCode` | `google_console_code` | `<meta>` Google Search Console verification | null → omitted |
| `gaCode` | `google_analytics_code` | Google Analytics `gtag.js` `<Script>` (only rendered when set) | null → not rendered |
| `email` | `email` | Organization `contactPoint.email` | null → omitted |
| `phone` | `phone_no` | Organization `contactPoint.telephone` | null → omitted |
| `contact.*` | `street_address`, `city`, `state`, `postal_code`, `country` | Organization `address` (PostalAddress) | null → omitted |

### Normalized but not yet wired (available for future use)

| `getSiteMeta` key | `/settings` field | Note |
| --- | --- | --- |
| `siteUrl` | `site_Url` | Not consumed — canonical/sitemap base comes from `NEXT_PUBLIC_SITE_URL` (the production canonical `https://oddscheck.com`), not the CMS staging host. |
| `robotsTxt` | `robots_txt_code` | Not consumed — [`src/app/robots.js`](src/app/robots.js) emits a structured robots policy. Wire this in if the CMS should be able to inject raw robots directives. |
| `address` (flattened string) | joined address parts | Schema uses the structured `contact.*` instead; the flat string is spare. |

---

## What's static (NOT from `/settings`)

These are intentionally **not** CMS-driven and live in code/env:

- `metadataBase` / canonical / sitemap base → `NEXT_PUBLIC_SITE_URL` env (production canonical origin).
- `twitter.card` = `summary_large_image` and `openGraph.type` = `website` — structural enums, not brand data.
- `viewport.themeColor`, `<html lang>` — app config.

---

## How to populate in the CMS

Edit these in the CMS `/settings` admin. Recommended values:

### `short_description` (meta description — aim 150–160 chars)
```
Compare live odds from top UK bookmakers across football, racing, tennis, basketball and 30+ sports. Find the best prices, free bets and betting offers.
```

### `social_links` (drives Organization `sameAs`)
Fill the `link` for each row with your **real, verified** profile URLs (leave blank to omit):
```json
"social_links": [
  { "type": "Facebook",  "link": "https://www.facebook.com/<yourpage>" },
  { "type": "Instagram", "link": "https://www.instagram.com/<yourhandle>" },
  { "type": "Twitter",   "link": "https://x.com/<yourhandle>" },
  { "type": "Telegram",  "link": "https://t.me/<yourchannel>" },
  { "type": "Bluesky",   "link": "https://bsky.app/profile/<yourhandle>" },
  { "type": "Tiktok",    "link": "https://www.tiktok.com/@<yourhandle>" }
]
```

### Others
- `site_title` — set to a properly-cased brand title (the current value is lowercase `"oddscheck"`).
- `google_console_code` — Search Console verification token (enables `verification.google`).
- `google_analytics_code` — GA4 measurement ID (e.g. `G-XXXXXXX`); the GA script renders only when present.
- `email` / `phone_no` / address fields — enrich the Organization contact block.

---

## Verify after editing

With the app running (production build, behind the preview Basic Auth):

```bash
# Title / description / OG / icons come from /settings
curl -s -u oddscheck:preview2026 http://localhost:3939/ | grep -iE '<title>|name="description"|og:image|rel="icon"'

# Organization sameAs / logo / contact in the JSON-LD
curl -s -u oddscheck:preview2026 http://localhost:3939/ | grep -o '"@type":"Organization"[^]]*'
```

A field added in the CMS appears automatically on the next revalidate (≤5 min) or
after a rebuild — no code deploy required.
