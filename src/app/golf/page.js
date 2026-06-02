import Link from "next/link";
import { getGolfTournaments, todayISO } from "@/lib/api";
import { kickoffDate } from "@/lib/format";
import DateNav from "@/components/DateNav";

export const metadata = {
  title: "Golf — leaderboards & tournament scores",
  description: "Live and completed golf leaderboards: positions, to-par and round-by-round scores across the PGA, DP World and LIV tours.",
};

function parColor(p) {
  if (p === "Par" || p === "E" || p === "0") return "var(--text)";
  if (typeof p === "string" && p.startsWith("-")) return "var(--accent)";
  if (typeof p === "string" && p.startsWith("+")) return "var(--down)";
  return "var(--text)";
}

function roundCells(scores = []) {
  const byRound = {};
  scores.forEach((s) => { byRound[s.round] = s.ft || s.rstrk; });
  return ["R1", "R2", "R3", "R4"].map((r) => byRound[r] || "–");
}

const COLS = "44px 1fr 64px 56px 56px 56px 56px 70px";

export default async function GolfPage({ searchParams }) {
  const sp = await searchParams;
  const reqDate = sp?.date || todayISO();
  const { tournaments } = await getGolfTournaments(reqDate);

  return (
    <>
      <section style={{ padding: "28px 0 16px", background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Golf</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(28px,4vw,38px)" }}>Golf leaderboards</h1>
              <p className="sub" style={{ marginTop: 6, maxWidth: 580 }}>Positions, to-par and round-by-round scores from the PGA, DP World and LIV tours.</p>
              <div className="flex gap-3 flex-wrap" style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6 }}>
                <span><b className="num" style={{ color: "var(--text)" }}>{tournaments.length}</b> tournaments</span>
              </div>
            </div>
            <DateNav date={reqDate} />
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container flex-col gap-5">
          {tournaments.length ? (
            tournaments.map((t) => {
              const players = (t.matches || []).slice(0, 20);
              const extra = (t.matches || []).length - players.length;
              return (
                <div className="card" key={t.id} style={{ padding: 0, overflow: "hidden" }}>
                  <div className="flex justify-between items-start flex-wrap gap-2" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{t.nm}</div>
                      <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{kickoffDate(t.st)} – {kickoffDate(t.et)}{t.par ? ` · Par ${t.par}` : ""}</div>
                    </div>
                    <span className="chip chip-muted">{(t.matches || []).length} players</span>
                  </div>
                  <div className="table-scroll">
                    <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 20px", borderBottom: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 640 }}>
                      <div>Pos</div><div>Player</div><div style={{ textAlign: "center" }}>To par</div>
                      <div style={{ textAlign: "center" }}>R1</div><div style={{ textAlign: "center" }}>R2</div><div style={{ textAlign: "center" }}>R3</div><div style={{ textAlign: "center" }}>R4</div>
                      <div style={{ textAlign: "right" }}>Total</div>
                    </div>
                    {players.map((p) => {
                      const rounds = roundCells(p.scores);
                      return (
                        <div key={p.id} style={{ display: "grid", gridTemplateColumns: COLS, padding: "11px 20px", borderBottom: "1px solid var(--border-soft)", alignItems: "center", fontSize: 13, minWidth: 640 }}>
                          <div className="num" style={{ fontWeight: 700, color: p.pos === "1" ? "var(--accent)" : "var(--text-2)" }}>{p.pos}</div>
                          <div style={{ fontWeight: 600 }}>{p.nm}<span className="mute" style={{ fontWeight: 400, fontSize: 11, marginLeft: 6 }}>{p.cnm}</span></div>
                          <div className="num" style={{ textAlign: "center", fontWeight: 700, color: parColor(p.par) }}>{p.par}</div>
                          {rounds.map((r, i) => <div key={i} className="num mute" style={{ textAlign: "center", fontSize: 12 }}>{r}</div>)}
                          <div className="num" style={{ textAlign: "right", fontWeight: 700 }}>{p.strk}</div>
                        </div>
                      );
                    })}
                    {extra > 0 && (
                      <div style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-dim)", textAlign: "center" }}>+ {extra} more players</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>No golf tournaments for {reqDate}</h3>
              <p className="sub" style={{ marginBottom: 20 }}>Leaderboards appear during tournament weeks.</p>
              <Link className="btn btn-primary" href="/football">Browse football odds</Link>
            </div>
          )}
          <p className="mute" style={{ fontSize: 11 }}>Leaderboard from the golf feed. Outright/winner prices aren&apos;t exposed by this API.</p>
        </div>
      </section>
    </>
  );
}
