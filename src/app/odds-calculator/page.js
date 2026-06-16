import Link from "next/link";
import OddsCalculator from "@/components/OddsCalculator";

export const metadata = { alternates: { canonical: "/odds-calculator" } };

const COMPARE = [
  ["1.50", "1/2", "-200", "66.67%", "£15.00"],
  ["1.91", "10/11", "-110", "52.36%", "£19.10"],
  ["2.00", "1/1", "+100", "50.00%", "£20.00"],
  ["2.50", "3/2", "+150", "40.00%", "£25.00"],
  ["3.00", "2/1", "+200", "33.33%", "£30.00"],
  ["4.00", "3/1", "+300", "25.00%", "£40.00"],
  ["6.00", "5/1", "+500", "16.67%", "£60.00"],
  ["11.00", "10/1", "+1000", "9.09%", "£110.00"],
];

const RELATED = [
  ["Accumulator Calculator", "/tools"],
  ["Each-Way Calculator", "/tools"],
  ["Implied Probability", "/tools"],
  ["Expected Value (EV)", "/tools"],
  ["Bet Tracker", "/dashboard"],
];

export default function OddsCalculatorPage() {
  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href="/tools">Tools</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Odds Calculator</span></li>
            </ol>
          </nav>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 10 }}>Odds Calculator</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660 }}>
            Convert between decimal, fractional and American odds. Calculate implied probability,
            returns and profit on any stake.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container layout-split-wide">
          <div className="flex-col gap-5">
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 18 }}>Convert &amp; calculate</h2>
              <OddsCalculator />
            </div>

            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>How odds formats compare</h2>
              <div className="table-scroll">
                <table className="dt">
                  <thead>
                    <tr><th>Decimal</th><th>Fractional</th><th>American</th><th>Implied prob.</th><th>£10 returns</th></tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((r) => (
                      <tr key={r[0]}>
                        {r.map((cell, i) => <td className="num" key={i}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card prose" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22 }}>When should you use each format?</h2>
              <div className="prose">
                <p><b>Decimal</b> is the easiest format to compare — multiply stake × odds to get the return. UK and Europe default.</p>
                <p><b>Fractional</b> is traditional in UK horse racing and football. &ldquo;3/1&rdquo; means £3 profit per £1 staked.</p>
                <p><b>American</b> uses + and − to express how much you win or stake to win £100. <code>+150</code> = win £150 from a £100 stake. <code>-110</code> = stake £110 to win £100.</p>
                <h3>Why &ldquo;implied probability&rdquo; matters</h3>
                <p>Every odds price implies a probability — that&apos;s the bookmaker&apos;s view of how likely an outcome is. Add a margin (the &ldquo;overround&rdquo;) on top, and you have the price you see. If you think the true probability is higher than the implied one, you&apos;ve found a <Link href="/guide">value bet</Link>.</p>
              </div>
            </div>
          </div>

          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Related tools</h4>
              <div className="flex-col gap-2">
                {RELATED.map(([label, href]) => (
                  <Link key={label} className="flex items-center gap-2" href={href} style={{ padding: "9px 10px", borderRadius: 7, background: "var(--bg-2)", fontSize: 13 }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Read next</h4>
              <ul className="flex-col gap-2" style={{ fontSize: 13, lineHeight: 1.5 }}>
                <li><Link href="/guide">How to read betting odds</Link></li>
                <li><Link href="/guide">What is implied probability?</Link></li>
                <li><Link href="/guide">What makes a value bet?</Link></li>
                <li><Link href="/guide">How accumulators work</Link></li>
              </ul>
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
