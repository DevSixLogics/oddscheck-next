import Link from "next/link";
import StaticNote from "@/components/StaticNote";

export const metadata = {
  title: "Best UK betting offers — free bets, boosts & cashback",
  description:
    "Free bets, bet builders, profit boosts and cashback from licensed UK bookmakers. Every offer's terms verified before listing.",
};

const FILTERS = [
  { title: "Sport", items: [["All", 1, true], ["Football", 32], ["Horse Racing", 18], ["Tennis", 8], ["Basketball", 5], ["Cricket", 3]] },
  { title: "Offer type", items: [["Free bets", 24], ["Bet builders", 12], ["Profit boosts", 9], ["Cashback", 8], ["No wagering", 6], ["Acca insurance", 5]] },
  { title: "Customer", items: [["New customers", 40], ["Existing customers", 38]] },
  { title: "Min deposit", items: [["No deposit", 4], ["£1 - £5", 12], ["£10", 32], ["£20+", 8]] },
];

const SORTS = ["Featured", "Highest rated", "Newest", "Highest value", "Closing soon"];

const OFFERS = [
  { bm: "BET365", name: "Bet365", cls: "bet365", rating: "4.8", chips: ["Editor's choice", "Free bet", "Multi-sport"], title: "Bet £10, get £30 in free bets", desc: "Stake matched up to £30 across 4 sports. Free bets credited within 24h. Min odds 1/2 (1.5).", minDep: "£10", minOdds: "1/2", claimed: "12,420" },
  { bm: "W.HILL", name: "William Hill", cls: "williamhill", rating: "4.7", chips: ["Best for variety", "Free bet", "Multi-sport"], title: "£40 in free bets + £10 casino bonus", desc: "Place 6 x £10 bets at min odds 1.5. Get 4 x £10 free bets + £10 casino bonus.", minDep: "£10", minOdds: "1.5", claimed: "9,180" },
  { bm: "P.POWER", name: "Paddy Power", cls: "paddypower", rating: "4.6", chips: ["No wagering", "Risk-free"], title: "Bet £10, get £30 in free bets", desc: "Money back as cash if your first bet loses. No wagering on winnings.", minDep: "£10", minOdds: "Any", claimed: "8,640" },
  { bm: "SKY BET", name: "Sky Bet", cls: "skybet", rating: "4.5", chips: ["Weekly", "Football"], title: "Bet £5, get £20 in free bets", desc: "Min £5 first bet on football. Free bets repeated weekly for new customers.", minDep: "£5", minOdds: "Any", claimed: "7,910" },
  { bm: "LADBROKES", name: "Ladbrokes", cls: "ladbrokes", rating: "4.4", chips: ["Low stake", "Multi-sport"], title: "Get £20 in free bets", desc: "Stake matched up to £20. Min first-bet odds 1/2. Free bets valid 7 days.", minDep: "£5", minOdds: "1/2", claimed: "6,330" },
  { bm: "BETFAIR", name: "Betfair", cls: "betfair", rating: "4.5", chips: ["Acca boost", "Acca"], title: "50% profit boost on accumulators", desc: "4+ leg football accas get a 50% profit boost up to £25. Opt in required.", minDep: "£5", minOdds: "2.0", claimed: "5,870" },
  { bm: "CORAL", name: "Coral", cls: "coral", rating: "4.3", chips: ["Football", "Enhanced"], title: "4/1 first goalscorer + £20 free bets", desc: "Enhanced 4/1 on your first goalscorer pick, plus £20 in free bets on settlement.", minDep: "£5", minOdds: "Any", claimed: "4,210" },
  { bm: "BETVICTOR", name: "BetVictor", cls: "betvictor", rating: "4.4", chips: ["Free bet", "Multi-sport"], title: "Bet £10, get £40 in free bets", desc: "£30 sports free bets + £10 casino bonus when you stake £10 at min odds 2.0.", minDep: "£10", minOdds: "2.0", claimed: "3,980" },
  { bm: "UNIBET", name: "Unibet", cls: "unibet", rating: "4.6", chips: ["Racing", "Money back"], title: "Money back if 2nd, up to £40", desc: "Money back as a free bet if your horse finishes 2nd to the SP favourite.", minDep: "£10", minOdds: "Any", claimed: "3,540" },
];

const goldStar = (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="#DAB46B" aria-hidden="true">
    <path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />
  </svg>
);

