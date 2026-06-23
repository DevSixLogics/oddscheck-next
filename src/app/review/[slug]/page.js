import Link from "next/link";
import { getAuthorDetails, getAuthors } from "@/lib/api";

const BRANDS = new Set(["bet365", "williamhill", "paddypower", "skybet", "ladbrokes", "coral", "betvictor", "betfair", "unibet", "888sport"]);

export async function generateMetadata({ params }) {
  const { slug: raw } = await params;
  const slug = String(raw || "bet365").toLowerCase();
  const { detail } = await getAuthorDetails(slug);
  const name = detail?.name || "Bet365";
  const isBrand = BRANDS.has(slug.replace(/-/g, ""));
  return {
    title: isBrand ? `${name} review 2026 — offers & verdict` : `${name} — author profile & articles`,
    description: detail?.bio || undefined,
    alternates: { canonical: `/review/${slug}` },
  };
}

const star = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />
  </svg>
);

const SCORES = [
  { label: "Odds quality", val: 4.7 },
  { label: "Welcome offer", val: 4.5 },
  { label: "App & UX", val: 4.9 },
  { label: "Customer service", val: 4.8 },
  { label: "Payout speed", val: 4.8 },
  { label: "Market coverage", val: 5.0 },
];

const PROS = [
  "Industry-leading live streaming",
  "Strongest in-play market depth",
  "Excellent bet builder",
  "Fast withdrawals (24h avg)",
  "24/7 phone & chat support",
  "Reliable mobile app on iOS & Android",
  "Best Odds Guaranteed on racing",
];
const CONS = [
  "Welcome offer not the most generous",
  "No bet exchange product",
  "Stake restrictions for winning customers",
  "Cashout values can be conservative",
  "No PayPal in some jurisdictions",
];

const sIcon = (paths) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">{paths}</svg>;
const SPORT_ICONS = {
  football: sIcon(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="m12 5 4 3-1.5 5h-5L8 8l4-3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></>),
  racing: sIcon(<path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />),
  tennis: sIcon(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3.5 9c5 1 11 1 17 0M3.5 15c5-1 11-1 17 0" stroke="currentColor" strokeWidth="1.4" /></>),
  basketball: sIcon(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3 12h18M12 3v18M5 5c3 3 4 11 0 14m14-14c-3 3-4 11 0 14" stroke="currentColor" strokeWidth="1.2" /></>),
  nfl: sIcon(<><ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" strokeWidth="1.4" transform="rotate(-30 12 12)" /><path d="M10 12h4M11 10v4M13 10v4" stroke="currentColor" strokeWidth="1.2" /></>),
  combat: sIcon(<><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>),
  cricket: sIcon(<><path d="m4 20 8-8 6-6-3-3-6 6-8 8 3 3Zm10-10 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" /></>),
  golf: sIcon(<><path d="M10 4v12M10 4l6 2-6 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><ellipse cx="10" cy="19" rx="6" ry="2" stroke="currentColor" strokeWidth="1.4" /></>),
  esports: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" /></svg>,
};
const SPORTS = [
  { key: "football", name: "Football", sub: "3,800+ markets/match", dots: 5 },
  { key: "racing", name: "Racing", sub: "UK + IE + Aus full coverage", dots: 5 },
  { key: "tennis", name: "Tennis", sub: "ATP, WTA, Challenger", dots: 5 },
  { key: "basketball", name: "Basketball", sub: "NBA, EuroLeague, college", dots: 4 },
  { key: "nfl", name: "NFL", sub: "Full season + props", dots: 4 },
  { key: "combat", name: "MMA & Boxing", sub: "All majors", dots: 4 },
  { key: "cricket", name: "Cricket", sub: "IPL, Test, ODI", dots: 4 },
  { key: "golf", name: "Golf", sub: "PGA, LIV, Euro", dots: 4 },
  { key: "esports", name: "Esports", sub: "LoL, CS, Dota, Valorant", dots: 4 },
];

const PAYMENTS = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "Bank transfer", "PayPal*", "Skrill", "Neteller", "Paysafecard"];

const FAQS = [
  ["Is Bet365 licensed in the UK?", "Yes. Bet365 is licensed and regulated by the UK Gambling Commission. Their UKGC license number is 39563."],
  ["How long do withdrawals take?", "Most card withdrawals are processed in under 24 hours. PayPal is typically same-day. Bank transfers take 1–3 business days."],
  ["Does Bet365 offer cashout?", "Yes — on pre-match and in-play markets. Cashout availability varies by sport; football, tennis and racing are best supported."],
  ["Can I open multiple accounts?", "No. Like all UK-licensed bookmakers, Bet365 allows one account per household."],
  ["Is the welcome offer worth claiming?", "For most users, yes — £30 in free bets for a £10 stake is fair value with manageable terms (min odds 1/2, 7-day expiry, no wagering on winnings)."],
];


function Dots({ n }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < n ? "var(--accent)" : "var(--border-strong)" }} />
      ))}
    </div>
  );
}

