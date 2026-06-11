import Link from "next/link";
import BettingTools from "@/components/BettingTools";
import DiscoveryTools from "@/components/DiscoveryTools";

export const metadata = {
  title: "Smart betting tools — calculators, arbitrage, +EV & alerts",
  description: "Pro-grade calculators, arbitrage finders, +EV picks, alerts and bet tracking — all in one place. Free to start.",
};

const ic = (paths, fill = "none", w = 14) => <svg viewBox="0 0 24 24" width={w} height={w} fill={fill} aria-hidden="true">{paths}</svg>;
const ICONS = {
  calc: ic(<><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16),
  pct: ic(<><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>),
  plus: ic(<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />),
  racing: ic(<path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />),
  flame: ic(<path d="M12 2c1 4 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-2-4 1-7Z" />, "currentColor"),
  bolt: ic(<path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" />, "currentColor"),
  star: ic(<path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />, "currentColor"),
  arrows: ic(<path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />),
  bell: ic(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16),
  eye: ic(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></>),
};

const SECTIONS = [
  {
    title: "Calculators", more: "View all calculators →",
    tools: [
      { title: "Odds Calculator", desc: "Convert decimal, fractional & American formats.", href: "/tools?calc=odds", icon: ICONS.calc },
      { title: "Implied Probability", desc: "Translate odds into a real-world probability.", href: "/tools?calc=implied", icon: ICONS.pct },
      { title: "Accumulator Calculator", desc: "Returns for any multi-leg bet.", href: "/tools?calc=acca", icon: ICONS.plus },
      { title: "Each-Way Calculator", desc: "Place + win returns for racing bets.", href: "/tools?calc=ew", icon: ICONS.racing },
      { title: "Arbitrage Calculator", desc: "Split stakes for a guaranteed surebet profit.", href: "/tools?calc=arb", icon: ICONS.arrows },
      { title: "Kelly Criterion", desc: "Optimal stake sizing for your edge.", href: "/tools?calc=kelly", icon: ICONS.bolt },
    ],
  },
];

const tealBox = { width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.10)", color: "var(--accent)", border: "1px solid rgba(255,142,0,0.25)" };
const goldBox = { width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(218,180,107,0.18), rgba(194,140,66,0.10))", color: "var(--gold)", border: "1px solid rgba(218,180,107,0.3)" };

export default function ToolsPage() {
  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Smart betting tools</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <span className="chip chip-best mb-3"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" /></svg> Free calculators · no signup</span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Smart betting tools</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
                Free calculators for odds, value and staking — convert prices, work out implied
                probability, accumulators, each-way, arbitrage and Kelly stakes, all in one place.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link className="btn btn-primary" href="/tools?calc=odds">Open the calculators</Link>
              <Link className="btn btn-ghost" href="/live">Compare live odds</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container flex-col gap-7">
          {/* Working calculators — Odds converter, Accumulator, Each-Way, Arbitrage, Kelly */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,142,0,0.10)", display: "grid", placeItems: "center", color: "var(--accent)" }}>{ICONS.calc}</span>
              <h2 style={{ fontSize: 24 }}>Calculators</h2><span className="chip chip-best">Live</span>
            </div>
            <BettingTools />
          </div>

          {/* Discovery — live scanners over the multi-bookmaker odds feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,142,0,0.10)", display: "grid", placeItems: "center", color: "var(--accent)" }}>{ICONS.bolt}</span>
              <h2 style={{ fontSize: 24 }}>Discovery</h2><span className="chip chip-best">Live</span>
            </div>
            <DiscoveryTools />
          </div>

          {/* Tool sections */}
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <div className="flex justify-between items-end mb-3 flex-wrap gap-2">
                <h2 style={{ fontSize: 24 }}>{sec.title}</h2>
                <Link href="#" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>{sec.more}</Link>
              </div>
              <div className="grid grid-4">
                {sec.tools.map((t) => (
                  <Link key={t.title} className="card" href={t.href} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, minHeight: 180 }}>
                    <div className="flex justify-between items-start">
                      <span style={t.pro ? goldBox : tealBox}>{t.icon}</span>
                      {t.pro && <span className="chip chip-gold" style={{ fontSize: 10, padding: "2px 6px" }}>PRO</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.title}</div>
                      <div className="muted" style={{ fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{t.desc}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Open →</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Free-tools CTA */}
          <div className="card" style={{ padding: 36, background: "linear-gradient(135deg, #0E1729, #0F2333 60%, #2A1A05)", borderColor: "rgba(255,142,0,0.30)" }}>
            <div className="grid grid-2" style={{ gap: 40, alignItems: "center" }}>
              <div>
                <span className="chip chip-gold mb-3">100% free · no signup</span>
                <h2 style={{ fontSize: 28, margin: "12px 0" }}>Every calculator, free to use</h2>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Convert odds, work out implied probability, size accumulators, each-way and arbitrage bets, and find your Kelly stake — then compare the best price across top bookmakers. No account, no paywall.</p>
                <Link className="btn btn-primary btn-lg" href="/tools?calc=odds">Open the calculators</Link>
              </div>
              <ul className="flex-col gap-2" style={{ fontSize: 13, listStyle: "none", padding: 0 }}>
                {["Decimal / fractional / American converter", "Implied probability & fair odds", "Accumulator & each-way returns", "2-way arbitrage & Kelly staking", "Best price compared across bookmakers"].map((f) => (
                  <li key={f} className="flex items-start gap-2"><span style={{ color: "var(--accent)" }}>✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
