import Link from "next/link";
import StaticNote from "@/components/StaticNote";

export const metadata = {
  title: "Today's tips & predictions — confidence-scored, best-priced",
  description: "Hand-picked by our editors and AI. Every tip is confidence-scored, result-tracked, and priced at the best available bookmaker.",
};

const TABS = ["Today's tips", "Football", "Racing", "Tennis", "Accumulators", "Value bets", "Longshots", "AI picks"];

const TIPS = [
  { sport: "Football", when: "Today", match: "Man City vs Arsenal · Premier League", pick: "BTTS & Over 2.5 Goals", time: "Sat 20:00", odds: "1.85", bm: "BET365", cls: "bet365", initials: "JM", author: "James Murphy", conf: 4, av: "#A855F7" },
  { sport: "Horse Racing", when: "Today", match: "15:30 Ascot · 2m Hurdle", pick: "Stormrider · Each Way", time: "15:30", odds: "6.00", bm: "P.POWER", cls: "paddypower", initials: "NO", author: "Niamh O'Connor", conf: 3, av: "#EF4444" },
  { sport: "Tennis", when: "Today", match: "Sinner vs Alcaraz · Madrid Open Final", pick: "Sinner -1.5 sets", time: "14:00", odds: "2.40", bm: "W.HILL", cls: "williamhill", initials: "MC", author: "Mark Chen", conf: 5, av: "#0EA5E9" },
  { sport: "Football", when: "Acca", match: "6-fold Premier League Acca", pick: "Saturday 3pm Acca", time: "Sat 15:00", odds: "14.50", bm: "BETFAIR", cls: "betfair", initials: "OA", author: "OddsCheck AI", conf: 4, av: "#2DD4BF" },
  { sport: "NBA", when: "Tonight", match: "Lakers vs Celtics", pick: "LeBron Over 24.5 points", time: "02:30", odds: "1.95", bm: "UNIBET", cls: "unibet", initials: "TB", author: "Tyler Banks", conf: 4, av: "#F97316" },
  { sport: "Cricket", when: "Tomorrow", match: "IND vs AUS · 3rd ODI", pick: "India to win", time: "Sun 09:00", odds: "1.72", bm: "888SPORT", cls: "888sport", initials: "PS", author: "Priya Shah", conf: 4, av: "#14B8A6" },
  { sport: "Football", when: "Sun", match: "Liverpool vs Chelsea · Premier League", pick: "Salah anytime scorer", time: "Sun 17:30", odds: "2.05", bm: "SKY BET", cls: "skybet", initials: "JM", author: "James Murphy", conf: 4, av: "#A855F7" },
  { sport: "Horse Racing", when: "Today", match: "14:20 Newbury · 1m4f Listed", pick: "Bold Endeavour · Win", time: "14:20", odds: "3.50", bm: "CORAL", cls: "coral", initials: "NO", author: "Niamh O'Connor", conf: 4, av: "#EF4444" },
  { sport: "Football", when: "Today", match: "Real Madrid vs Barcelona", pick: "Bellingham anytime scorer", time: "Sat 22:00", odds: "2.10", bm: "LADBROKES", cls: "ladbrokes", initials: "MC", author: "Mark Chen", conf: 4, av: "#0EA5E9" },
];

const TIPSTERS = [
  { initials: "JM", name: "James Murphy", stat: "68% · 42 tips", units: "+12.3 units", av: "#A855F7" },
  { initials: "NO", name: "Niamh O'Connor", stat: "64% · 38 tips", units: "+9.8 units", av: "#EF4444" },
  { initials: "MC", name: "Mark Chen", stat: "59% · 30 tips", units: "+7.2 units", av: "#0EA5E9" },
  { initials: "PS", name: "Priya Shah", stat: "55% · 24 tips", units: "+4.6 units", av: "#14B8A6" },
];

