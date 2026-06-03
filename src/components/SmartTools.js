import Link from "next/link";

const svg = (paths, fill = "none", w = 14) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill={fill} aria-hidden="true">{paths}</svg>
);

const TOOLS = [
  { title: "Odds Calculator", desc: "Convert decimal, fractional and American", href: "/odds-calculator",
    icon: svg(<><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16) },
  { title: "Implied Probability", desc: "See the real % behind any price", href: "/odds-calculator",
    icon: svg(<><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>) },
  { title: "Accumulator Builder", desc: "Find best price on multi-leg bets", href: "/odds-calculator",
    icon: svg(<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />) },
  { title: "Each-Way Calculator", desc: "Place + win returns for racing", href: "/odds-calculator",
    icon: svg(<path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />) },
  { title: "Arbitrage Finder", desc: "32 surebets across books right now", href: "/tools", pro: true,
    icon: svg(<path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" />, "currentColor") },
  { title: "Expected Value Bets", desc: "+EV picks updated every minute", href: "/tools", pro: true,
    icon: svg(<path d="M12 2c1 4 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-2-4 1-7Z" />, "currentColor") },
  { title: "Bet Tracker", desc: "Log bets, P&L, ROI by sport & market", href: "/dashboard",
    icon: svg(<path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />, "currentColor") },
  { title: "Odds Alerts", desc: "Ping me when a price hits my target", href: "/tools",
    icon: svg(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16) },
  { title: "Line Movement", desc: "Sharp money & steam moves, real-time", href: "/live", pro: true,
    icon: svg(<path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />) },
  { title: "Public Betting Trends", desc: "See where the public is loading up", href: "/tools",
    icon: svg(<><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16) },
];

const tealBox = {
  width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center",
  background: "rgba(255,142,0,0.10)", color: "var(--accent)", border: "1px solid rgba(255,142,0,0.25)",
};
const goldBox = {
  width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center",
  background: "linear-gradient(135deg, rgba(218,180,107,0.18), rgba(194,140,66,0.10))",
  color: "var(--gold)", border: "1px solid rgba(218,180,107,0.3)",
};

/** "Smart betting tools" — static toolkit grid (matches the reference). */
export default function SmartTools() {
  return (
    <section className="section" style={{ background: "linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)" }}>
      <div className="container static-flag">
        <div className="section-head">
          <div>
            <div className="eyebrow">Toolkit</div>
            <h2>Smart betting tools</h2>
            <p className="sub">Pro-grade calculators, alerts and analytics — built for serious bettors.</p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/tools">Open tools dashboard →</Link>
        </div>
        <div className="grid grid-5">
          {TOOLS.map((t) => (
            <Link
              key={t.title}
              className="card"
              href={t.href}
              style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, minHeight: 170 }}
            >
              <div className="flex justify-between items-start">
                <span style={t.pro ? goldBox : tealBox}>{t.icon}</span>
                {t.pro && <span className="chip chip-gold" style={{ fontSize: 10, padding: "2px 6px" }}>PRO</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginTop: 6 }}>{t.desc}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Open →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