export default async function ReviewPage({ params }) {
  // Bookmaker is chosen via the /review/[slug] path (default Bet365). Pull the
  // author's real profile + articles from /author/details?author_name=<slug>.
  const { slug: raw } = await params;
  const slug = String(raw || "bet365").toLowerCase();
  const { detail, articles } = await getAuthorDetails(slug);

  const name = detail?.name || "Bet365";
  const bio = detail?.bio && detail.bio.trim().toLowerCase() !== "author" ? detail.bio : null;
  const brandKey = slug.replace(/-/g, "");
  const isBrand = BRANDS.has(brandKey);
  const brandCls = isBrand ? `bm-${brandKey}` : "";
  const brandCode = name.length <= 8 ? name.toUpperCase() : name.slice(0, 8).toUpperCase();

  // The author's primary (latest) article powers the hero CTA.
  const primary = articles[0] || null;

  // "Compare with" — real bookmaker authors from the CMS (no invented ratings),
  // excluding the one being viewed.
  const allAuthors = isBrand ? await getAuthors() : [];
  const compareList = allAuthors
    .filter((a) => BRANDS.has(a.slug.replace(/-/g, "")) && a.slug.toLowerCase() !== slug)
    .slice(0, 6);
  const codeFor = (nm = "") => (nm.length <= 8 ? nm.toUpperCase() : nm.slice(0, 8).toUpperCase());

  // Only the real Bet365 page carries the hand-written editorial (scores, pros/cons,
  // FAQs). Every other author shows their real profile + articles instead.
  const isBet365 = slug === "bet365";
  const role = isBrand ? "Bookmaker" : (bio || "Contributor");
  // Generic — this is just an author's articles in a (dynamic) category, not an "offer".
  const intro = bio || `Articles and updates published by ${name} on OddsCheck.`;

  return (
    <>
      <section style={{ padding: "32px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href="/experts">Experts</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">{name}</span></li>
            </ol>
          </nav>
          <div className="grid" style={{ gridTemplateColumns: "1fr 360px", gap: 36, alignItems: "start", marginTop: 12 }}>
            <div>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                {isBrand
                  ? <span className={`bm bm-lg ${brandCls}`}>{brandCode}</span>
                  : <span style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,142,0,0.12)", color: "var(--accent)", fontWeight: 700, fontSize: 20 }}>{name.charAt(0).toUpperCase()}</span>}
                <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)" }}>{isBrand ? `${name} Review 2026` : name}</h1>
              </div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {isBet365 ? (
                  <>
                    <span style={{ color: "var(--gold)", display: "inline-flex" }}>{star}{star}{star}{star}{star}</span>
                    <span className="num" style={{ fontSize: 22, fontWeight: 700 }}>4.8/5</span>
                    <span className="chip chip-best">Editor&apos;s choice 2026</span>
                  </>
                ) : (
                  <>
                    <span className="chip chip-best">{role}</span>
                    {detail?.post_count != null && <span className="chip chip-muted">{detail.post_count} article{detail.post_count === 1 ? "" : "s"}</span>}
                  </>
                )}
              </div>
              {isBet365 ? (
                <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.6 }}>
                  Bet365 remains the most consistent all-rounder in UK sports betting. Best-in-class
                  in-play coverage, the strongest live streaming, deep market depth and a polished bet
                  builder. Welcome offer is solid rather than flashy.
                </p>
              ) : (
                <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.6 }}>{intro}</p>
              )}
              <div className="flex gap-2 mt-4 flex-wrap">
                {primary && <Link className="btn btn-primary" href={`/article/${primary.slug}`}>Read latest article</Link>}
                <Link className="btn btn-ghost" href="/experts">All authors</Link>
              </div>
            </div>

            <aside className="card" style={{ padding: 24 }}>
              <div className="mute" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>Latest article</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{primary?.headline || "No articles yet"}</div>
              {primary && <Link className="btn btn-primary btn-block" href={`/article/${primary.slug}`}>Read article</Link>}
              <hr className="divider" style={{ margin: "16px 0" }} />
              <div className="flex justify-between" style={{ fontSize: 13 }}>
                <span className="mute">Articles</span><b className="num">{detail?.post_count ?? articles.length}</b>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48 }}>
          <div className="flex-col gap-5">
            {!isBet365 && (
              /* Real author content: their articles. */
              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 22, marginBottom: 16 }}>Articles by {name}</h2>
                {articles.length ? (
                  <div className="flex-col gap-3">
                    {articles.map((a) => (
                      <Link key={a.id || a.slug} href={`/article/${a.slug}`} className="flex justify-between items-center gap-3" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-soft)" }}>
                        <span>
                          <span style={{ display: "block", fontWeight: 600, fontSize: 15 }}>{a.headline}</span>
                          {a.strapline && <span className="mute" style={{ fontSize: 12 }}>{a.strapline}</span>}
                        </span>
                        <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>Read →</span>
                      </Link>
                    ))}
                  </div>
                ) : <p className="muted" style={{ fontSize: 13, margin: 0 }}>No articles published yet.</p>}
              </div>
            )}
            {isBet365 && (<>
            {/* Score breakdown */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 22, marginBottom: 18 }}>Score breakdown</h2>
              {SCORES.map((s) => (
                <div key={s.label} style={{ marginBottom: 14 }}>
                  <div className="flex justify-between mb-1" style={{ fontSize: 13 }}><span>{s.label}</span><b className="num">{s.val.toFixed(1)}</b></div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.val / 5) * 100}%`, background: "linear-gradient(90deg, var(--accent), #FFB04D)" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pros / Cons */}
            <div className="grid grid-2">
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 18, marginBottom: 14, color: "var(--accent)" }}>Pros</h3>
                <ul className="flex-col gap-2" style={{ fontSize: 13, listStyle: "none", padding: 0 }}>
                  {PROS.map((p) => <li key={p} className="flex items-start gap-2"><span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>{p}</li>)}
                </ul>
              </div>
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 18, marginBottom: 14, color: "var(--down)" }}>Cons</h3>
                <ul className="flex-col gap-2" style={{ fontSize: 13, listStyle: "none", padding: 0 }}>
                  {CONS.map((c) => <li key={c} className="flex items-start gap-2"><span style={{ color: "var(--down)", flexShrink: 0 }}>×</span>{c}</li>)}
                </ul>
              </div>
            </div>

            {/* Sports coverage */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>Sports &amp; markets coverage</h2>
              <div className="grid grid-3" style={{ gap: 12 }}>
                {SPORTS.map((s) => (
                  <div key={s.key} style={{ padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <div className="flex items-center gap-2 mb-2" style={{ color: "var(--accent)" }}>
                      {SPORT_ICONS[s.key]}
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{s.name}</span>
                    </div>
                    <div className="mute" style={{ fontSize: 11, marginBottom: 6 }}>{s.sub}</div>
                    <Dots n={s.dots} />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment methods */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>Payment methods</h2>
              <div className="flex flex-wrap gap-2">
                {PAYMENTS.map((p) => <span key={p} className="chip chip-muted">{p}</span>)}
              </div>
              <div className="mute" style={{ fontSize: 11, marginTop: 12 }}>* PayPal availability depends on region. Minimum withdrawal: £10. Average withdrawal time: 24 hours.</div>
            </div>

            {/* Verdict */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>Our verdict</h2>
              <div className="prose">
                <p>If we could only recommend one bookmaker, it would still be Bet365 in 2026. It&apos;s the closest thing to a default account — what it does well, it does excellently, and what it doesn&apos;t do isn&apos;t bad enough to push you elsewhere.</p>
                <p>The £30 welcome offer is unflashy compared to some competitors, but the underlying value comes from the day-to-day product: superior in-play, deepest markets, reliable cashout, and a bet builder that&apos;s still the gold standard.</p>
                <p>The main caveat is the well-known stake restriction issue if you win consistently — that&apos;s a real concern for serious bettors, and worth pairing Bet365 with a no-restriction book like <Link href="/experts">Betfair Exchange</Link>.</p>
                <blockquote>Best for: casual to serious bettors who want a polished, reliable all-rounder.</blockquote>
              </div>
            </div>

            {/* FAQs */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>FAQs</h2>
              {FAQS.map(([q, a]) => (
                <details key={q} style={{ borderBottom: "1px solid var(--border-soft)", padding: "12px 0" }}>
                  <summary style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{q}</summary>
                  <p className="muted" style={{ fontSize: 13, lineHeight: 1.55, marginTop: 8 }}>{a}</p>
                </details>
              ))}
            </div>
            </>)}
          </div>

          <aside className="flex-col gap-4">
            {compareList.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, marginBottom: 14 }}>Compare with</h4>
                {compareList.map((c, i) => {
                  const k = c.slug.replace(/-/g, "");
                  return (
                    <Link key={c.slug} href={`/review/${c.slug}`} className="flex items-center justify-between" style={{ padding: "10px 0", borderBottom: i === compareList.length - 1 ? 0 : "1px solid var(--border-soft)" }}>
                      <span className="flex items-center gap-2"><span className={`bm bm-${k}`}>{codeFor(c.name)}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span></span>
                      <span className="num muted" style={{ fontSize: 12 }}>{c.postCount ?? 0} article{c.postCount === 1 ? "" : "s"}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 12 }}>
                More from {name}{detail?.post_count ? ` · ${detail.post_count} article${detail.post_count === 1 ? "" : "s"}` : ""}
              </h4>
              {articles.length ? articles.map((a, i) => (
                <Link key={a.id || a.slug} href={`/article/${a.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i === articles.length - 1 ? 0 : "1px solid var(--border-soft)" }}>
                  {isBrand
                    ? <span className={`bm ${brandCls}`}>{brandCode}</span>
                    : <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,142,0,0.12)", color: "var(--accent)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{name.charAt(0).toUpperCase()}</span>}
                  <span style={{ fontSize: 13 }}>{a.headline}</span>
                </Link>
              )) : <p className="muted" style={{ fontSize: 12, margin: 0 }}>No articles from this author yet.</p>}
              <Link className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 8 }} href="/offers">View all offers</Link>
            </div>
            <div className="rg-banner" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 12 }}><b>18+ · BeGambleAware.org</b></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
