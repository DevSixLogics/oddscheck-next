import Link from "next/link";
import StaticNote from "./StaticNote";

// Static placeholder content (no API source — needs a tips endpoint).
const TIPS = [
  { sport: "Football", when: "Today", match: "Man City vs Arsenal", pick: "BTTS & Over 2.5 Goals", desc: "Both attacks firing — value lies in goals, not the winner.", odds: "1.85", bm: "BET365", cls: "bet365", initials: "JM", author: "James Murphy", conf: 4, av: "linear-gradient(135deg,#A855F7,#1F2937)" },
  { sport: "Horse Racing", when: "Today", match: "15:30 Ascot · 2m Hurdle", pick: "Stormrider · Each Way", desc: "Strong recent form on soft ground, drawn well in a competitive field.", odds: "6.00", bm: "P.POWER", cls: "paddypower", initials: "NO", author: "Niamh O'Connor", conf: 3, av: "linear-gradient(135deg,#EF4444,#1F2937)" },
  { sport: "Tennis", when: "Today", match: "Sinner vs Alcaraz · Madrid F", pick: "Sinner -1.5 sets", desc: "Sinner is 7-1 in last 8 vs top-5 on clay & in red-hot form.", odds: "2.40", bm: "W.HILL", cls: "williamhill", initials: "MC", author: "Mark Chen", conf: 4, av: "linear-gradient(135deg,#3B82F6,#1F2937)" },
  { sport: "Football", when: "Acca", match: "6-fold Saturday Acca", pick: "Saturday 3pm Acca", desc: "Six in-form home favourites, all priced 1.40-1.90. AI-picked.", odds: "14.50", bm: "BETFAIR", cls: "betfair", initials: "OA", author: "OddsCheck AI", conf: 4, av: "linear-gradient(135deg,#FF8E00,#1F2937)" },
  { sport: "NBA", when: "Tonight", match: "Lakers vs Celtics", pick: "LeBron Over 24.5 pts", desc: "LeBron averaged 28.4 vs Boston this season. Live underdog narrative.", odds: "1.95", bm: "UNIBET", cls: "unibet", initials: "TB", author: "Tyler Banks", conf: 3, av: "linear-gradient(135deg,#F59E0B,#1F2937)" },
  { sport: "Cricket", when: "Tomorrow", match: "IND vs AUS · 3rd ODI", pick: "India to win", desc: "Home conditions, batting depth, and Bumrah back from injury.", odds: "1.72", bm: "888SPORT", cls: "888sport", initials: "PS", author: "Priya Shah", conf: 4, av: "linear-gradient(135deg,#FF8E00,#1F2937)" },
];

/** Tips & predictions — static (needs a tips endpoint). */
export default function TipsSection() {
  return (
    <section className="section" style={{ background: "linear-gradient(180deg, var(--bg-0) 0%, var(--bg-1) 100%)" }}>
      <div className="container static-flag">
        <div className="section-head">
          <div>
            <div className="eyebrow">Expert insights</div>
            <h2>Tips &amp; predictions</h2>
            <p className="sub">Hand-picked by our editors and AI. Confidence-scored and result-tracked.</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <span className="chip chip-best">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                <path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Editors 62% strike rate · 30d
            </span>
            <Link className="btn btn-outline btn-sm" href="/tips">All tips →</Link>
          </div>
        </div>
        <div className="grid grid-3">
          {TIPS.map((tip) => (
            <article className="card" key={tip.pick} style={{ padding: 20, display: "flex", flexDirection: "column" }}>
              <div className="flex justify-between items-center mb-3">
                <span className="chip chip-muted">{tip.sport}</span>
                <span className="chip chip-best">{tip.when}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{tip.match}</div>
              <h3 style={{ fontSize: 18, marginBottom: 10, lineHeight: 1.3 }}><Link href="/tip">{tip.pick}</Link></h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 16, flex: 1 }}>{tip.desc}</p>
              <div className="flex justify-between items-center" style={{ padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Best odds</div>
                  <div className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{tip.odds}</div>
                </div>
                <span className={`bm bm-lg bm-${tip.cls}`}>{tip.bm}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="avatar" style={{ background: tip.av, width: 24, height: 24, fontSize: 9 }}>{tip.initials}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{tip.author}</div>
                    <span className="confidence">
                      {[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < tip.conf ? "on" : ""} />)}
                    </span>
                  </div>
                </div>
                <Link href="/tip" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>Read pick →</Link>
              </div>
            </article>
          ))}
        </div>
        <StaticNote>Tips are static — needs a tips endpoint.</StaticNote>
      </div>
    </section>
  );
}
