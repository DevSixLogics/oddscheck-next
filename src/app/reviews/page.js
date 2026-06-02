import Link from "next/link";

export const metadata = {
  title: "Best UK bookmaker reviews 2026 — rated & compared",
  description: "Independent, verified bookmaker reviews: odds, app, customer service, payout speed, in-play and offer fairness — rated on what matters.",
};

const star = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />
  </svg>
);

const REVIEWS = [
  { bm: "BET365", name: "Bet365", cls: "bet365", rating: "4.8", badge: "Editor's pick", offer: "Bet £10, get £30 in free bets", minDep: "£10", payout: "~94.5%", feats: ["Best in-play coverage", "Live streaming", "Bet builder"] },
  { bm: "W.HILL", name: "William Hill", cls: "williamhill", rating: "4.7", badge: "Best for variety", offer: "£40 free bets + £10 casino bonus", minDep: "£10", payout: "~93.8%", feats: ["1,200+ football matches/week", "Solid app", "Reliable cashout"] },
  { bm: "P.POWER", name: "Paddy Power", cls: "paddypower", rating: "4.6", badge: "Best T&Cs", offer: "Bet £10, get £30 in free bets", minDep: "£10", payout: "~94.1%", feats: ["Quick withdrawals", "No-wagering bonuses", "Money-back specials"] },
  { bm: "SKY BET", name: "Sky Bet", cls: "skybet", rating: "4.5", badge: "Best app", offer: "Bet £5, get £20 in free bets", minDep: "£5", payout: "~93.5%", feats: ["Best mobile UX", "Weekly recurring offers", "Boosts daily"] },
  { bm: "LADBROKES", name: "Ladbrokes", cls: "ladbrokes", rating: "4.4", badge: "Best for racing", offer: "Get £20 in free bets", minDep: "£5", payout: "~93.2%", feats: ["Best Odds Guaranteed racing", "Strong Irish racing coverage", "Reliable streaming"] },
  { bm: "CORAL", name: "Coral", cls: "coral", rating: "4.3", badge: "Best for football boosts", offer: "4/1 first goalscorer + £20 free bets", minDep: "£10", payout: "~93.0%", feats: ["Football specials daily", "Strong UK shop integration", "Fast cashout"] },
  { bm: "BETVICTOR", name: "BetVictor", cls: "betvictor", rating: "4.4", badge: "Best customer service", offer: "Bet £10, get £40 in free bets", minDep: "£10", payout: "~94.0%", feats: ["24/7 phone support", "Higher limits", "Reliable cashout"] },
  { bm: "BETFAIR", name: "Betfair", cls: "betfair", rating: "4.5", badge: "Best exchange", offer: "50% profit boost on accumulators", minDep: "£5", payout: "~95.2%", feats: ["Betting exchange", "Low margins", "Cash out"] },
  { bm: "UNIBET", name: "Unibet", cls: "unibet", rating: "4.6", badge: "Best for tennis", offer: "Money back if 2nd, up to £40", minDep: "£10", payout: "~93.6%", feats: ["Deep tennis coverage", "Clean app", "Acca insurance"] },
];

const FILTERS = [
  { title: "Strength", items: ["Best overall", "Best for racing", "Best for football", "Best app", "Best in-play", "Best T&Cs"], firstChecked: true },
  { title: "Min deposit", items: ["No deposit", "£1 - £5", "£10", "£20+"] },
  { title: "Features", items: ["Cash out", "Live streaming", "Bet builder", "Best odds guaranteed", "Exchange", "Acca insurance"] },
];

const SORTS = ["Highest rated", "Most popular", "Best welcome offer", "Best app"];

export default function ReviewsPage() {
  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Bookmaker reviews</span></li>
            </ol>
          </nav>
          <span className="chip chip-best mb-3" style={{ marginTop: 12 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Independent, verified reviews
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Best UK bookmaker reviews 2026</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660, lineHeight: 1.55 }}>
            We test every UK bookmaker — odds, app, customer service, payout speed, in-play, and
            offer fairness — and rate them on the things that actually matter.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container layout-split">
          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 13, marginBottom: 14 }}>Filters</h4>
              {FILTERS.map((g, gi) => (
                <div key={g.title} style={{ paddingTop: gi === 0 ? 0 : 14, marginTop: gi === 0 ? 0 : 14, borderTop: gi === 0 ? 0 : "1px solid var(--border-soft)" }}>
                  <div className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{g.title}</div>
                  <div className="flex-col gap-2">
                    {g.items.map((it, i) => (
                      <label key={it} className="checkbox"><input type="checkbox" defaultChecked={gi === 0 && i === 0 && g.firstChecked} />{it}</label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 16 }}>
              <h4 style={{ fontSize: 13, marginBottom: 10 }}>How we rate</h4>
              <ul className="flex-col gap-2 muted" style={{ fontSize: 12, lineHeight: 1.5, listStyle: "none", padding: 0 }}>
                <li>✓ Odds quality (40%)</li>
                <li>✓ Offer value &amp; T&amp;Cs (20%)</li>
                <li>✓ App &amp; UX (15%)</li>
                <li>✓ Support &amp; payout (15%)</li>
                <li>✓ Market coverage (10%)</li>
              </ul>
              <Link href="/about" style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, marginTop: 10, display: "inline-block" }}>Our methodology →</Link>
            </div>
          </aside>

          <div className="flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="muted" style={{ fontSize: 13 }}>{REVIEWS.length} bookmakers · rated &amp; reviewed in the last 30 days</div>
              <div className="tabs">
                {SORTS.map((s, i) => <span key={s} className={`tab${i === 0 ? " active" : ""}`}>{s}</span>)}
              </div>
            </div>

            {REVIEWS.map((r) => (
              <article className="card" key={r.bm} style={{ padding: 24 }}>
                <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`bm bm-lg bm-${r.cls}`}>{r.bm}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{r.name}</div>
                      <div className="flex items-center gap-1 mute" style={{ fontSize: 12, marginTop: 2 }}>
                        <span style={{ color: "var(--gold)", display: "inline-flex" }}>{star}{star}{star}{star}{star}</span>
                        <b className="num" style={{ color: "var(--text)", marginLeft: 6 }}>{r.rating}</b>/5
                      </div>
                    </div>
                  </div>
                  <span className="chip chip-best">{r.badge}</span>
                </div>
                <div className="grid grid-3" style={{ gap: 14, margin: "14px 0" }}>
                  {[["Welcome offer", r.offer], ["Min deposit", r.minDep], ["Avg. payout %", r.payout]].map(([k, v]) => (
                    <div key={k} style={{ padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div className="mute" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {r.feats.map((f) => <span key={f} className="chip chip-muted">✓ {f}</span>)}
                </div>
                <div className="flex gap-2">
                  <Link className="btn btn-primary flex-1" href="/review">Read review</Link>
                  <Link className="btn btn-ghost btn-sm" href="/offers">Claim offer</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
