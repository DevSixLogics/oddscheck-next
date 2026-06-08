import Link from "next/link";
import { getArticles } from "@/lib/api";
import { timeAgo, initials } from "@/lib/format";
import StaticNote from "@/components/StaticNote";

export const metadata = {
  title: "Betting news & analysis — previews, team news & line moves",
  description: "Match previews, injury updates and the stories moving the odds. From the OddsCheck newsroom.",
};

const FALLBACK_GRAD = "linear-gradient(135deg, #143138, #0F1729)";
const TABS = ["All news", "Match previews", "Team news", "Injury updates", "Transfer news", "Line movement", "Bookmaker updates", "Strategy"];
const TOPICS = ["Premier League", "Champions League", "Cheltenham", "El Clásico", "NFL", "NBA", "Madrid Open", "IPL", "Line movement", "Free bets"];

function pageWindow(current, last) {
  const out = new Set([1, last, current, current - 1, current + 1]);
  return [...out].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
}

export default async function NewsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const { articles, pagination } = await getArticles({ page, perPage: 10 });

  const last = pagination?.last_page || 1;
  const current = pagination?.current_page || page;
  const featured = articles[0];
  const grid = articles.slice(1);
  const mostRead = articles.slice(0, 5);

  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">News</span></li>
            </ol>
          </nav>
          <span className="chip chip-best mb-3" style={{ marginTop: 12 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" /></svg>
            Updated continuously{pagination ? ` · ${pagination.total} articles` : ""}
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Betting news &amp; analysis</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
            Match previews, injury updates and the stories moving the odds. From the OddsCheck newsroom.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container layout-split-wide">
          <div>
            <div className="tab-pills-scroll mb-4">
              {TABS.map((t, i) => <button key={t} className={`tab-pill${i === 0 ? " active" : ""}`} disabled={i !== 0}>{t}</button>)}
            </div>

            {!articles.length ? (
              <StaticNote>News feed unavailable right now — try again shortly.</StaticNote>
            ) : (
              <>
                {/* Featured article */}
                <article className="card mb-4" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ height: 340, position: "relative", overflow: "hidden", background: FALLBACK_GRAD }}>
                    {featured.image_path && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.image_path} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(10,15,28,0.88))" }} />
                    <div style={{ position: "absolute", top: 24, left: 28, display: "flex", gap: 8 }}>
                      <span className="chip chip-live">Latest</span>
                      <span className="chip" style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }}>{featured.categoryName}</span>
                    </div>
                    <div style={{ position: "absolute", bottom: 24, left: 28, right: 28, maxWidth: 620 }}>
                      <h2 style={{ color: "#fff", fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.2 }}>
                        <Link href={`/article?slug=${featured.slug}`} style={{ color: "#fff" }}>{featured.headline}</Link>
                      </h2>
                    </div>
                  </div>
                  <div style={{ padding: "24px 28px" }}>
                    <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 16 }}>{featured.meta_description}</p>
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="avatar" style={{ background: "linear-gradient(135deg,#A855F7,#6D28D9)" }}>{initials(featured.authorName)}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{featured.authorName}</div>
                          <div className="mute" style={{ fontSize: 11 }}>{timeAgo(featured.start_date)}</div>
                        </div>
                      </div>
                      <Link className="btn btn-primary btn-sm" href={`/article?slug=${featured.slug}`}>Read article →</Link>
                    </div>
                  </div>
                </article>

                {/* Article grid */}
                <div className="grid grid-3">
                  {grid.map((a) => (
                    <article className="card" key={a.id} style={{ padding: 0, overflow: "hidden" }}>
                      <div style={{ height: 160, position: "relative", background: FALLBACK_GRAD }}>
                        {a.image_path && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.image_path} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "0.08em", textTransform: "uppercase", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>{a.categoryName}</div>
                      </div>
                      <div style={{ padding: 18 }}>
                        <span className="chip chip-muted" style={{ fontSize: 10, padding: "2px 7px" }}>{a.categoryName}</span>
                        <h3 style={{ fontSize: 15, lineHeight: 1.4, margin: "10px 0" }}><Link href={`/article?slug=${a.slug}`}>{a.headline}</Link></h3>
                        <div className="flex justify-between items-center mt-2 mute" style={{ fontSize: 11 }}><span>{a.authorName}</span><span>{timeAgo(a.start_date)}</span></div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination (real) */}
                {last > 1 && (
                  <div className="pagination">
                    {current > 1 && <Link className="page" href={`/news?page=${current - 1}`}>‹</Link>}
                    {pageWindow(current, last).map((p, idx, arr) => (
                      <span key={p} style={{ display: "contents" }}>
                        {idx > 0 && p - arr[idx - 1] > 1 && <span className="page">…</span>}
                        <Link className={`page${p === current ? " active" : ""}`} href={`/news?page=${p}`}>{p}</Link>
                      </span>
                    ))}
                    {current < last && <Link className="page" href={`/news?page=${current + 1}`}>›</Link>}
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Most read · 24h</h4>
              {mostRead.map((a, i) => (
                <Link key={a.id} href={`/article?slug=${a.slug}`} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i === mostRead.length - 1 ? 0 : "1px solid var(--border-soft)" }}>
                  <span className="num" style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.4 }}>{a.headline}</span>
                </Link>
              ))}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Topics</h4>
              <div className="flex gap-2 flex-wrap">
                {TOPICS.map((t) => <a key={t} href="#" className="chip chip-muted">{t}</a>)}
              </div>
            </div>
            <div className="card" style={{ padding: 20, background: "linear-gradient(135deg, rgba(255,142,0,0.04), rgba(56,189,248,0.03))" }}>
              <h4 style={{ fontSize: 15, marginBottom: 8 }}>News digest</h4>
              <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>The day&apos;s biggest stories, in one email.</p>
              <div className="flex-col gap-2">
                <input className="input input-sm" type="email" placeholder="you@email.com" aria-label="Email" />
                <Link className="btn btn-primary btn-sm btn-block" href="/signup">Subscribe</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
