import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import styles from "../guide.module.scss";

// Content for the topic guides (the rich "how to read betting odds" lives at /guide).
const GUIDES = {
  "implied-probability": {
    title: "What is implied probability?",
    level: "Beginner",
    time: "4 min read",
    intro:
      "Implied probability is the percentage chance an odds price represents. Learn to read it and you can instantly tell when a bookmaker's price is too generous — or too mean.",
    sections: [
      { id: "what", h: "What it means", paras: [
        "Every odds price has a probability baked in — the bookmaker's estimate of how likely an outcome is. Decimal odds of 2.00 imply a 50% chance; 4.00 implies 25%.",
        "Reading prices as probabilities lets you compare them to your own view of the real chance, which is the foundation of finding value.",
      ] },
      { id: "calculate", h: "How to calculate it", paras: [
        "From decimal odds the formula is simply: implied probability = 1 ÷ decimal odds × 100.",
        "So 2.50 → 1 ÷ 2.50 = 40%, and 1.50 → 1 ÷ 1.50 = 66.67%. Our odds calculator does this instantly for any format.",
      ] },
      { id: "why", h: "Why it matters", paras: [
        "If you believe the real probability is higher than the implied one — by more than the bookmaker's margin — you've found a value bet.",
      ] },
    ],
  },
  "value-bets": {
    title: "What makes a value bet?",
    level: "Intermediate",
    time: "7 min read",
    intro:
      "A value bet is one where the price is bigger than the true chance of it winning. You don't need to predict winners — you need to find mispriced odds.",
    sections: [
      { id: "definition", h: "The definition of value", paras: [
        "Value exists when your estimated probability of an outcome is higher than the probability implied by the odds. Over many bets, backing value is what turns a long-term profit.",
        "Example: if you rate a team's chance at 50% (fair odds 2.00) but a book offers 2.20, that price carries value.",
      ] },
      { id: "find", h: "How to find it", paras: [
        "Compare your own honest estimate against the implied probability of the best available price across bookmakers. The bigger the gap, the more value.",
        "Line shopping matters: taking 2.20 instead of 2.10 on the same selection is roughly 4.5% more profit on every winner.",
      ] },
      { id: "bankroll", h: "Stake sensibly", paras: [
        "Value still loses often in the short run. Use level stakes or a fraction of your bankroll, and never chase losses.",
      ] },
    ],
  },
  "accumulators": {
    title: "How accumulators work",
    level: "Beginner",
    time: "6 min read",
    intro:
      "An accumulator (or 'acca') combines several selections into one bet. All legs must win — but the odds multiply, so the potential return grows fast.",
    sections: [
      { id: "how", h: "How the maths works", paras: [
        "Multiply the decimal odds of each leg together. Four legs at 1.50 each = 1.50 × 1.50 × 1.50 × 1.50 = 5.06, so a £10 acca returns £50.63.",
        "Add one more leg and the price climbs again — but so does the chance of one leg letting you down.",
      ] },
      { id: "risk", h: "Risk vs reward", paras: [
        "Accas are high-variance: the more legs, the lower the overall probability of success. They're fun for big returns from small stakes, not for steady profit.",
      ] },
      { id: "tips", h: "Tips", paras: [
        "Shop for the best price on each leg, watch for acca-boost promotions, and consider acca insurance offers that refund if one leg fails.",
      ] },
    ],
  },
  "free-bets": {
    title: "How free bets actually work",
    level: "Beginner",
    time: "5 min read",
    intro:
      "Free bets are the most common new-customer promotion — but the stake isn't returned with your winnings. Knowing that changes how you use them.",
    sections: [
      { id: "how", h: "Stake-not-returned", paras: [
        "With a normal bet you get your stake back plus profit. With a free bet you only keep the profit. A £10 free bet at 3.00 returns £20 (not £30).",
      ] },
      { id: "value", h: "Getting the most from them", paras: [
        "Free bets return more profit at higher odds, but the chance of winning is lower. Mid-range odds (around 3.0–5.0) are a common balance.",
      ] },
      { id: "terms", h: "Read the terms", paras: [
        "Check minimum odds, expiry dates, wagering requirements and which markets qualify before claiming any offer.",
      ] },
    ],
  },
  "prop-bets": {
    title: "What are prop bets?",
    level: "Intermediate",
    time: "6 min read",
    intro:
      "Proposition (prop) bets are wagers on events within a game rather than the final result — like a player to score, cards, corners or total points.",
    sections: [
      { id: "what", h: "What they are", paras: [
        "Props focus on a specific occurrence: 'player to score anytime', 'over 9.5 corners', 'LeBron over 24.5 points'. They're independent of who wins the match.",
      ] },
      { id: "types", h: "Popular types", paras: [
        "Player props (goals, shots, points), team props (clean sheet, total goals) and game props (cards, corners) are the most widely offered.",
      ] },
      { id: "value", h: "Finding value", paras: [
        "Prop markets are often less efficient than the main result, so researching form and matchups can uncover mispriced lines.",
      ] },
    ],
  },
  "compare-bookmakers": {
    title: "How to compare bookmakers",
    level: "Intermediate",
    time: "8 min read",
    intro:
      "Taking the best available price on every bet is the simplest edge in betting. Here's what to compare beyond just the headline odds.",
    sections: [
      { id: "why", h: "Why comparing pays", paras: [
        "Odds for the same outcome vary between books. Consistently taking the best price compounds into a meaningful return over a season.",
      ] },
      { id: "what", h: "What to look at", paras: [
        "Price (the overround / margin), market depth, bet limits, payout speed, and the quality of promotions and bet-builder tools.",
      ] },
      { id: "use", h: "Using OddsCheck", paras: [
        "We compare the best price across books on every market and highlight the top one in green — so you never leave value on the table.",
      ] },
    ],
  },
};

