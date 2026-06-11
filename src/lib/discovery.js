// Discovery tools — scan the live multi-bookmaker odds feed for opportunities.
// Reuses bookmakerRows() (already filters to plausible 1·X·2 markets and removes
// garbage book lines) so we never surface fake surebets. Data caveat: the feed
// exposes match-winner / DC / BTTS markets but no point-spread or total lines, so
// the Middling scan is genuinely limited (see scanMiddles).

import { getMatches, flattenMatches, getOffers } from "./api";
import { bookmakerRows, statusOf, kickoffTime } from "./format";

const SCAN_SPORTS = ["football", "tennis", "basketball", "cricket"];

const round2 = (n) => Math.round(n * 100) / 100;

/** Pre-match / live matches across the scan sports, each tagged with its sport. */
async function scanMatches() {
  const perSport = await Promise.all(
    SCAN_SPORTS.map(async (sport) => {
      try {
        const { groups } = await getMatches(sport);
        return flattenMatches(groups).map((m) => ({ ...m, sport }));
      } catch {
        return [];
      }
    })
  );
  return perSport.flat().filter((m) => statusOf(m) !== "finished");
}

/** Shared match descriptor for an opportunity card. */
function matchInfo(m) {
  const c = m.competitors || {};
  return {
    id: m.id,
    sport: m.sport,
    home: c.htn || "Home",
    away: c.atn || "Away",
    league: m.league || m.leagueFull || "",
    kickoff: kickoffTime(m.dt || m.gdt),
    live: statusOf(m) === "live",
  };
}

const sideLabel = (side, info) => (side === "home" ? info.home : side === "away" ? info.away : "Draw");
const sideSymbol = { home: "1", draw: "X", away: "2" };

/**
 * Arbitrage Finder — for each match, the best price per outcome across books.
 * If the combined implied probability is < 100% it's a surebet. Floor at 95%
 * (matching oddsTriple's guard) so contradictory/garbage lines don't show.
 */
export async function scanArbitrage() {
  const matches = await scanMatches();
  const out = [];
  for (const m of matches) {
    const rows = bookmakerRows(m);
    if (rows.length < 2) continue;
    const threeWay = rows.some((r) => r.draw != null);
    const sides = threeWay ? ["home", "draw", "away"] : ["home", "away"];

    const best = {};
    let complete = true;
    for (const side of sides) {
      let top = null;
      for (const r of rows) {
        const p = r[side];
        if (typeof p === "number" && p > 1 && (!top || p > top.odds)) top = { odds: p, book: r.bookmaker };
      }
      if (!top) { complete = false; break; }
      best[side] = top;
    }
    if (!complete) continue;

    const combined = sides.reduce((s, side) => s + 1 / best[side].odds, 0);
    if (!(combined >= 0.95 && combined < 1)) continue; // surebet, sane range only

    const info = matchInfo(m);
    out.push({
      ...info,
      marketPct: round2(combined * 100),
      profitPct: round2((1 / combined - 1) * 100),
      legs: sides.map((side) => ({ sym: sideSymbol[side], pick: sideLabel(side, info), odds: round2(best[side].odds), book: best[side].book })),
    });
  }
  return out.sort((a, b) => b.profitPct - a.profitPct).slice(0, 24);
}

/**
 * +EV Bets — derive a no-vig "fair" probability per outcome from the bookmaker
 * consensus (average implied, normalised to remove margin), then flag any single
 * book paying meaningfully above fair. Edge bounded to 2–25% (above that = bad data).
 */
export async function scanValue() {
  const matches = await scanMatches();
  const out = [];
  for (const m of matches) {
    const rows = bookmakerRows(m);
    if (rows.length < 3) continue; // need a consensus
    const threeWay = rows.some((r) => r.draw != null);
    const sides = threeWay ? ["home", "draw", "away"] : ["home", "away"];

    // Average implied probability per side across books that price it.
    const implied = {};
    let ok = true;
    for (const side of sides) {
      const ps = rows.map((r) => r[side]).filter((p) => typeof p === "number" && p > 1);
      if (ps.length < 2) { ok = false; break; }
      implied[side] = ps.reduce((s, p) => s + 1 / p, 0) / ps.length;
    }
    if (!ok) continue;
    const sum = sides.reduce((s, side) => s + implied[side], 0);
    if (!(sum > 0)) continue;

    const info = matchInfo(m);
    for (const side of sides) {
      const fairProb = implied[side] / sum; // no-vig fair probability
      const fairOdds = 1 / fairProb;
      for (const r of rows) {
        const price = r[side];
        if (typeof price !== "number" || price <= 1) continue;
        const edge = price * fairProb - 1; // EV per £1 staked
        if (edge >= 0.02 && edge <= 0.25) {
          out.push({
            ...info,
            sym: sideSymbol[side],
            pick: sideLabel(side, info),
            book: r.bookmaker,
            odds: round2(price),
            fairOdds: round2(fairOdds),
            edgePct: round2(edge * 100),
          });
        }
      }
    }
  }
  return out.sort((a, b) => b.edgePct - a.edgePct).slice(0, 30);
}

/**
 * Middling Opportunities — best-effort. A true middle needs two overlapping
 * total/handicap LINES (e.g. Over 2.5 at one book, Under 3.5 at another). The
 * feed's markets carry outcome names + prices but no exposed line value, so we
 * parse any "Over/Under N" outcome names we can find and look for a gap. In
 * practice this returns nothing until the feed exposes line markets.
 */
export async function scanMiddles() {
  const matches = await scanMatches();
  const out = [];
  const lineRe = /(over|under)\s*(\d+(?:\.\d+)?)/i;
  for (const m of matches) {
    const markets = Array.isArray(m.odds) ? m.odds : [];
    const overs = []; // { line, odds, book }
    const unders = [];
    for (const mk of markets) {
      for (const o of mk.outcomes || []) {
        const hit = lineRe.exec(String(o.name ?? ""));
        const price = typeof o.odds === "number" ? o.odds : parseFloat(o.odds);
        if (!hit || !(price > 1)) continue;
        const rec = { line: parseFloat(hit[2]), odds: price, book: mk.bookmaker_name || "Bookmaker" };
        (hit[1].toLowerCase() === "over" ? overs : unders).push(rec);
      }
    }
    // A middle: back Over at the lower line AND Under at the higher line.
    for (const ov of overs) {
      for (const un of unders) {
        if (un.line > ov.line && un.book !== ov.book) {
          const info = matchInfo(m);
          out.push({
            ...info,
            range: `${ov.line}–${un.line}`,
            legs: [
              { pick: `Over ${ov.line}`, odds: round2(ov.odds), book: ov.book },
              { pick: `Under ${un.line}`, odds: round2(un.odds), book: un.book },
            ],
          });
        }
      }
    }
  }
  return out.slice(0, 24);
}

/**
 * Price Boosts Aggregator — real boost offers pulled from the best-betting-offers
 * feed (articles whose headline / key_values mention a boost or enhanced price).
 */
export async function scanBoosts() {
  const offers = await getOffers({ perPage: 24 });
  const isBoost = (o) => /boost|enhanc|price.?up|special|acca.?insur/i.test(`${o.headline} ${o.key_values} ${o.strapline}`);
  const picked = offers.filter(isBoost);
  const list = picked.length ? picked : offers; // fall back to all offers if none tagged
  return list.slice(0, 12).map((o) => ({
    headline: o.headline,
    strapline: o.strapline || "",
    slug: o.slug,
    book: o.authorName || o.subjects?.[0]?.name || "Bookmaker",
    bookSlug: (o.authorSlug || "").toLowerCase(),
  }));
}
