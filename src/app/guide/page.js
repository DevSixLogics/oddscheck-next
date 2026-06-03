import Link from "next/link";
import styles from "./guide.module.scss";

export const metadata = {
  title: "How to read betting odds — beginner's guide",
  description:
    "Three formats, one core idea: odds are a way of saying how likely the bookmaker thinks something is. Learn decimal, fractional and American odds, implied probability and the overround.",
};

const TOC = [
  ["decimal", "Decimal odds"],
  ["fractional", "Fractional odds"],
  ["american", "American odds"],
  ["implied", "Implied probability"],
  ["overround", "The overround"],
  ["value", "Finding value"],
  ["tldr", "TL;DR"],
];

const READ_NEXT = [
  ["What is implied probability?", "/guide/implied-probability"],
  ["What makes a value bet?", "/guide/value-bets"],
  ["How accumulators work", "/guide/accumulators"],
  ["How to compare bookmakers", "/guide/compare-bookmakers"],
  ["How free bets actually work", "/guide/free-bets"],
];

export default function GuidePage() {
  return (
    <>
      <section style={{ padding: "32px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href="/guides">Guides</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">How to read betting odds</span></li>
            </ol>
          </nav>
          <div className="flex gap-2 mb-3" style={{ marginTop: 12 }}>
            <span className="chip chip-best">Beginner</span>
            <span className="chip chip-muted">5 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, maxWidth: "18ch", marginBottom: 14 }}>
            How to read betting odds
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.55, maxWidth: 680 }}>
            Three formats, one core idea: odds are just a way of saying &ldquo;how likely the bookmaker
            thinks this is.&rdquo; Here&apos;s how to read them — and what to look for.
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="avatar" style={{ background: "linear-gradient(135deg,#A855F7,#6D28D9)" }}>JM</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>James Murphy</div>
              <div className="mute" style={{ fontSize: 11 }}>Updated May 2026</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          <aside className={styles.toc}>
            <div className="head">On this page</div>
            <nav>
              {TOC.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
          </aside>

          <article className="prose">
            <p style={{ fontSize: 18 }}><b>Odds tell you two things at once:</b> what you stand to win, and how likely the bookmaker thinks the outcome is. Once you understand that, the three formats — decimal, fractional, and American — are just different ways of writing the same number.</p>

            <h2 id="decimal">Decimal odds</h2>
            <p>The simplest format. Multiply your stake by the decimal price to get your return.</p>
            <figure>
              <code style={{ fontSize: 14 }}>Stake × Decimal odds = Return</code><br />
              <code style={{ fontSize: 14 }}>£10 × 2.50 = £25 return (£15 profit)</code>
            </figure>
            <p>If you see odds of <code>2.50</code>, a £10 bet returns £25 — that&apos;s your £10 stake back plus £15 profit. Easy.</p>
            <p>Decimal is the default in the UK, Europe and Australia. <Link href="/odds-calculator">Use our odds calculator</Link> to convert any price to decimal instantly.</p>

            <h2 id="fractional">Fractional odds</h2>
            <p>Traditional in UK horse racing and football betting shops. The fraction shows profit per unit staked.</p>
            <figure>
              <code style={{ fontSize: 14 }}>3/1 = win 3 for every 1 staked → £10 stake = £30 profit, £40 return</code><br />
              <code style={{ fontSize: 14 }}>1/2 = win 1 for every 2 staked → £10 stake = £5 profit, £15 return</code>
            </figure>
            <p>To convert fractional to decimal: divide and add 1. <code>3/1 → 3 ÷ 1 + 1 = 4.00</code>. <code>1/2 → 1 ÷ 2 + 1 = 1.50</code>.</p>

            <h2 id="american">American odds</h2>
            <p>Used in the US and Canada. Always given as <b>+</b> or <b>−</b> a number.</p>
            <ul>
              <li><b>+150</b> means you&apos;d win £150 from a £100 stake (£250 return)</li>
              <li><b>−110</b> means you&apos;d stake £110 to win £100 (£210 return)</li>
            </ul>
            <p>Plus odds are underdogs (longer prices), minus odds are favourites (shorter prices). The number tells you the dollar amount, not the unit.</p>

            <h2 id="implied">Implied probability — the key concept</h2>
            <p>Every set of odds has a <b>built-in probability</b>. That&apos;s the bookmaker&apos;s estimate of how likely the outcome is. To calculate it from decimal odds:</p>
            <figure>
              <code style={{ fontSize: 14 }}>Implied probability = 1 ÷ decimal odds × 100</code><br />
              <code style={{ fontSize: 14 }}>2.50 → 1 ÷ 2.50 = 40%</code><br />
              <code style={{ fontSize: 14 }}>1.50 → 1 ÷ 1.50 = 66.67%</code>
            </figure>
            <p>If you can spot an outcome where you think the <i>real</i> probability is higher than the implied one — and the gap is bigger than the bookmaker&apos;s margin — you&apos;ve found a <Link href="/guide">value bet</Link>.</p>

            <blockquote>The whole game is comparing the implied probability of a price to your own honest estimate of the real probability. Everything else is detail.</blockquote>

            <h2 id="overround">The overround (a.k.a. the bookmaker&apos;s margin)</h2>
            <p>If you add up the implied probability of every outcome in a market, it always exceeds 100%. The amount it exceeds 100% by is the bookmaker&apos;s margin — called the <b>overround</b>.</p>
            <p>For a Premier League match priced at City 2.10, Draw 3.50, Arsenal 3.30:</p>
            <figure>
              <code style={{ fontSize: 13 }}>City:    1 ÷ 2.10 = 47.6%</code><br />
              <code style={{ fontSize: 13 }}>Draw:    1 ÷ 3.50 = 28.6%</code><br />
              <code style={{ fontSize: 13 }}>Arsenal: 1 ÷ 3.30 = 30.3%</code><br />
              <code style={{ fontSize: 13 }}><b>Total:  106.5% → 6.5% overround</b></code>
            </figure>
            <p>Lower overround = better prices for you. We surface overround on every <Link href="/event">event page</Link> so you can quickly see which book is offering the fairest market.</p>

            <h2 id="value">Finding value</h2>
            <p>You don&apos;t need to predict winners — you need to find prices where the implied probability is <i>lower</i> than the real probability. Comparing 14 bookmakers (like we do) helps you find the best available price in any market, which directly increases your edge.</p>
            <p>Example: if City vs Arsenal sees City at 2.10 with one book but 2.20 with another, that 0.10 difference is roughly <b>4.5% more profit on every winning bet</b>. Over a year that compounds dramatically.</p>

            <h2 id="tldr">TL;DR</h2>
            <ul>
              <li><b>Decimal</b>: <code>stake × odds = return</code></li>
              <li><b>Fractional</b>: <code>X/Y = win X per Y staked</code></li>
              <li><b>American</b>: <code>+X = win X per £100</code>, <code>−X = stake X to win £100</code></li>
              <li><b>Implied probability</b> = <code>1 ÷ decimal odds × 100</code></li>
              <li><b>Overround</b> = bookmaker&apos;s margin (lower is better for you)</li>
              <li><b>Value</b> = real probability &gt; implied probability</li>
            </ul>

            <div className={styles.callout}>
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,142,0,0.12)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div><b>Try it yourself:</b> <span className="muted">Convert any price &amp; calculate value</span></div>
                </div>
                <Link className="btn btn-primary btn-sm" href="/odds-calculator">Open calculator →</Link>
              </div>
            </div>
          </article>

          <aside className={`flex-col gap-4 ${styles.related}`}>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Read next</h4>
              <div className="flex-col gap-2">
                {READ_NEXT.map(([label, href], i) => (
                  <Link key={label} className="flex items-center gap-2" href={href} style={{ padding: "8px 0", borderBottom: i === READ_NEXT.length - 1 ? 0 : "1px solid var(--border-soft)", fontSize: 13 }}>
                    → {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, rgba(255,142,0,0.04), rgba(56,189,248,0.03))", borderColor: "rgba(255,142,0,0.18)" }}>
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Now compare some real odds</h4>
              <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>See best price across 14 books on today&apos;s matches.</p>
              <Link className="btn btn-primary btn-sm btn-block" href="/football">Open today&apos;s odds</Link>
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
