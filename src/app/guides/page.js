import Link from "next/link";
import { getCategoryArticles } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export async function generateMetadata() {
  const { articles } = await getCategoryArticles("guides", { perPage: 1 });
  const a = articles[0];
  return {
    title: a?.headline,
    description: a?.strapline || a?.meta_description,
    alternates: { canonical: "/guides" },
  };
}

const svg = (paths, fill = "none") => <svg viewBox="0 0 24 24" width="14" height="14" fill={fill} aria-hidden="true">{paths}</svg>;

// Guide categories — title, CMS slug (article/{slug}) and presentation only.
// All guide content is fetched live; nothing here is hardcoded article data.
const TOPICS = [
  { title: "Betting basics", slug: "betting-basics", color: "#FF8E00", icon: svg(<path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />, "currentColor") },
  { title: "Strategy & value", slug: "strategy-value", color: "#FFA733", icon: svg(<><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>) },
  { title: "Bet types", slug: "bet-types", color: "#DAB46B", icon: svg(<path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />) },
  { title: "Offers & bonuses", slug: "offers-bonuses", color: "#EC4899", icon: svg(<path d="M12 2c1 4 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-2-4 1-7Z" />, "currentColor") },
  { title: "Sport-specific", slug: "sport-specific", color: "#A855F7", icon: svg(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="m12 5 4 3-1.5 5h-5L8 8l4-3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></>) },
  { title: "Responsible gambling", slug: "responsible-gambling", color: "#FF4D67", icon: svg(<><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>) },
];

function TopicCard({ topic }) {
  const { title, color, icon, articles, count } = topic;
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="flex items-center gap-3 mb-3">
        <span style={{ width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.10)", color, border: "1px solid rgba(255,255,255,0.06)" }}>{icon}</span>
        <div>
          <h3 style={{ fontSize: 16 }}>{title}</h3>
          <div className="mute" style={{ fontSize: 11 }}>{count} guide{count === 1 ? "" : "s"}</div>
        </div>
      </div>
      {articles.length ? (
        <ul className="flex-col gap-2" style={{ listStyle: "none", padding: 0 }}>
          {articles.slice(0, 4).map((a) => (
            <li key={a.id || a.slug}><Link href={`/article?slug=${a.slug}`} style={{ fontSize: 13 }}>→ {a.headline}</Link></li>
          ))}
        </ul>
      ) : (
        <p className="mute" style={{ fontSize: 13, margin: 0 }}>Guides coming soon.</p>
      )}
    </div>
  );
}

export default async function GuidesPage() {
  // Hero comes from the "Guides" category feed (article/guides); each topic
  // card from its own category. All fetched live.
  const [heroFeed, footerFeed, ...feeds] = await Promise.all([
    getCategoryArticles("guides", { perPage: 1 }),
    getCategoryArticles("footer-guider", { perPage: 1 }),
    ...TOPICS.map((t) => getCategoryArticles(t.slug, { perPage: 5 })),
  ]);
  const hero = heroFeed.articles[0] || null;
  // Bottom CTA comes from the "footer-guider" category article.
  const footer = footerFeed.articles[0] || null;
  const footerChip = footer?.subjects?.[0]?.name;
  const footerTitle = footer?.headline;
  const footerText = footer?.strapline;
  // The hero chip comes from the Guides article's first subject (e.g.
  // "⭐ 93 guides · plain English, no jargon").
  const heroChip = hero?.subjects?.[0]?.name;
  const topics = TOPICS.map((t, idx) => ({
    ...t,
    articles: feeds[idx].articles,
    count: feeds[idx].pagination?.total ?? feeds[idx].articles.length,
  }));

  // "Most popular guides" — newest guides across every category (deduped).
  const seen = new Set();
  const popular = feeds
    .flatMap((f) => f.articles)
    .filter((a) => a?.slug && !seen.has(a.slug) && seen.add(a.slug))
    .sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)))
    .slice(0, 8);

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
          {heroChip && <span className="chip chip-best mb-3" style={{ marginTop: 12 }}>{heroChip}</span>}
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>{hero?.headline}</h1>
          {hero?.strapline && (
            <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660, lineHeight: 1.55 }}>{hero.strapline}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container flex-col gap-7">
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 18 }}>Browse by topic</h2>
            <div className="grid grid-3">
              {topics.map((t) => <TopicCard key={t.slug} topic={t} />)}
            </div>
          </div>

          {/* Most popular guides — newest across all categories */}
          {popular.length > 0 && (
            <div>
              <div className="section-head" style={{ marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 24 }}>Most popular guides</h2>
                  <p className="sub">The latest reads from our guides team.</p>
                </div>
              </div>
              <div className="grid grid-4">
                {popular.map((g, idx) => (
                  <Link key={g.slug} className="card" href={`/article?slug=${g.slug}`} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, minHeight: 160 }}>
                    <div className="flex justify-between items-start gap-2">
                      <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{idx + 1}</span>
                      <span className="flex flex-wrap gap-1" style={{ justifyContent: "flex-end" }}>
                        {(g.subjects?.length ? g.subjects : g.categoryName ? [{ name: g.categoryName }] : []).slice(0, 2).map((s) => (
                          <span key={s.id || s.name} className="chip chip-muted" style={{ fontSize: 10, padding: "2px 7px" }}>{s.name}</span>
                        ))}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, lineHeight: 1.3, flex: 1 }}>{g.headline}</h4>
                    <div className="flex justify-between items-center mute" style={{ fontSize: 12 }}>
                      <span>{timeAgo(g.start_date)}</span><span style={{ color: "var(--accent)", fontWeight: 600 }}>Read →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Put it into practice CTA (footer-guider) */}
          {(footerChip || footerTitle || footerText) && (
            <div className="card" style={{ padding: 36, background: "linear-gradient(135deg, #0E1729, #0F2333 60%, #2A1A05)", borderColor: "rgba(255,142,0,0.30)", position: "relative", overflow: "hidden" }}>
              {footerChip && <span className="chip chip-best mb-3">{footerChip}</span>}
              {footerTitle && <h2 style={{ fontSize: 28, margin: "12px 0" }}>{footerTitle}</h2>}
              {footerText && <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 720 }}>{footerText}</p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
