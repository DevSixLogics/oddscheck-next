"use client";

import { useState } from "react";
import { outcomeLabel } from "@/lib/format";
import { OddsValue } from "./OddsFormatProvider";

// Sum of implied probabilities (%) across a row's prices for the given outcomes.
function overround(prices, outcomes) {
  let s = 0, n = 0;
  for (const oc of outcomes) {
    const p = prices[oc];
    if (p > 1) { s += 100 / p; n += 1; }
  }
  return n >= 2 ? s : null;
}

/**
 * Interactive market comparison. `markets` = output of oddsMarkets(match); the
 * tabs switch the active market and the table re-renders for it.
 */
export default function OddsMarkets({ markets = [], home, away }) {
  const [active, setActive] = useState(0);

  if (!markets.length) {
    return (
      <div className="card" style={{ padding: 22, color: "var(--text-dim)", fontSize: 13 }}>
        Odds aren&apos;t published for this match yet — check back closer to kickoff.
      </div>
    );
  }

  const m = markets[Math.min(active, markets.length - 1)];
  const { name, outcomes, rows, best } = m;
  // 1.4fr bookmaker + one column per outcome + 0.8fr overround.
  const cols = `1.4fr ${outcomes.map(() => "1fr").join(" ")} 0.8fr`;
  const bestOverround = overround(best, outcomes);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {markets.length > 1 && (
        <div className="tab-pills-scroll" style={{ padding: "14px 18px 0", gap: 6 }}>
          {markets.map((mk, i) => (
            <button key={mk.name} type="button" className={`tab-pill${i === active ? " active" : ""}`} aria-pressed={i === active} onClick={() => setActive(i)}>
              {mk.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-3" style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, textTransform: "uppercase" }}>{name}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {rows.length} bookmaker{rows.length > 1 ? "s" : ""} compared
          </div>
        </div>
        {bestOverround ? <span className="chip chip-muted">Best-line overround {bestOverround.toFixed(1)}%</span> : null}
      </div>

      <div className="table-scroll">
        <div style={{ display: "grid", gridTemplateColumns: cols, padding: "12px 22px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 600 }}>
          <div>Bookmaker</div>
          {outcomes.map((oc) => <div key={oc} style={{ textAlign: "center" }}>{outcomeLabel(oc, home, away)}</div>)}
          <div style={{ textAlign: "right" }}>Overround</div>
        </div>
        {rows.map((r, i) => {
          const or = overround(r.prices, outcomes);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: cols, padding: "12px 22px", borderBottom: "1px solid var(--border-soft)", alignItems: "center", minWidth: 600 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{r.bookmaker}</div>
              {outcomes.map((oc) => {
                const price = r.prices[oc];
                const inner = (
                  <span className="odds-cell" style={{ display: "inline-flex", minWidth: 60, padding: "7px 10px", alignItems: "center", justifyContent: "center" }}>
                    <span className="price" style={{ fontSize: 15 }}>{price != null ? <OddsValue value={price} /> : "—"}</span>
                  </span>
                );
                return (
                  <div style={{ textAlign: "center" }} key={oc}>
                    {price != null && r.link ? <a href={r.link} target="_blank" rel="noopener noreferrer">{inner}</a> : inner}
                  </div>
                );
              })}
              <div style={{ textAlign: "right", fontSize: 13, color: "var(--text-2)" }} className="num">{or ? `${or.toFixed(1)}%` : "—"}</div>
            </div>
          );
        })}
        <div style={{ padding: "12px 22px", fontSize: 11, color: "var(--text-mute)" }}>
          Pre-match odds across {rows.length} bookmaker{rows.length > 1 ? "s" : ""}.
        </div>
      </div>
    </div>
  );
}
