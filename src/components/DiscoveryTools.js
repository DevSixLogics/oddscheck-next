"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TABS = [
  { id: "arb", label: "Arbitrage Finder" },
  { id: "ev", label: "+EV Bets" },
  { id: "middle", label: "Middling" },
  { id: "boosts", label: "Price Boosts" },
];

const SPORT_TAG = { football: "FB", tennis: "TEN", basketball: "BAS", cricket: "CRI" };

function MatchHead({ o }) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: 12 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{o.home} <span className="mute">v</span> {o.away}</div>
        <div className="mute" style={{ fontSize: 11 }}>
          {SPORT_TAG[o.sport] || o.sport}{o.league ? ` · ${o.league}` : ""}{o.kickoff ? ` · ${o.kickoff}` : ""}
        </div>
      </div>
      {o.live && <span className="chip chip-live" style={{ fontSize: 10 }}>LIVE</span>}
    </div>
  );
}

const legBox = { flex: 1, minWidth: 120, padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8 };

function ArbCard({ o }) {
  return (
    <article className="card" style={{ padding: 18 }}>
      <MatchHead o={o} />
      <div className="flex gap-2 flex-wrap mb-3">
        {(o.legs || []).map((l) => (
          <div key={l.sym} style={legBox}>
            <div className="mute" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l.sym} · {l.pick}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>{l.odds.toFixed(2)}</div>
            <div className="mute" style={{ fontSize: 11 }}>{l.book}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="mute" style={{ fontSize: 12 }}>Market {o.marketPct.toFixed(2)}%</span>
        <span className="chip chip-best">+{o.profitPct.toFixed(2)}% guaranteed</span>
      </div>
    </article>
  );
}

function EvCard({ o }) {
  return (
    <article className="card" style={{ padding: 18 }}>
      <MatchHead o={o} />
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{o.sym} · {o.pick}</div>
          <div className="mute" style={{ fontSize: 11 }}>{o.book} · fair {o.fairOdds.toFixed(2)}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="num" style={{ fontSize: 18, fontWeight: 700 }}>{o.odds.toFixed(2)}</span>
          <span className="chip chip-best">+{o.edgePct.toFixed(1)}% EV</span>
        </div>
      </div>
    </article>
  );
}

function MiddleCard({ o }) {
  return (
    <article className="card" style={{ padding: 18 }}>
      <MatchHead o={o} />
      <div className="flex gap-2 flex-wrap mb-2">
        {(o.legs || []).map((l, i) => (
          <div key={i} style={legBox}>
            <div className="mute" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l.pick}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>{l.odds.toFixed(2)}</div>
            <div className="mute" style={{ fontSize: 11 }}>{l.book}</div>
          </div>
        ))}
      </div>
      <span className="chip chip-muted">Middle if result lands in {o.range}</span>
    </article>
  );
}

const BRANDS = new Set(["bet365", "williamhill", "paddypower", "skybet", "ladbrokes", "coral", "betvictor", "betfair", "unibet", "888sport"]);
function BoostCard({ o }) {
  const slug = (o.bookSlug || "").replace(/-/g, "");
  const isBrand = BRANDS.has(slug);
  const code = o.book.length <= 8 ? o.book.toUpperCase() : o.book.slice(0, 8).toUpperCase();
  return (
    <article className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="flex items-center gap-2">
        {isBrand ? <span className={`bm bm-md bm-${slug}`}>{code}</span> : <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.12)", color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>{o.book.charAt(0)}</span>}
        <span style={{ fontWeight: 600, fontSize: 13 }}>{o.book}</span>
      </div>
      <h4 style={{ fontSize: 16, lineHeight: 1.3 }}>{o.headline}</h4>
      {o.strapline && <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, flex: 1 }}>{o.strapline}</p>}
      <Link className="btn btn-primary btn-sm" href={o.slug ? `/article/${o.slug}` : "/offers"}>View offer →</Link>
    </article>
  );
}

const EMPTY = {
  arb: "No surebets across bookmakers right now — prices are efficient. Check back as new markets open.",
  ev: "No +EV prices above the bookmaker consensus right now.",
  middle: "No middling opportunities — this needs overlapping total/handicap lines, which the current feed rarely exposes.",
  boosts: "No price boosts listed right now.",
};

export default function DiscoveryTools() {
  const [active, setActive] = useState("arb");
  const [view, setView] = useState({ type: null, items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/discovery?type=${active}`)
      .then((r) => r.json())
      .then((j) => { if (alive) setView({ type: j.type || active, items: Array.isArray(j.items) ? j.items : [] }); })
      .catch(() => { if (alive) setView({ type: active, items: [] }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [active]);

  // Only render cards for the type the data was actually loaded for — prevents
  // rendering one tool's items with another tool's card during a tab switch.
  const ready = !loading && view.type === active;
  const items = ready ? view.items : [];
  const grid = active === "boosts" ? "grid grid-3" : "grid grid-2";

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="tab-pills-scroll" style={{ padding: "14px 18px 0", gap: 6 }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`tab-pill${active === t.id ? " active" : ""}`} aria-pressed={active === t.id} onClick={() => setActive(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 22 }}>
        <div className="mute" style={{ fontSize: 12, marginBottom: 14 }}>
          {loading ? "Scanning live odds…" : `${items.length} ${items.length === 1 ? "opportunity" : "opportunities"} found · scanned across football, tennis, basketball & cricket`}
        </div>
        {!loading && items.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>{EMPTY[active]}</div>
        ) : (
          <div className={grid} style={{ opacity: loading ? 0.4 : 1, transition: "opacity .15s" }}>
            {items.map((o, i) => (
              active === "arb" ? <ArbCard key={i} o={o} /> :
              active === "ev" ? <EvCard key={i} o={o} /> :
              active === "middle" ? <MiddleCard key={i} o={o} /> :
              <BoostCard key={i} o={o} />
            ))}
          </div>
        )}
        <p className="mute" style={{ fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
          Live scan of the OddsCheck odds feed. Always confirm the price at the bookmaker before staking — odds move fast. 18+ · begambleaware.org
        </p>
      </div>
    </div>
  );
}