export default function OffersPage() {
  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(218,180,107,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Best betting offers</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <span className="chip chip-gold mb-3">{goldStar} Updated daily · all offers verified</span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Best UK betting offers</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
                Free bets, bet builders, profit boosts and cashback from licensed UK bookmakers.
                We verify every offer&apos;s terms before listing.
              </p>
            </div>
            <div className="flex-col gap-2" style={{ alignItems: "flex-end" }}>
              <div className="flex items-center gap-2 mute" style={{ fontSize: 12 }}>All offers · 18+ · Begambleaware.org · T&amp;Cs apply</div>
              <div className="flex gap-2" style={{ fontSize: 12, color: "var(--text-2)" }}>
                <span><b className="num">78</b> live offers</span><span className="mute">·</span>
                <span><b className="num">14</b> bookmakers</span><span className="mute">·</span>
                <span><b className="num">£340+</b> total value</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container layout-split">
          {/* Filters (static) */}
          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 18 }}>
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontWeight: 700, fontSize: 13 }}>Filters</span>
                <a href="#" style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>Clear</a>
              </div>
              {FILTERS.map((group, gi) => (
                <div key={group.title} style={{ paddingTop: gi === 0 ? 0 : 14, marginTop: gi === 0 ? 0 : 14, borderTop: gi === 0 ? 0 : "1px solid var(--border-soft)" }}>
                  <div className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{group.title}</div>
                  <div className="flex-col gap-2">
                    {group.items.map(([label, count, checked]) => (
                      <label key={label} className="checkbox" style={{ justifyContent: "space-between" }}>
                        <span className="flex items-center gap-2"><input type="checkbox" defaultChecked={!!checked} />{label}</span>
                        <span className="mute" style={{ fontSize: 11 }}>{count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 16, background: "linear-gradient(135deg, rgba(45,212,191,0.04), rgba(56,189,248,0.03))", borderColor: "rgba(45,212,191,0.18)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Offer alerts</div>
              <div className="mute" style={{ fontSize: 11, marginBottom: 10 }}>Get new free bets and boosts emailed to you, daily.</div>
              <Link className="btn btn-primary btn-sm btn-block" href="/signup">Get alerts</Link>
            </div>
          </aside>

          <div>
            <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
              <div className="muted" style={{ fontSize: 13 }}>Showing <b style={{ color: "var(--text)" }}>{OFFERS.length}</b> of 78 offers</div>
              <div className="tabs">
                {SORTS.map((s, i) => <span key={s} className={`tab${i === 0 ? " active" : ""}`}>{s}</span>)}
              </div>
            </div>

            <div className="grid grid-2">
              {OFFERS.map((o) => (
                <article className="card offer-card" key={o.bm}>
                  <div className="flex justify-between items-center" style={{ padding: "18px 22px", background: "linear-gradient(180deg, rgba(255,255,255,0.025), transparent 60%)", borderBottom: "1px solid var(--border-soft)", gap: 12 }}>
                    <span className="flex items-center gap-2"><span className={`bm bm-md bm-${o.cls}`}>{o.bm}</span><span style={{ fontWeight: 600, fontSize: 13 }}>{o.name}</span></span>
                    <span className="flex items-center gap-1" style={{ fontSize: 12 }}>{goldStar}<b className="num">{o.rating}</b><span className="mute">/5</span></span>
                  </div>
                  <div style={{ padding: "18px 22px", flex: 1 }}>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {o.chips.map((ch, i) => <span key={ch} className={`chip ${i === 0 ? "chip-best" : "chip-muted"}`}>{ch}</span>)}
                    </div>
                    <h3 style={{ fontSize: 20, lineHeight: 1.25, marginBottom: 10 }}><Link href="/review">{o.title}</Link></h3>
                    <p className="muted" style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 14 }}>{o.desc}</p>
                    <div className="grid grid-3" style={{ gap: 6, fontSize: 11, marginBottom: 14 }}>
                      {[["Min deposit", o.minDep], ["Min odds", o.minOdds], ["Claimed", o.claimed]].map(([k, v]) => (
                        <div key={k} style={{ padding: "8px 10px", background: "var(--bg-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
                          <div className="mute" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 3 }}>{k}</div>
                          <div style={{ fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center flex-wrap gap-2" style={{ padding: "14px 22px", borderTop: "1px solid var(--border-soft)", background: "rgba(255,255,255,0.015)" }}>
                    <div className="mute" style={{ fontSize: 10, flex: 1 }}>18+ · Begambleaware.org · T&amp;Cs apply</div>
                    <Link className="btn btn-ghost btn-sm" href="/review">Review</Link>
                    <Link className="btn btn-primary btn-sm" href="/review">Claim Offer</Link>
                  </div>
                </article>
              ))}
            </div>
            <StaticNote>Offers are static — needs a dedicated offers/bookmaker endpoint.</StaticNote>
          </div>
        </div>
      </section>
    </>
  );
}
