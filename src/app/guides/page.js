import Link from "next/link";

export const metadata = {
  title: "Betting guides — learn to bet smarter",
  description: "From reading your first odds to expected value — short reads, plain English, and the maths that actually matters.",
};

const i = (paths, fill = "none") => <svg viewBox="0 0 24 24" width="14" height="14" fill={fill} aria-hidden="true">{paths}</svg>;

const TOPICS = [
  {
    title: "Betting basics", count: 18, color: "#FF8E00",
    icon: i(<path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />, "currentColor"),
    links: [["How to read betting odds", "/guide"], ["How a bookmaker makes money", "/guide"], ["How to place your first bet", "/guide"], ["Decimal vs fractional vs American", "/guide"]],
  },
  {
    title: "Strategy & value", count: 14, color: "#FFA733",
    icon: i(<><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>),
    links: [["What is implied probability?", "/guide/implied-probability"], ["What makes a value bet?", "/guide/value-bets"], ["Expected value (EV) explained", "/guide"], ["How to spot a steam move", "/guide"]],
  },
  {
    title: "Bet types", count: 22, color: "#DAB46B",
    icon: i(<path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />),
    links: [["How accumulators work", "/guide/accumulators"], ["What are prop bets?", "/guide/prop-bets"], ["Each-way explained", "/guide"], ["System bets & Trixie / Yankee", "/guide"]],
  },
  {
    title: "Offers & bonuses", count: 9, color: "#EC4899",
    icon: i(<path d="M12 2c1 4 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-2-4 1-7Z" />, "currentColor"),
    links: [["How free bets actually work", "/guide/free-bets"], ['Why "no wagering" matters', "/guide"], ["Reading offer T&Cs in 60 seconds", "/guide"], ["How to maximise welcome bonuses", "/guide"]],
  },
  {
    title: "Sport-specific", count: 24, color: "#A855F7",
    icon: i(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="m12 5 4 3-1.5 5h-5L8 8l4-3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></>),
    links: [["How to bet on football", "/guide"], ["How to bet on horse racing", "/guide"], ["Tennis betting tips for beginners", "/guide"], ["NBA props that have edge", "/guide"]],
  },
  {
    title: "Responsible gambling", count: 6, color: "#FF4D67",
    icon: i(<><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>),
    links: [["Setting deposit limits", "/responsible-gambling"], ["When the fun stops", "/responsible-gambling"], ["Self-exclusion explained", "/responsible-gambling"], ["Resources: GamCare, GamStop", "/responsible-gambling"]],
  },
];

const POPULAR = [
  { badge: "1", level: "Beginner", title: "How to read betting odds", time: "5 min read", href: "/guide" },
  { badge: "%", level: "Beginner", title: "What is implied probability?", time: "4 min read", href: "/guide/implied-probability" },
  { badge: "V", level: "Intermediate", title: "What makes a value bet?", time: "7 min read", href: "/guide/value-bets" },
  { badge: "∑", level: "Beginner", title: "How accumulators work", time: "6 min read", href: "/guide/accumulators" },
  { badge: "£", level: "Beginner", title: "How free bets actually work", time: "5 min read", href: "/guide/free-bets" },
  { badge: "P", level: "Intermediate", title: "What are prop bets?", time: "6 min read", href: "/guide/prop-bets" },
  { badge: "⇄", level: "Intermediate", title: "How to compare bookmakers", time: "8 min read", href: "/guide/compare-bookmakers" },
  { badge: "+", level: "Essential", title: "Responsible betting guide", time: "4 min read", href: "/responsible-gambling" },
];

export default function GuidesPage() {
  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Betting guides</span></li>
            </ol>
          </nav>
          <span className="chip chip-best mb-3" style={{ marginTop: 12 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" /></svg>
            93 guides · plain English, no jargon
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Learn to bet smarter</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660, lineHeight: 1.55 }}>
            From reading your first odds to expected value calculations — short reads, plain English,
            and the maths that actually matters.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container flex-col gap-7">
          {/* Browse by topic */}
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 18 }}>Browse by topic</h2>
            <div className="grid grid-3">
              {TOPICS.map((t) => (
                <div className="card" key={t.title} style={{ padding: 24 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.10)", color: t.color, border: "1px solid rgba(255,255,255,0.06)" }}>{t.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 16 }}>{t.title}</h3>
                      <div className="mute" style={{ fontSize: 11 }}>{t.count} guides</div>
                    </div>
                  </div>
                  <ul className="flex-col gap-2" style={{ listStyle: "none", padding: 0 }}>
                    {t.links.map(([label, href]) => (
                      <li key={label}><Link href={href} style={{ fontSize: 13 }}>→ {label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Most popular guides */}
          <div>
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 24 }}>Most popular guides</h2>
                <p className="sub">Start here — these answer 80% of beginner questions.</p>
              </div>
            </div>
            <div className="grid grid-4">
              {POPULAR.map((g) => (
                <Link key={g.title} className="card" href={g.href} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, minHeight: 160 }}>
                  <div className="flex justify-between items-start">
                    <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{g.badge}</span>
                    <span className="chip chip-muted" style={{ fontSize: 10, padding: "2px 7px" }}>{g.level}</span>
                  </div>
                  <h4 style={{ fontSize: 15, lineHeight: 1.3, flex: 1 }}>{g.title}</h4>
                  <div className="flex justify-between items-center mute" style={{ fontSize: 12 }}>
                    <span>{g.time}</span><span style={{ color: "var(--accent)", fontWeight: 600 }}>Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Put it into practice CTA */}
          <div className="card" style={{ padding: 36, background: "linear-gradient(135deg, #0E1729, #0F2333 60%, #2A1A05)", borderColor: "rgba(255,142,0,0.30)", position: "relative", overflow: "hidden" }}>
            <div className="grid grid-2" style={{ gap: 40, alignItems: "center" }}>
              <div>
                <span className="chip chip-best mb-3">Free · no signup</span>
                <h2 style={{ fontSize: 28, margin: "12px 0" }}>Ready to put it into practice?</h2>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>Start with how to read odds and implied probability, then compare real prices across bookmakers and size your stakes with our free calculators — odds, value, staking and bankroll, no account needed.</p>
              </div>
              <div className="flex-col gap-2">
                <Link className="btn btn-primary btn-lg btn-block" href="/guide">How to read odds →</Link>
                <Link className="btn btn-ghost btn-lg btn-block" href="/tools">Open the free calculators</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
