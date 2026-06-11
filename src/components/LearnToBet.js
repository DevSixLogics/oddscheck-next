import Link from "next/link";

const GUIDES = [
  { badge: "1", level: "Beginner", title: "How to read betting odds", time: "5 min read", href: "/guide" },
  { badge: "%", level: "Beginner", title: "What is implied probability?", time: "4 min read", href: "/guide/implied-probability" },
  { badge: "V", level: "Intermediate", title: "What makes a value bet?", time: "7 min read", href: "/guide/value-bets" },
  { badge: "∑", level: "Beginner", title: "How accumulators work", time: "6 min read", href: "/guide/accumulators" },
  { badge: "£", level: "Beginner", title: "How free bets actually work", time: "5 min read", href: "/guide/free-bets" },
  { badge: "P", level: "Intermediate", title: "What are prop bets?", time: "6 min read", href: "/guide/prop-bets" },
  { badge: "⇄", level: "Intermediate", title: "How to compare bookmakers", time: "8 min read", href: "/guide/compare-bookmakers" },
  { badge: "+", level: "Essential", title: "Responsible betting guide", time: "4 min read", href: "/responsible-gambling" },
];

const tealBadge = { width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", fontSize: 18, fontWeight: 700, color: "var(--accent)" };

/** "Learn to bet smarter" — static guides grid (matches the reference). */
export default function LearnToBet() {
  return (
    <section className="section" style={{ background: "linear-gradient(180deg, var(--bg-0), var(--bg-1))" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Education</div>
            <h2>Learn to bet smarter</h2>
            <p className="sub">From your first odds to expected value — short reads, no jargon.</p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/guides">Guide library →</Link>
        </div>
        <div className="grid grid-4">
          {GUIDES.map((g) => (
            <Link key={g.title} className="card" href={g.href} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, minHeight: 160 }}>
              <div className="flex justify-between items-start">
                <span style={tealBadge}>{g.badge}</span>
                <span
                  className="chip"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--border-soft)", color: "var(--text-dim)", fontSize: 10, padding: "2px 7px" }}
                >
                  {g.level}
                </span>
              </div>
              <h4 style={{ fontSize: 15, lineHeight: 1.3, flex: 1 }}>{g.title}</h4>
              <div className="flex justify-between items-center mute" style={{ fontSize: 12 }}>
                <span>{g.time}</span>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
