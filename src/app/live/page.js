import Link from "next/link";
import { getMatches, flattenMatches } from "@/lib/api";
import { oddsTriple, statusOf, statusLabel, score } from "@/lib/format";
import Crest from "@/components/Crest";

export const metadata = {
  title: "Live odds & in-play markets",
  description: "Real-time prices across every live match, refreshed continuously. Best in-play price highlighted.",
};

const SPORTS = [
  { key: "football", label: "Football" },
  { key: "tennis", label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "cricket", label: "Cricket" },
];

function LiveCard({ m }) {
  const c = m.competitors || {};
  const t = oddsTriple(m);
  const sc = score(m);
  const cells = [
    { sym: "1", price: t?.home },
    { sym: "X", price: t?.draw },
    { sym: "2", price: t?.away },
  ];
  const prices = cells.map((x) => x.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null;

  return (
    <article className="card" style={{ padding: 20 }}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="chip chip-live" style={{ fontSize: 10 }}>{statusLabel(m)}</span>
          <span className="chip chip-muted">{m.sportLabel}</span>
        </div>
        <span className="mute" style={{ fontSize: 11 }}>{m.league}</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Crest name={c.htn} id={c.htid} /><span style={{ fontSize: 14, fontWeight: 600 }}>{c.htn}</span></div>
        <span className="num score" style={{ fontWeight: 700 }}>{sc.home || "0"}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Crest name={c.atn} id={c.atid} /><span style={{ fontSize: 14, fontWeight: 600 }}>{c.atn}</span></div>
        <span className="num score" style={{ fontWeight: 700 }}>{sc.away || "0"}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        {cells.map((x) => {
          const has = typeof x.price === "number";
          return (
            <button key={x.sym} className={`odds-cell${has && x.price === fav ? " best" : ""}`}>
              <span className="meta">{x.sym}</span>
              <span className="price">{has ? x.price.toFixed(2) : "—"}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center mute" style={{ fontSize: 11 }}>
        <span className="flex items-center gap-1"><span className="live-dot" /> Markets open</span>
        <Link href={`/event?sport=${m.sport}&id=${m.id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>All markets →</Link>
      </div>
    </article>
  );
}

export default async function LivePage() {
  const results = await Promise.all(SPORTS.map((s) => getMatches(s.key)));
  let live = [];
  const counts = {};
  SPORTS.forEach((s, i) => {
    const liveForSport = flattenMatches(results[i].groups)
      .filter((m) => statusOf(m) === "live")
      .map((m) => ({ ...m, sport: s.key, sportLabel: s.label }));
    counts[s.key] = liveForSport.length;
    live = live.concat(liveForSport);
  });
  const total = live.length;

  return (
    <>
      <section style={{ padding: "32px 0 24px", background: "linear-gradient(180deg, rgba(255,77,103,0.06) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Live odds</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <span className="chip chip-live mb-3">LIVE NOW · {total} matches</span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "8px 0" }}>Live odds &amp; in-play markets</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
                Real-time prices across every live match, refreshed continuously. Best in-play
                price highlighted where the feed provides it.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap" style={{ fontSize: 13 }}>
              <span className="flex items-center gap-2"><span className="live-dot" />Pulse = live update</span>
              <span className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />Markets open</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="tab-pills-scroll mb-4">
            <button className="tab-pill active">All sports <span style={{ fontSize: 11, opacity: 0.7 }}>{total}</span></button>
            {SPORTS.map((s) => (
              <button key={s.key} className="tab-pill" disabled={!counts[s.key]}>
                {s.label} <span style={{ fontSize: 11, opacity: 0.7 }}>{counts[s.key] || 0}</span>
              </button>
            ))}
          </div>

          {total ? (
            <div className="grid grid-3">
              {live.map((m) => <LiveCard key={`${m.sport}-${m.id}`} m={m} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <span className="chip chip-muted mb-3">Nothing live right now</span>
              <h3 style={{ fontSize: 20, margin: "8px 0" }}>No matches in play</h3>
              <p className="sub" style={{ marginBottom: 20 }}>Check back when games kick off — or browse today&apos;s fixtures.</p>
              <Link className="btn btn-primary btn-lg" href="/football">Browse today&apos;s fixtures</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
