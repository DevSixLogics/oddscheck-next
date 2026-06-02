import Link from "next/link";
import { getMatches, flattenMatches } from "@/lib/api";
import { oddsTriple, statusOf, statusLabel, score, kickoffTime } from "@/lib/format";
import Crest from "@/components/Crest";

export const metadata = { title: "Search results" };

const SPORTS = [
  { key: "football", label: "Football" },
  { key: "tennis", label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "cricket", label: "Cricket" },
];

function ResultRow({ m }) {
  const c = m.competitors || {};
  const t = oddsTriple(m);
  const sc = score(m);
  const bucket = statusOf(m);
  const cells = [
    { sym: "1", price: t?.home },
    { sym: "X", price: t?.draw },
    { sym: "2", price: t?.away },
  ];
  const prices = cells.map((x) => x.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null;

  return (
    <div className="card flex items-center gap-3 flex-wrap" style={{ padding: "12px 16px" }}>
      <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 200 }}>
        <div className="flex-col gap-1"><Crest name={c.htn} id={c.htid} /><Crest name={c.atn} id={c.atid} /></div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.htn}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{c.atn}</div>
        </div>
        {bucket !== "upcoming" && sc.raw && <span className="num" style={{ marginLeft: 10, fontWeight: 700 }}>{sc.home}–{sc.away}</span>}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)", minWidth: 130 }}>
        <span className="chip chip-muted" style={{ fontSize: 10, marginRight: 6 }}>{m.sportLabel}</span>{m.league}
        <div className="mute" style={{ fontSize: 11, marginTop: 3 }}>
          {bucket === "live" ? <span style={{ color: "var(--down)", fontWeight: 700 }}>{statusLabel(m)}</span> : bucket === "finished" ? "FT" : kickoffTime(m.dt)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, minWidth: 170 }}>
        {cells.map((x) => {
          const has = typeof x.price === "number";
          return (
            <button key={x.sym} className={`odds-cell${has && x.price === fav ? " best" : ""}`} style={{ padding: "6px 4px" }}>
              <span className="meta">{x.sym}</span>
              <span className="price" style={{ fontSize: 13 }}>{has ? x.price.toFixed(2) : "—"}</span>
            </button>
          );
        })}
      </div>
      <Link className="btn btn-primary btn-xs" href={`/event?sport=${m.sport}&id=${m.id}`}>Compare</Link>
    </div>
  );
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();
  const ql = q.toLowerCase();

  let results = [];
  if (ql) {
    const all = await Promise.all(SPORTS.map((s) => getMatches(s.key)));
    SPORTS.forEach((s, i) => {
      flattenMatches(all[i].groups).forEach((m) => {
        const c = m.competitors || {};
        const hay = `${c.htn || ""} ${c.atn || ""} ${m.league || ""} ${m.leagueFull || ""}`.toLowerCase();
        if (hay.includes(ql)) results.push({ ...m, sport: s.key, sportLabel: s.label });
      });
    });
  }

  return (
    <section className="section">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <li><Link href="/">Home</Link></li>
            <li className="sep" aria-hidden="true">/</li>
            <li><span className="current" aria-current="page">Search</span></li>
          </ol>
        </nav>

        {/* Search form (GET → /search?q=) */}
        <form action="/search" method="get" className="card" role="search" style={{ marginTop: 14, marginBottom: 24, padding: 8, display: "flex", alignItems: "center", gap: 8, maxWidth: 640 }}>
          <span style={{ padding: "0 8px 0 12px", color: "var(--text-mute)", display: "inline-flex" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </span>
          <input className="input" name="q" defaultValue={q} placeholder="Search team, event or league (e.g. Canada)" aria-label="Search" style={{ background: "transparent", border: 0, padding: "10px 0" }} />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {!q ? (
          <p className="sub">Type a team, event or league above to find matches.</p>
        ) : (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
            </h1>
            <p className="sub" style={{ marginBottom: 20 }}>Across football, tennis, basketball and cricket.</p>
            {results.length ? (
              <div className="flex-col gap-2">
                {results.slice(0, 50).map((m) => <ResultRow key={`${m.sport}-${m.id}`} m={m} />)}
              </div>
            ) : (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>No matches found</h3>
                <p className="sub" style={{ marginBottom: 20 }}>Try a different team or league name.</p>
                <Link className="btn btn-primary" href="/football">Browse all football</Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
