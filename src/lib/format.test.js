import { describe, it, expect } from "vitest";
import {
  initials,
  statusOf,
  score,
  formatOdds,
  oddsTriple,
  oddsMarkets,
  oddsLineCount,
  outcomeLabel,
  marketNames,
  kickoffTime,
  kickoffDate,
  kickoffLabel,
  localDay,
  todayInZone,
  tzOffsetMinutes,
} from "./format.js";

describe("initials", () => {
  it("returns OC for null/empty/undefined", () => {
    expect(initials(null)).toBe("OC");
    expect(initials(undefined)).toBe("OC");
    expect(initials("")).toBe("OC");
    expect(initials("  ")).toBe("OC");
  });
  it("takes first+last initial for multi-word names", () => {
    expect(initials("Manchester United")).toBe("MU");
    expect(initials("James Patrick Murphy")).toBe("JM");
  });
  it("takes first two letters of a single word", () => {
    expect(initials("Arsenal")).toBe("AR");
  });
  it("strips punctuation", () => {
    expect(initials("A.C. Milan")).toBe("AM");
  });
});

describe("statusOf", () => {
  it("flags finished matches", () => {
    expect(statusOf({ st: "finished" })).toBe("finished");
    expect(statusOf({ st: "ft" })).toBe("finished");
    expect(statusOf({ statusKey: 4 })).toBe("finished");
  });
  it("treats off matches (postponed/cancelled) as not upcoming", () => {
    expect(statusOf({ st: "postponed" })).toBe("finished");
    expect(statusOf({ mins: "PST" })).toBe("finished");
  });
  it("flags live matches via running minute", () => {
    expect(statusOf({ mins: "67'" })).toBe("live");
    expect(statusOf({ sun: "1st half" })).toBe("live");
  });
  it("defaults to upcoming", () => {
    expect(statusOf({})).toBe("upcoming");
    expect(statusOf({ st: "scheduled" })).toBe("upcoming");
  });
  it("handles cricket status fields", () => {
    expect(statusOf({ cst: "inprogress" })).toBe("live");
    expect(statusOf({ bs: "live" })).toBe("live");
  });
});

describe("score", () => {
  it("reads the cfs scoreline for football even when the aggregate `as` is empty", () => {
    // Regression: football carries `as: ""` (aggregate). "" != null wrongly fired
    // the cricket branch and hid the real cfs, rendering a live 0-2 as 0-0.
    const s = score({ cfs: "0-2", ft: "", as: "", mins: "80", sun: "2nd half" });
    expect(s.home).toBe("0");
    expect(s.away).toBe("2");
  });
  it("falls back to ft when cfs is empty", () => {
    expect(score({ cfs: "", ft: "1-3" })).toMatchObject({ home: "1", away: "3" });
  });
  it("reads cricket runs from hs/as when there is no H-A scoreline", () => {
    const s = score({ cfs: "", ft: "", hs: "104/4", as: "0", bs: "live" });
    expect(s.home).toBe("104/4");
    expect(s.away).toBe("0");
  });
  it("returns empty when there is no score", () => {
    expect(score({ cfs: "", ft: "", as: "" })).toMatchObject({ home: "", away: "" });
  });
});

describe("kickoffTime / kickoffDate (UTC feed → viewer timezone)", () => {
  it("converts a UTC kickoff to the viewer's timezone", () => {
    expect(kickoffTime("2026-06-22 17:00:00", "Asia/Karachi")).toBe("22:00"); // +5
    expect(kickoffTime("2026-06-22 17:00:00", "UTC")).toBe("17:00");
    expect(kickoffTime("2026-06-22 17:00:00")).toBe("17:00"); // default UTC
    expect(kickoffTime("")).toBe("");
  });
  it("rolls the date when the local time crosses midnight", () => {
    // 23:30 UTC + 5h = 04:30 next day in Karachi → date is the 23rd.
    expect(kickoffDate("2026-06-22 23:30:00", "Asia/Karachi")).toBe("23 Jun");
    expect(kickoffDate("2026-06-22 23:30:00", "UTC")).toBe("22 Jun");
  });
  it("does NOT shift a bare calendar date (no clock time) across zones", () => {
    expect(kickoffDate("2026-06-22", "Asia/Karachi")).toBe("22 Jun");
    expect(kickoffDate("2026-05-31", "America/Chicago")).toBe("31 May");
  });
  it("kickoffLabel prefixes the date only when the local day differs from UTC", () => {
    // 21:00 UTC → 02:00 next day in Karachi → show the rolled date.
    expect(kickoffLabel("2026-06-22 21:00:00", "Asia/Karachi")).toBe("23 Jun 02:00");
    // Same local day → time only.
    expect(kickoffLabel("2026-06-22 14:00:00", "Asia/Karachi")).toBe("19:00");
    expect(kickoffLabel("2026-06-22 14:00:00", "UTC")).toBe("14:00");
  });
});

