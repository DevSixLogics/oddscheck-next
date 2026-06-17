import Link from "next/link";

export const metadata = { alternates: { canonical: "/tip" } };

const COMPARE = [
  ["bet365", "BET365", "1.85", true],
  ["williamhill", "W.HILL", "1.83", false],
  ["paddypower", "P.POWER", "1.80", false],
  ["skybet", "SKY BET", "1.82", false],
];

const ALT_BETS = [
  ["Over 2.5 Goals only", "1.65", "skybet", "SKY BET"],
  ["Haaland anytime", "1.85", "williamhill", "W.HILL"],
  ["City win & BTTS", "3.40", "betvictor", "BETVICTOR"],
  ["Correct score 2-1 City", "8.50", "paddypower", "P.POWER"],
];

const RELATED = [
  { game: "Liverpool vs Chelsea", pick: "Liverpool -1 handicap", odds: "2.30", cls: "williamhill", bm: "W.HILL" },
  { game: "Real Madrid vs Barca", pick: "Bellingham scorer", odds: "2.10", cls: "paddypower", bm: "P.POWER" },
  { game: "PSG vs Inter", pick: "Both teams to score", odds: "1.72", cls: "betfair", bm: "BETFAIR" },
];

export default function TipPage() {
  return (
    <>
      <section style={{ padding: "32px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href="/tips">Tips</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">BTTS &amp; Over 2.5 Goals</span></li>
            </ol>
          </nav>
          <div className="grid" style={{ gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start", marginTop: 12 }}>
            <div>
              <div className="flex gap-2 mb-3"><span className="chip chip-muted">Football · Premier League</span><span className="chip chip-best">Confidence 4/5</span></div>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", marginBottom: 12 }}>Man City vs Arsenal: BTTS &amp; Over 2.5 Goals @ 1.85</h1>
              <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.55, maxWidth: 680 }}>
                Both attacks are firing. The real value isn&apos;t in picking the winner — it&apos;s in the goals.
              </p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="avatar avatar-lg" style={{ background: "linear-gradient(135deg,#A855F7,#6D28D9)" }}>JM</span>
                <div>
                  <div style={{ fontWeight: 600 }}>James Murphy · Football Editor</div>
                  <div className="mute" style={{ fontSize: 12 }}>Updated 37 min ago · 4 min read · 78% strike rate L30</div>
                </div>
              </div>
            </div>
            <aside className="card" style={{ padding: 20 }}>
              <div className="mute" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>Today&apos;s pick</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>BTTS &amp; Over 2.5 Goals</div>
              <div className="flex justify-between items-baseline mb-3"><span className="num" style={{ fontSize: 36, fontWeight: 700, color: "var(--accent)" }}>1.85</span><span className="bm bm-lg bm-bet365">BET365</span></div>
              <div className="flex gap-2 mb-3"><Link className="btn btn-primary flex-1" href="/review">Bet at Bet365</Link></div>
              <div className="muted" style={{ fontSize: 11, textAlign: "center" }}>18+ · T&amp;Cs apply</div>
              <hr className="divider" style={{ margin: "14px 0" }} />
              <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8 }}>Compare odds</div>
              {COMPARE.map(([cls, bm, price, best]) => (
                <div key={bm} className="flex justify-between items-center" style={{ padding: "6px 0", fontSize: 12 }}>
                  <span className={`bm bm-${cls}`}>{bm}</span>
                  <span className="num" style={{ fontWeight: 600, color: best ? "var(--accent)" : "var(--text)" }}>{price}{best ? " ★" : ""}</span>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}>
          <article className="prose">
            <h2>The case for goals</h2>
            <p>Manchester City have scored 2+ in 9 of their last 10 home Premier League games — and against Arsenal specifically, this fixture has produced 3.2 goals per match on average in the last 5 meetings. Both teams have averaged 2+ shots on target in every encounter since 2022.</p>
            <p>What makes today different is the press. Arteta&apos;s high block has produced goals on the road this season (1.8 goals scored per away game), but it&apos;s also leaked 1.4 — Arsenal are top 5 in the league for both away xG and xG against. That&apos;s a recipe for an open match.</p>

            <h3>Key stats</h3>
            <ul>
              <li>City have scored in <b>27 of their last 28</b> home league games</li>
              <li>Arsenal have scored in <b>11 of their last 13</b> away league games</li>
              <li>Last 5 H2H: <b>4 BTTS, average 3.2 goals</b></li>
              <li>City home xG: <b>2.31</b> (1st in EPL) · Arsenal away xG: <b>1.84</b> (3rd)</li>
              <li>Both BTTS &amp; Over 2.5 has landed in <b>61% of City home games</b> this season</li>
            </ul>

            <blockquote>&ldquo;With Haaland firing and Saka likely to start, I struggle to see a clean sheet at either end. The price on the goals market is significantly better than the win market.&rdquo;</blockquote>

            <h3>Why not back the winner?</h3>
            <p>The 1X2 market here is tight — and the bookmakers have it broadly right. City at 2.10 is fair given Arsenal&apos;s road record; Arsenal at 3.20 looks marginally generous but not enough to be a value play after the Saliba doubt confirmed.</p>
            <p>The <b>goals market</b> is where the line moved less than the underlying data suggests it should. BTTS &amp; Over 2.5 at 1.85 implies a 54% chance — but historical and form data point to closer to 62%, giving us roughly 8 percentage points of edge.</p>

            <h3>Alternative bets</h3>
            <p>If you prefer a safer leg, <b>Over 2.5 alone</b> at 1.65 with Sky Bet keeps most of the edge with less variance. For higher-variance plays, <b>Haaland Over 1.5 shots on target</b> at 1.90 with William Hill is in line with his season-long rate and pairs nicely with a goals lean.</p>

            <h2>Match preview</h2>
            <p>This is the kind of fixture that defines title races — and with City three points clear in second place behind Arsenal as the season heats up, both sides will play to win. The Etihad atmosphere will be unforgiving on Arsenal&apos;s back four, especially with Saliba a late call.</p>
            <p>For the full team news, head injury list, and the Tactical Director&apos;s analysis, see our <Link href="/event">Man City vs Arsenal preview</Link>.</p>
          </article>

          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Alternative bets</h4>
              {ALT_BETS.map(([label, odds, cls, bm], idx) => (
                <div key={label} className="flex justify-between items-center" style={{ padding: "8px 0", borderBottom: idx === ALT_BETS.length - 1 ? 0 : "1px solid var(--border-soft)", fontSize: 13 }}>
                  {label}
                  <span className="flex items-center gap-2"><span className="num" style={{ fontWeight: 600 }}>{odds}</span><span className={`bm bm-${cls}`}>{bm}</span></span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Tipster track record</h4>
              <div className="grid grid-2" style={{ gap: 8, marginBottom: 14 }}>
                <div className="kpi card-flat" style={{ padding: 14 }}><div className="kpi-label">Strike rate</div><div className="kpi-value num">78%</div></div>
                <div className="kpi card-flat" style={{ padding: 14 }}><div className="kpi-label">Profit · 30d</div><div className="kpi-value num" style={{ color: "var(--accent)" }}>+12.3u</div></div>
              </div>
              <Link className="btn btn-ghost btn-sm btn-block" href="/tips">All James&apos;s tips →</Link>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Related tips</h4>
              <div className="flex-col gap-3">
                {RELATED.map((r) => (
                  <Link key={r.pick} href="/tip" style={{ display: "block" }}>
                    <div className="mute" style={{ fontSize: 11 }}>{r.game}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, margin: "3px 0" }}>{r.pick}</div>
                    <div className="flex items-center gap-2"><span className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{r.odds}</span><span className={`bm bm-${r.cls}`}>{r.bm}</span></div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rg-banner" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ fontSize: 12 }}><b>18+ · Tips are opinions, not guarantees. Stake only what you can afford to lose.</b></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
