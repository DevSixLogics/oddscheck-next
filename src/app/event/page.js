import Link from "next/link";
import { getMatchDetail, getMatchH2H, getMatches, flattenMatches, todayISO } from "@/lib/api";
import { oddsTriple, statusOf, statusLabel, score, kickoffTime, kickoffDate } from "@/lib/format";
import Crest from "@/components/Crest";

export const metadata = { title: "Event — odds & match detail" };

const MARKETS = ["Match Winner", "Over/Under", "BTTS", "Correct Score", "HT/FT", "Player Props", "Bet Builder"];

function FormPills({ form }) {
  if (!Array.isArray(form) || !form.length) return null;
  return (
    <div className="flex gap-1 mt-2">
      {form.map((r, i) => (
        <span key={i} className={`result result-${(r || "").toLowerCase()}`}>{r}</span>
      ))}
    </div>
  );
}

export default async function EventPage({ searchParams }) {
  const sp = await searchParams;
  const sport = sp?.sport || "football";
  let id = sp?.id;

  // No id? pick the first match (with odds if possible) for this sport.
  if (!id) {
    const { groups } = await getMatches(sport);
    const flat = flattenMatches(groups);
    const m = flat.find((x) => oddsTriple(x)) || flat[0];
    id = m?.id;
  }

  const [d, h2h] = await Promise.all([getMatchDetail(sport, id), getMatchH2H(sport, id)]);

  if (!d) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Match not found</h1>
          <p className="sub" style={{ marginBottom: 24 }}>We couldn&apos;t load odds for this event.</p>
          <Link className="btn btn-primary btn-lg" href={`/${sport}`}>Browse odds</Link>
        </div>
      </section>
    );
  }

  const c = d.competitors || {};
  const t = oddsTriple(d);
  // A match on an earlier calendar day is finished — ignore stale "live" flags.
  const matchDate = (d.dt || "").slice(0, 10);
  const isPast = /^\d{4}-\d{2}-\d{2}$/.test(matchDate) && matchDate < todayISO();
  const bucket = isPast ? "finished" : statusOf(d);
  const statusText = isPast ? (d.mins || "FT") : statusLabel(d);
  const sc = score(d);
  const comp = [d.tournament?.cat, d.tournament?.nm].filter(Boolean).join(" · ") || d.league;

  // outcomes + favourite + overround
  const cells = t ? [
    { sym: "1", label: c.htn, price: t.home },
    { sym: "X", label: "Draw", price: t.draw },
    { sym: "2", label: c.atn, price: t.away },
  ] : [];
  const prices = cells.map((x) => x.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null;
  const overround = prices.length === 3 ? prices.reduce((s, p) => s + 100 / p, 0) : null;

  return (
    <>
      <section style={{ padding: "28px 0 32px", background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, transparent 80%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href={`/${sport}`} style={{ textTransform: "capitalize" }}>{sport}</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">{c.htn} vs {c.atn}</span></li>
            </ol>
          </nav>

          <div className="event-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 32, marginTop: 12 }}>
            <div className="flex items-center gap-4" style={{ justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div className="mute" style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>HOME</div>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)" }}>{c.htn}</h1>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><FormPills form={c.htf} /></div>
              </div>
              <Crest name={c.htn} id={c.htid} size="xl" />
            </div>

            <div className="event-head-vs" style={{ textAlign: "center", padding: "0 16px" }}>
              {bucket === "live" ? (
                <div className="chip chip-live mb-3"><span className="live-dot" /> {statusLabel(d)}</div>
              ) : bucket === "finished" ? (
                <div className="chip chip-muted mb-3">Full time</div>
              ) : (
                <div className="chip chip-best mb-3"><span className="live-dot" style={{ background: "var(--accent)" }} /> {kickoffDate(d.dt)} · {kickoffTime(d.dt)}</div>
              )}
              <div className="num" style={{ fontSize: 52, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {bucket !== "upcoming" && sc.raw ? `${sc.home}–${sc.away}` : "vs"}
              </div>
              <div className="flex gap-2 mt-3" style={{ justifyContent: "center", flexWrap: "wrap" }}>
                <span className="chip chip-muted">{comp}{d.ro ? ` · ${d.ro}` : ""}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Crest name={c.atn} id={c.atid} size="xl" />
              <div>
                <div className="mute" style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>AWAY</div>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)" }}>{c.atn}</h1>
                <FormPills form={c.atf} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginTop: 28 }}>
            <div className="tab-pills-scroll">
              {MARKETS.map((m, i) => (
                <button key={m} className={`tab-pill${i === 0 ? " active" : ""}`} disabled={i !== 0}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container layout-split-wide">
          <div className="flex-col gap-5">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="flex justify-between items-center flex-wrap gap-3" style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>Match Winner</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {t ? "Best price highlighted · 1 bookmaker in feed" : "No odds available for this match"}
                  </div>
                </div>
              </div>

              {t ? (
                <div className="table-scroll">
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.6fr", padding: "12px 22px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "0.08em", textTransform: "uppercase", minWidth: 700 }}>
                    <div>Bookmaker</div>
                    <div style={{ textAlign: "center" }}>{c.htn}</div>
                    <div style={{ textAlign: "center" }}>Draw</div>
                    <div style={{ textAlign: "center" }}>{c.atn}</div>
                    <div style={{ textAlign: "right" }}>Overround</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.6fr", padding: "14px 22px", borderBottom: "1px solid var(--border-soft)", alignItems: "center", minWidth: 700 }}>
                    <div className="flex items-center gap-3">
                      <span className="bm bm-md bm-bet365">ODDS</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Feed price</div>
                        <div className="mute" style={{ fontSize: 10 }}>{d.odds?.type || "pre-match"}</div>
                      </div>
                    </div>
                    {cells.map((x) => {
                      const isBest = typeof x.price === "number" && x.price === fav;
                      return (
                        <div style={{ textAlign: "center" }} key={x.sym}>
                          <button className={`odds-cell${isBest ? " best" : ""}`} style={{ display: "inline-flex", minWidth: 80, padding: "8px 12px", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span className="price" style={{ fontSize: 15 }}>{typeof x.price === "number" ? x.price.toFixed(2) : "—"}</span>
                              {isBest && <span style={{ fontSize: 9, color: "var(--accent)", fontWeight: 700, marginTop: 2, letterSpacing: "0.06em" }}>BEST</span>}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ textAlign: "right", fontSize: 13, color: "var(--text-2)" }} className="num">
                      {overround ? `${overround.toFixed(1)}%` : "—"}
                    </div>
                  </div>
                  <div style={{ padding: "12px 22px", fontSize: 11, color: "var(--text-mute)" }}>
                    The feed returns a single bookmaker&apos;s 1·X·2 market. Multi-bookmaker comparison,
                    extra markets and price movement aren&apos;t available yet.
                  </div>
                </div>
              ) : (
                <div style={{ padding: 22, color: "var(--text-dim)", fontSize: 13 }}>
                  Odds aren&apos;t published for this match yet — check back closer to kickoff.
                </div>
              )}

              {d.odds?.oddsTrackingLink && (
                <div style={{ padding: "0 22px 20px" }}>
                  <a className="btn btn-primary btn-block" href={d.odds.oddsTrackingLink} target="_blank" rel="noopener noreferrer">
                    Bet at bookmaker →
                  </a>
                </div>
              )}
            </div>

            {h2h && (h2h.stats || h2h.meetings.length > 0) && (
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>Head to head</h3>
                {h2h.stats && (
                  <>
                    <div className="flex justify-between" style={{ fontSize: 13, marginBottom: 8 }}>
                      <span><b>{h2h.stats.wins.t1}</b> {h2h.stats.homeTeam} wins</span>
                      <span><b>{h2h.stats.draws.tot}</b> draws</span>
                      <span>{h2h.stats.awayTeam} wins <b>{h2h.stats.wins.t2}</b></span>
                    </div>
                    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--bg-3)", marginBottom: 14 }}>
                      <div style={{ width: `${h2h.stats.wins.t1p}%`, background: "var(--accent)" }} />
                      <div style={{ width: `${h2h.stats.draws.perct}%`, background: "var(--border-strong)" }} />
                      <div style={{ width: `${h2h.stats.wins.t2p}%`, background: "var(--gold)" }} />
                    </div>
                    <div className="mute" style={{ fontSize: 12, marginBottom: 16 }}>
                      Avg goals — {h2h.stats.homeTeam}: <b className="num">{h2h.stats.average_goal_score?.t1}</b> · {h2h.stats.awayTeam}: <b className="num">{h2h.stats.average_goal_score?.t2}</b>
                    </div>
                  </>
                )}
                {h2h.meetings.length > 0 && (
                  <>
                    <div className="mute" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8 }}>Recent meetings</div>
                    <div className="flex-col gap-1">
                      {h2h.meetings.slice(0, 6).map((mm) => (
                        <div key={mm.id} className="flex items-center" style={{ fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--border-soft)", gap: 10 }}>
                          <span className="mute" style={{ fontSize: 11, minWidth: 64 }}>{kickoffDate(mm.dt)}</span>
                          <span style={{ flex: 1, textAlign: "center" }}>{mm.competitors?.htn} <b className="num">{mm.cfs || mm.ft}</b> {mm.competitors?.atn}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Match info</h4>
              <ul className="flex-col gap-2" style={{ fontSize: 13, color: "var(--text-2)", listStyle: "none", padding: 0 }}>
                <li className="flex justify-between"><span className="mute">Competition</span><span>{d.tournament?.nm || "—"}</span></li>
                <li className="flex justify-between"><span className="mute">Country</span><span>{d.tournament?.cat || "—"}</span></li>
                {d.ro && <li className="flex justify-between"><span className="mute">Round</span><span>{d.ro}</span></li>}
                <li className="flex justify-between"><span className="mute">Kickoff</span><span>{kickoffDate(d.dt)} · {kickoffTime(d.dt)}</span></li>
                <li className="flex justify-between"><span className="mute">Status</span><span>{statusText}</span></li>
                {(d.cfs || d.ft) && <li className="flex justify-between"><span className="mute">Score</span><span className="num">{d.cfs || d.ft}</span></li>}
              </ul>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Recent form</h4>
              <div className="flex justify-between items-center" style={{ fontSize: 13 }}>
                <span>{c.htn}</span><FormPills form={c.htf} />
              </div>
              <div className="flex justify-between items-center mt-3" style={{ fontSize: 13 }}>
                <span>{c.atn}</span><FormPills form={c.atf} />
              </div>
            </div>
            <div className="rg-banner" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 12 }}><b>18+ · Bet responsibly.</b></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