describe("local-date grouping helpers", () => {
  it("localDay returns the viewer-local calendar day of a UTC kickoff", () => {
    expect(localDay("2026-06-22 21:00:00", "Asia/Karachi")).toBe("2026-06-23"); // rolls forward
    expect(localDay("2026-06-22 14:00:00", "Asia/Karachi")).toBe("2026-06-22");
    expect(localDay("2026-06-23 01:00:00", "America/New_York")).toBe("2026-06-22"); // rolls back
    expect(localDay("")).toBe("");
  });
  it("todayInZone returns a YYYY-MM-DD string", () => {
    expect(todayInZone("UTC")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("tzOffsetMinutes gives the DST-aware offset used to pick the neighbour day", () => {
    expect(tzOffsetMinutes("Asia/Karachi", "2026-06-22")).toBe(300);   // +5
    expect(tzOffsetMinutes("America/New_York", "2026-06-22")).toBe(-240); // EDT -4
    expect(tzOffsetMinutes("UTC", "2026-06-22")).toBe(0);
  });
});

describe("formatOdds", () => {
  it("shows decimals as the feed provides them — no forced trailing zeros, capped at 2dp", () => {
    expect(formatOdds(5.4)).toBe("5.4");   // not "5.40"
    expect(formatOdds(1.1)).toBe("1.1");   // not "1.10"
    expect(formatOdds(5.75)).toBe("5.75");
    expect(formatOdds("3")).toBe("3");     // not "3.00"
    expect(formatOdds(1.6153846153846154)).toBe("1.62"); // long fractional value capped at 2dp
  });
  it("returns dash for non-numbers", () => {
    expect(formatOdds(null)).toBe("—");
    expect(formatOdds("abc")).toBe("—");
    expect(formatOdds(0)).toBe("—");
  });
  it("converts to fractional", () => {
    expect(formatOdds(3, "Fractional")).toBe("2/1");
    expect(formatOdds(2.5, "Fractional")).toBe("3/2");
  });
  it("converts to American", () => {
    expect(formatOdds(2.5, "American")).toBe("+150");
    expect(formatOdds(1.5, "American")).toBe("-200");
  });
});

describe("oddsTriple", () => {
  it("returns null when there are no markets", () => {
    expect(oddsTriple({})).toBeNull();
    expect(oddsTriple({ odds: null })).toBeNull();
  });
  it("picks the best price per outcome across bookmakers", () => {
    const match = {
      odds: [
        { market_name: "1x2", bookmaker_name: "A", outcomes: [
          { name: "H", odds: 2.0 }, { name: "D", odds: 3.3 }, { name: "A", odds: 3.6 },
        ] },
        { market_name: "1x2", bookmaker_name: "B", outcomes: [
          { name: "H", odds: 2.1 }, { name: "D", odds: 3.2 }, { name: "A", odds: 3.9 },
        ] },
      ],
    };
    const t = oddsTriple(match);
    expect(t.home).toBe(2.1);
    expect(t.away).toBe(3.9);
    expect(t.books).toBe(2);
    expect(t.twoWay).toBe(false);
  });
  it("reports books:1 and a single coherent line when the cross-book max is impossible", () => {
    // Each book is individually coherent (overround ~1.0), but the cross-book MAX
    // per outcome implies a <95% market (a fake surebet) → fallback to one book.
    const match = {
      odds: [
        { market_name: "1x2", bookmaker_name: "A", outcomes: [
          { name: "H", odds: 2.0 }, { name: "D", odds: 4.0 }, { name: "A", odds: 4.0 },
        ] },
        { market_name: "1x2", bookmaker_name: "B", outcomes: [
          { name: "H", odds: 4.0 }, { name: "D", odds: 4.0 }, { name: "A", odds: 2.0 },
        ] },
      ],
    };
    const t = oddsTriple(match);
    expect(t.books).toBe(1); // not 2 — only one book's line is shown
    // Falls back to the tightest book (A, first at overround 1.0).
    expect(t.home).toBe(2.0);
    expect(t.away).toBe(4.0);
  });
});

describe("oddsMarkets", () => {
  it("groups by market name and computes best per outcome", () => {
    const match = {
      odds: [
        { market_name: "1x2", bookmaker_name: "A", outcomes: [{ name: "H", odds: 2.0 }, { name: "A", odds: 3.6 }] },
        { market_name: "1x2", bookmaker_name: "B", outcomes: [{ name: "H", odds: 2.2 }, { name: "A", odds: 3.4 }] },
        { market_name: "BTTS", bookmaker_name: "A", outcomes: [{ name: "Yes", odds: 1.8 }, { name: "No", odds: 2.0 }] },
      ],
    };
    const markets = oddsMarkets(match);
    expect(markets.length).toBe(2);
    const m1x2 = markets.find((m) => m.name === "1x2");
    expect(m1x2.best.H).toBe(2.2);
    expect(m1x2.rows.length).toBe(2);
  });
  it("returns empty array for no odds", () => {
    expect(oddsMarkets({})).toEqual([]);
  });
});

describe("oddsLineCount", () => {
  it("counts every priced (bookmaker x market) line across all markets", () => {
    // 498557-shaped: 2 x 1X2 + 1 Double Chance + 1 BTTS = 4 lines, 2 bookmakers.
    const match = {
      odds: [
        { market_name: "1x2", bookmaker_name: "Betway", outcomes: [{ name: "H", odds: 3.3 }, { name: "D", odds: 3.1 }, { name: "A", odds: 2.15 }] },
        { market_name: "Double Chance", bookmaker_name: "Betway", outcomes: [{ name: "HD", odds: 1.65 }, { name: "HA", odds: 1.375 }, { name: "DA", odds: 1.3 }] },
        { market_name: "Both Teams to Score", bookmaker_name: "Betway", outcomes: [{ name: "Y", odds: 2.2 }, { name: "N", odds: 1.61 }] },
        { market_name: "1x2", bookmaker_name: "Betway ZA", outcomes: [{ name: "H", odds: 3.55 }, { name: "D", odds: 3.2 }, { name: "A", odds: 2.02 }] },
      ],
    };
    expect(oddsLineCount(match)).toBe(4);
  });
  it("ignores lines with no valid price and handles empty odds", () => {
    expect(oddsLineCount({})).toBe(0);
    expect(oddsLineCount({ odds: [{ market_name: "1x2", bookmaker_name: "X", outcomes: [{ name: "H", odds: 0 }, { name: "A", odds: 0 }] }] })).toBe(0);
  });
  it("handles the single-object (non multi_odds) shape as one line", () => {
    const single = { odds: { market_name: "1x2", bookmaker_name: "Betway", outcomes: [{ name: "H", odds: 2 }, { name: "A", odds: 3 }] } };
    expect(oddsLineCount(single)).toBe(1);
  });
});

describe("outcomeLabel", () => {
  it("maps 1x2 codes to team names", () => {
    expect(outcomeLabel("H", "Arsenal", "Chelsea")).toBe("Arsenal");
    expect(outcomeLabel("A", "Arsenal", "Chelsea")).toBe("Chelsea");
    expect(outcomeLabel("D", "Arsenal", "Chelsea")).toBe("Draw");
  });
  it("passes through non-1x2 names", () => {
    expect(outcomeLabel("Over 2.5")).toBe("Over 2.5");
  });
});

describe("marketNames", () => {
  it("returns distinct market names", () => {
    const match = { odds: [
      { market_name: "1x2", outcomes: [] },
      { market_name: "1x2", outcomes: [] },
      { market_name: "BTTS", outcomes: [] },
    ] };
    expect(marketNames(match)).toEqual(["1x2", "BTTS"]);
  });
});
