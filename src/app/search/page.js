import Link from "next/link";
import { getMatches, flattenMatches, getRacingMeetings, getGolfTournaments } from "@/lib/api";
import { oddsTriple, statusOf, statusLabel, score, kickoffTime } from "@/lib/format";
import { OddsValue } from "@/components/OddsFormatProvider";
import Crest from "@/components/Crest";

export const metadata = { title: "Search results" };

// Sports served by the match (1·X·2) feed.
const SPORTS = [
  { key: "football", label: "Football" },
  { key: "tennis", label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "cricket", label: "Cricket" },
  { key: "baseball", label: "Baseball" },
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
        <div className="flex-col gap-1"><Crest name={c.htn} id={c.htid} sport={m.sport} /><Crest name={c.atn} id={c.atid} sport={m.sport} /></div>
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
              <span className="price" style={{ fontSize: 13 }}>{has ? <OddsValue value={x.price} /> : "—"}</span>
            </button>
          );
        })}
      </div>
      <Link className="btn btn-primary btn-xs" href={`/event?sport=${m.sport}&id=${m.id}`}>Compare</Link>
    </div>
  );
}

function RaceRow({ r }) {
  const s = (r.status || "").toUpperCase();
  const live = s === "OFF";
  const done = s === "RESULT" || s === "INTERIM";
  return (
    <div className="card flex items-center gap-3 flex-wrap" style={{ padding: "12px 16px" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.course}</div>
        <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{r.nm}</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)", minWidth: 130 }}>
        <span className="chip chip-muted" style={{ fontSize: 10, marginRight: 6 }}>Horse Racing</span>
        {[r.dis, r.nor && `${r.nor} runners`].filter(Boolean).join(" · ")}
        <div className="mute" style={{ fontSize: 11, marginTop: 3 }}>
          {live ? <span style={{ color: "var(--down)", fontWeight: 700 }}>LIVE</span> : done ? "Result" : kickoffTime(r.st)}
        </div>
      </div>
      <Link className="btn btn-primary btn-xs" href={`/race?id=${r.id}`}>Card</Link>
    </div>
  );
}

function GolfRow({ g }) {
  return (
    <div className="card flex items-center gap-3 flex-wrap" style={{ padding: "12px 16px" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{g.player || g.tournament}</div>
        {g.player && <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{g.tournament}</div>}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)", minWidth: 130 }}>
        <span className="chip chip-muted" style={{ fontSize: 10, marginRight: 6 }}>Golf</span>
        {g.player ? [g.pos && `Pos ${g.pos}`, g.par != null && `${g.par}`].filter(Boolean).join(" · ") : "Tournament"}
      </div>
      <Link className="btn btn-primary btn-xs" href="/golf">View</Link>
    </div>
  );
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();
  const ql = q.toLowerCase();

  let results = [];
  if (ql) {
    // Run every sport's feed in parallel: matches, racing meetings, golf.
    const [matchFeeds, racing, golf] = await Promise.all([
      Promise.all(SPORTS.map((s) => getMatches(s.key))),
      getRacingMeetings(),
      getGolfTournaments(),
    ]);

    // 1·X·2 match sports — match on team names + league.
    SPORTS.forEach((s, i) => {
      flattenMatches(matchFeeds[i].groups).forEach((m) => {
        const c = m.competitors || {};
        const hay = `${c.htn || ""} ${c.atn || ""} ${m.league || ""} ${m.leagueFull || ""}`.toLowerCase();
        if (hay.includes(ql)) results.push({ kind: "match", ...m, sport: s.key, sportLabel: s.label });
      });
    });

    // Horse racing — match on course / race name / country.
    (racing.meetings || []).forEach((mt) => {
      (mt.races || []).forEach((r) => {
        const hay = `${mt.cnm || ""} ${r.nm || ""} ${mt.co || ""}`.toLowerCase();
        if (hay.includes(ql)) {
          results.push({ kind: "race", id: r.id, course: mt.cnm, nm: r.nm, st: r.st, status: r.status, dis: r.dis, nor: r.nor });
        }
      });
    });

    // Golf — match on tournament name and player names.
    (golf.tournaments || []).forEach((tn) => {
      if ((tn.nm || "").toLowerCase().includes(ql)) {
        results.push({ kind: "golf", id: tn.id, tournament: tn.nm, player: null });
      }
      (tn.matches || []).forEach((p) => {
        if ((p.nm || "").toLowerCase().includes(ql)) {
          results.push({ kind: "golf", id: tn.id, tournament: tn.nm, player: p.nm, pos: p.pos, par: p.par });
        }
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
          <input className="input" name="q" defaultValue={q} placeholder="Search team, horse, player, course or league" aria-label="Search" style={{ background: "transparent", border: 0, padding: "10px 0" }} />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {!q ? (
          <p className="sub">Type a team, event or league above to find matches.</p>
        ) : (
          <>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
            </h1>
            <p className="sub" style={{ marginBottom: 20 }}>Across all sports — football, horse racing, tennis, basketball, cricket, golf and more.</p>
            {results.length ? (
              <div className="flex-col gap-2">
                {results.slice(0, 50).map((item, idx) =>
                  item.kind === "race" ? <RaceRow key={`race-${item.id}`} r={item} />
                  : item.kind === "golf" ? <GolfRow key={`golf-${item.id}-${item.player || "t"}-${idx}`} g={item} />
                  : <ResultRow key={`${item.sport}-${item.id}`} m={item} />
                )}
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
