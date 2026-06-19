import Link from "next/link";
import { getOffers } from "@/lib/api";

// Bookmaker brand classes that have a styled badge in globals.scss.
const BRANDS = new Set(["bet365", "williamhill", "paddypower", "skybet", "ladbrokes", "coral", "betvictor", "betfair", "unibet", "888sport"]);

// Static fallback so the homepage never renders an empty section if the feed is down.
const FALLBACK = [
  { headline: "Bet £10, get £30 in free bets", strapline: "New customers · Min deposit £10 · 7-day expiry on free bets.", slug: "bet-10-get-30-in-free-bets", authorName: "Bet365", authorSlug: "bet365", key_values: "free, bets" },
  { headline: "Get £20 in free bets", strapline: "Stake matched up to £20. Min first-bet odds 1/2.", slug: "get-20-in-free-bets", authorName: "Ladbrokes", authorSlug: "ladbrokes", key_values: "free, bets" },
  { headline: "50% profit boost on accas", strapline: "4+ leg football accas get a 50% profit boost up to £25.", slug: "50-profit-boost-on-accas", authorName: "Betfair", authorSlug: "betfair", key_values: "profit boost" },
];

// Short brand code for the badge (e.g. "Paddy Power" → "P.POWER").
function brandCode(name = "") {
  const n = name.trim().toUpperCase();
  if (n.length <= 8) return n;
  const parts = n.split(/\s+/);
  if (parts.length > 1) return `${parts[0][0]}.${parts[1]}`.slice(0, 8);
  return n.slice(0, 8);
}

// "free, bets" → "Free bets"; first key only, sentence-cased.
function keyChip(kv = "") {
  const txt = String(kv).split(",").map((s) => s.trim()).filter(Boolean).join(" ");
  if (!txt) return "Offer";
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
}

/** Best betting offers — live from the CMS /article/best-betting-offers feed. */
export default async function BestOffers() {
  const live = await getOffers({ perPage: 12 });
  const offers = (live.length ? live : FALLBACK).slice(0, 6);

  return (
    <section className="section" style={{ background: "linear-gradient(180deg,var(--bg-1),var(--bg-0))" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <h2>Best betting offers</h2>
            <p className="sub">New-customer free bets and boosts.</p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/offers">All offers →</Link>
        </div>
        <div className="grid grid-3">
          {offers.map((o) => {
            const name = o.authorName || (o.subjects?.[0]?.name ?? "Bookmaker");
            const slug = (o.authorSlug || "").toLowerCase();
            const cls = BRANDS.has(slug) ? `bm-${slug}` : "";
            const href = o.slug ? `/article/${o.slug}` : "/offers";
            return (
              <article className="offer-card" key={o.id || o.slug} style={{ padding: 22 }}>
                <div className="flex justify-between items-start mb-3">
                  <span className="flex items-center gap-2">
                    <span className={`bm bm-md ${cls}`}>{brandCode(name)}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
                  </span>
                  <span className="chip chip-best">{keyChip(o.key_values)}</span>
                </div>
                <h3 style={{ fontSize: 19, marginBottom: 10, lineHeight: 1.25 }}>{o.headline}</h3>
                <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, minHeight: 36 }}>{o.strapline}</p>
                <div className="flex gap-2">
                  <Link className="btn btn-primary flex-1" href={href}>Read offer →</Link>
                  <Link className="btn btn-ghost btn-sm" href={slug ? `/review/${slug}` : "/experts"}>Review</Link>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-mute)", marginTop: 12, lineHeight: 1.5 }}>
                  18+ · Begambleaware.org · T&amp;Cs apply · Please gamble responsibly
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
