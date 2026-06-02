# OddsCheck — Next.js (App Router, JavaScript, Sass)

Next.js port of the static OddsCheck.com build. **Home** and **Football** pages are
wired to the live `cms-oddscheck.hneeds.com` feed; every other page is a static
placeholder (the feed has no data for them — see the gap analysis in
`../.claude/instructions/*-data-coverage-map.html`).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

## Stack

- **Next.js 16** App Router, **JavaScript** (no TypeScript), React 19.
- **Sass**: global design ported 1:1 to `src/app/globals.scss`; component styles are
  `*.module.scss` using the token partial `src/styles/_tokens.scss` (`@use "tokens"`).
  Load path configured in `next.config.mjs` (`sassOptions.loadPaths`).

## What's data-driven (from the API)

| Page | Data used (real API fields) |
|---|---|
| `/` Home — **Scores & results** | live/fixture/finished grouping, team names (`htn`/`atn`), score (`cfs`), live minute (`mins`/`sun`), counts |
| `/football` | competition grouping + `match_count`, team names, kickoff time (`dt`), score, live state, header stats |

The hero "live now" count is also derived from the feed. Everything else on these
pages (odds 1·X·2, bookmakers, offers, tips, news, sparklines, market tabs) is
**static** — the feed returns `odds: null` and has no bookmaker/market data, so those
render as disabled `—` cells or labelled static placeholders (`<StaticNote/>`).

## Data layer

- `src/lib/api.js` — `getFootballMatches(date)`: fetches
  `/football/new-matches?type=all&date=YYYY-MM-DD` for today, falls back to the
  known-good sample date `2026-05-20`, then to the bundled snapshot
  (`src/lib/data/football-new-matches.sample.json`) if the network fails.
  `revalidate: 60` (re-fetch at most once a minute).
- `src/lib/format.js` — kickoff time, status bucket (live/finished/upcoming), score split, crest initials.
- API field meanings: `../.claude/instructions/api-reference.md`.

## Routes

`/` and `/football` (data) · `/live /racing /tennis /basketball /offers /tools
/odds-calculator /tips /tip /news /article /reviews /review /guides /guide /dashboard
/login /signup /about /contact /responsible-gambling /event` (static placeholders) ·
`not-found` (404).

To flesh out a static page, replace its `<PagePlaceholder/>` with a port of the
matching `*.html` from the parent reference build.
