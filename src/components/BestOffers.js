import Link from "next/link";
import StaticNote from "./StaticNote";
import StaticDot from "./StaticDot";

// Static placeholder content (no API source — see coverage map).
const OFFERS = [
  { bm: "BET365", name: "Bet365", cls: "bet365", chip: "Editor's choice", tag: "New customer", offer: "Bet £10, get £30 in free bets", desc: "New customers · Min deposit £10 · 7-day expiry on free bets.", minDep: "£10", rating: "4.8" },
  { bm: "W.HILL", name: "William Hill", cls: "williamhill", chip: "Best for accas", tag: "Bet builder", offer: "£40 in free bets + £10 casino", desc: "Min £10 first bet at evens or greater. Free bets credited 24h.", minDep: "£10", rating: "4.7" },
  { bm: "P.POWER", name: "Paddy Power", cls: "paddypower", chip: "No wagering", tag: "Risk-free", offer: "Bet £10, get £30 in free bets", desc: "Money back as cash if your first bet loses. No wagering.", minDep: "£10", rating: "4.6" },
  { bm: "SKY BET", name: "Sky Bet", cls: "skybet", chip: "Weekly free bets", tag: "Football", offer: "Bet £5 get £20 in free bets", desc: "Min £5 first bet on football. Bet repeated weekly.", minDep: "£5", rating: "4.5" },
  { bm: "LADBROKES", name: "Ladbrokes", cls: "ladbrokes", chip: "Low stake", tag: "Multi-sport", offer: "Get £20 in free bets", desc: "Stake matched up to £20. Min first-bet odds 1/2.", minDep: "£5", rating: "4.4" },
  { bm: "BETFAIR", name: "Betfair", cls: "betfair", chip: "Acca boost", tag: "Acca", offer: "50% profit boost on accas", desc: "4+ leg football accas get a 50% profit boost up to £25.", minDep: "£5", rating: "4.5" },
];

/** Best betting offers — static (needs an offers/bookmaker endpoint). */
export default function BestOffers() {
  return (
    <section className="section" style={{ background: "linear-gradient(180deg,var(--bg-1),var(--bg-0))" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <h2 className="flex items-center gap-2"><StaticDot /> Best betting offers</h2>
            <p className="sub">New-customer free bets and boosts.</p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/offers">All offers →</Link>
        </div>
        <div className="grid grid-3">
          {OFFERS.map((o) => (
            <article className="offer-card" key={o.bm} style={{ padding: 22 }}>
              <div className="flex justify-between items-start mb-3">
                <span className="flex items-center gap-2">
                  <span className={`bm bm-md bm-${o.cls}`}>{o.bm}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{o.name}</span>
                </span>
                <span className="chip chip-best">{o.chip}</span>
              </div>
              <div className="tag">{o.tag}</div>
              <h3 style={{ fontSize: 19, marginBottom: 10, lineHeight: 1.25 }}>{o.offer}</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>{o.desc}</p>
              <div className="flex gap-4 mb-4" style={{ fontSize: 12 }}>
                <span><span className="mute">Min dep</span> · <b>{o.minDep}</b></span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--gold)" }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />
                  </svg>
                  <b className="num" style={{ color: "var(--text)" }}>{o.rating}</b>
                  <span className="mute">/5</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Link className="btn btn-primary flex-1" href="/review">Claim Offer</Link>
                <Link className="btn btn-ghost btn-sm" href="/review">Review</Link>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-mute)", marginTop: 12, lineHeight: 1.5 }}>
                18+ · Begambleaware.org · T&amp;Cs apply · Please gamble responsibly
              </div>
            </article>
          ))}
        </div>
        <StaticNote>Offers are static — needs a dedicated offers/bookmaker endpoint.</StaticNote>
      </div>
    </section>
  );
}