const si = (paths) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">{paths}</svg>;
const BY_SPORT = [
  { label: "Football", href: "/football", count: 5, icon: si(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="m12 5 4 3-1.5 5h-5L8 8l4-3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></>) },
  { label: "Horse Racing", href: "/racing", count: 11, icon: si(<path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />) },
  { label: "Tennis", href: "/tennis", count: 20, icon: si(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3.5 9c5 1 11 1 17 0M3.5 15c5-1 11-1 17 0" stroke="currentColor" strokeWidth="1.4" /></>) },
  { label: "Basketball", href: "/basketball", count: 22, icon: si(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3 12h18M12 3v18M5 5c3 3 4 11 0 14m14-14c-3 3-4 11 0 14" stroke="currentColor" strokeWidth="1.2" /></>) },
  { label: "Cricket", href: "/cricket", count: 10, icon: si(<><path d="m4 20 8-8 6-6-3-3-6 6-8 8 3 3Zm10-10 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" /></>) },
];

function Avatar({ initials, color, big }) {
  return <span className="avatar" style={{ background: `linear-gradient(135deg, ${color}, #1F2937)`, ...(big ? {} : { width: 24, height: 24, fontSize: 9 }) }}>{initials}</span>;
}

export default function TipsPage() {
  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Tips &amp; predictions</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <span className="chip chip-best mb-3">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Editors 62% strike rate · 30d
              </span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Today&apos;s tips &amp; predictions</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
                Hand-picked by our editors and AI. Every tip is confidence-scored, result-tracked,
                and priced at the best available bookmaker.
              </p>
            </div>
            <div className="flex gap-2">
              <Link className="btn btn-ghost btn-sm" href="/dashboard">Tip alerts</Link>
              <Link className="btn btn-primary btn-sm" href="/signup">Follow tipsters</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container layout-split-wide">
          <div>
            <div className="tab-pills-scroll mb-4">
              {TABS.map((t, i) => <button key={t} className={`tab-pill${i === 0 ? " active" : ""}`} disabled={i !== 0}>{t}</button>)}
            </div>

            <div className="grid grid-3">
              {TIPS.map((tip) => (
                <article className="card" key={tip.pick} style={{ padding: 20, display: "flex", flexDirection: "column" }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="chip chip-muted">{tip.sport}</span>
                    <span className="chip chip-best">{tip.when}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{tip.match}</div>
                  <h3 style={{ fontSize: 18, marginBottom: 6, lineHeight: 1.3 }}><Link href="/tip">{tip.pick}</Link></h3>
                  <div className="mute flex items-center gap-1" style={{ fontSize: 11, marginBottom: 16 }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    {tip.time}
                  </div>
                  <div className="flex justify-between items-center" style={{ padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 14 }}>
                    <div>
                      <div className="mute" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Best odds</div>
                      <div className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{tip.odds}</div>
                    </div>
                    <span className={`bm bm-lg bm-${tip.cls}`}>{tip.bm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar initials={tip.initials} color={tip.av} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{tip.author}</div>
                        <span className="confidence">{[0, 1, 2, 3, 4].map((n) => <i key={n} className={n < tip.conf ? "on" : ""} />)}</span>
                      </div>
                    </div>
                    <Link href="/tip" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>Read pick →</Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="pagination">
              <span className="page">‹</span>
              <span className="page active">1</span><span className="page">2</span><span className="page">3</span><span className="page">…</span><span className="page">12</span>
              <span className="page">›</span>
            </div>
            <StaticNote>Tips are static — needs a tips endpoint.</StaticNote>
          </div>

          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Top tipsters · 30 days</h4>
              {TIPSTERS.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: i === TIPSTERS.length - 1 ? 0 : "1px solid var(--border-soft)" }}>
                  <Avatar initials={t.initials} color={t.av} big />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div className="mute" style={{ fontSize: 11, marginTop: 2 }}>{t.stat}</div>
                  </div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{t.units}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, rgba(45,212,191,0.04), rgba(56,189,248,0.03))", borderColor: "rgba(45,212,191,0.18)" }}>
              <h4 style={{ fontSize: 15, marginBottom: 8 }}>Get tips by email</h4>
              <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Daily digest of our highest-confidence picks.</p>
              <div className="flex-col gap-2">
                <input className="input input-sm" type="email" placeholder="you@email.com" aria-label="Email" />
                <Link className="btn btn-primary btn-sm btn-block" href="/signup">Subscribe</Link>
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>By sport</h4>
              <div className="flex-col gap-2">
                {BY_SPORT.map((s) => (
                  <Link key={s.label} className="flex items-center justify-between" href={s.href} style={{ fontSize: 13, padding: "6px 0" }}>
                    <span className="flex items-center gap-2">{s.icon}{s.label}</span>
                    <span className="mute" style={{ fontSize: 11 }}>{s.count}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rg-banner" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ fontSize: 12 }}><b>18+ · Past performance does not guarantee future results.</b></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