const ORDER = Object.keys(GUIDES);

export function generateStaticParams() {
  return ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = GUIDES[slug];
  if (!g) return { title: "Guide" };
  return { title: `${g.title} — betting guide`, description: g.intro, alternates: { canonical: `/guide/${slug}` } };
}

// FAQPage (the guide title + each section as a Q&A) + BreadcrumbList. The guides
// are question-led and answer-shaped, so this is exactly the structured-answer
// markup AI/answer engines and rich results look for.
function guideSchema(slug, g) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: g.title, acceptedAnswer: { "@type": "Answer", text: g.intro } },
          ...g.sections.map((s) => ({
            "@type": "Question",
            name: s.h,
            acceptedAnswer: { "@type": "Answer", text: s.paras.join(" ") },
          })),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: g.title, item: `${SITE_URL}/guide/${slug}` },
        ],
      },
      {
        // Marks the question (H1) + concise answer (intro) as voice-friendly for
        // assistants / answer engines (SpeakableSpecification).
        "@type": "WebPage",
        "@id": `${SITE_URL}/guide/${slug}`,
        url: `${SITE_URL}/guide/${slug}`,
        name: g.title,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "#guide-intro"],
        },
      },
    ],
  };
}

export default async function GuideTopicPage({ params }) {
  const { slug } = await params;
  const g = GUIDES[slug];
  if (!g) notFound();

  const readNext = ORDER.filter((s) => s !== slug).slice(0, 5);

  return (
    <>
      <JsonLd data={guideSchema(slug, g)} />
      <section style={{ padding: "32px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href="/guides">Guides</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">{g.title}</span></li>
            </ol>
          </nav>
          <div className="flex gap-2 mb-3" style={{ marginTop: 12 }}>
            <span className="chip chip-best">{g.level}</span>
            <span className="chip chip-muted">{g.time}</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, maxWidth: "20ch", marginBottom: 14 }}>{g.title}</h1>
          <p id="guide-intro" style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.55, maxWidth: 680 }}>{g.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          <aside className={styles.toc}>
            <div className="head">On this page</div>
            <nav>
              {g.sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.h}</a>)}
            </nav>
          </aside>

          <article className="prose">
            {g.sections.map((s) => (
              <div key={s.id}>
                <h2 id={s.id}>{s.h}</h2>
                {s.paras.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ))}

            <div className={styles.callout}>
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,142,0,0.12)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div><b>Put it into practice:</b> <span className="muted">Convert prices &amp; calculate value</span></div>
                </div>
                <Link className="btn btn-primary btn-sm" href="/odds-calculator">Open calculator →</Link>
              </div>
            </div>
          </article>

          <aside className={`flex-col gap-4 ${styles.related}`}>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Read next</h4>
              <div className="flex-col gap-2">
                <Link className="flex items-center gap-2" href="/guide" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)", fontSize: 13 }}>→ How to read betting odds</Link>
                {readNext.map((slug, i) => (
                  <Link key={slug} className="flex items-center gap-2" href={`/guide/${slug}`} style={{ padding: "8px 0", borderBottom: i === readNext.length - 1 ? 0 : "1px solid var(--border-soft)", fontSize: 13 }}>
                    → {GUIDES[slug].title}
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
