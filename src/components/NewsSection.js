import Link from "next/link";
import { getArticles } from "@/lib/api";
import { timeAgo, initials } from "@/lib/format";
import StaticNote from "./StaticNote";
import styles from "./NewsSection.module.scss";

const FALLBACK_GRAD = "linear-gradient(135deg, #143138, #0F1729)";

export default async function NewsSection() {
  const { articles } = await getArticles({ perPage: 5 });

  if (!articles.length) {
    return (
      <section className="section">
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">Latest</div><h2>Betting news &amp; analysis</h2></div>
            <Link className="btn btn-outline btn-sm" href="/news">News hub →</Link></div>
          <StaticNote>News feed unavailable right now — try again shortly.</StaticNote>
        </div>
      </section>
    );
  }

  const [featured, ...rest] = articles;
  const side = rest.slice(0, 4);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Latest · live feed</div>
            <h2>Betting news &amp; analysis</h2>
            <p className="sub">Match previews, injury updates and the stories moving the odds.</p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/news">News hub →</Link>
        </div>

        <div className={styles.grid}>
          {/* Featured article */}
          <article className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 280, position: "relative", overflow: "hidden", background: FALLBACK_GRAD }}>
              {featured.image_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.image_path} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(10,15,28,0.85))" }} />
              <div style={{ position: "absolute", top: 18, left: 22, display: "flex", gap: 8 }}>
                <span className="chip chip-live">Latest</span>
                <span className="chip" style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }}>{featured.categoryName}</span>
              </div>
            </div>
            <div style={{ padding: "24px 26px" }}>
              <h3 style={{ fontSize: 24, lineHeight: 1.25, marginBottom: 12 }}>
                <Link href={`/article?slug=${featured.slug}`}>{featured.headline}</Link>
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 18 }}>{featured.meta_description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="avatar" style={{ background: "linear-gradient(135deg,#A855F7,#6D28D9)" }}>{initials(featured.authorName)}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{featured.authorName}</div>
                    <div className="mute" style={{ fontSize: 11 }}>{timeAgo(featured.start_date)}</div>
                  </div>
                </div>
                <Link className="btn btn-ghost btn-sm" href={`/article?slug=${featured.slug}`}>Read article →</Link>
              </div>
            </div>
          </article>

          {/* Side article list */}
          <div className="flex-col gap-3">
            {side.map((n) => (
              <article className="card flex gap-3" key={n.id} style={{ padding: 14 }}>
                <div style={{ width: 104, flexShrink: 0, height: 104, borderRadius: 10, overflow: "hidden", background: FALLBACK_GRAD, position: "relative" }}>
                  {n.image_path && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.image_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <div style={{ position: "absolute", bottom: 8, left: 10, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "0.08em", textTransform: "uppercase", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>{n.categoryName}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="chip chip-muted" style={{ fontSize: 10, padding: "2px 7px" }}>{n.categoryName}</span>
                  <h4 style={{ fontSize: 14.5, lineHeight: 1.35, margin: "8px 0" }}><Link href={`/article?slug=${n.slug}`}>{n.headline}</Link></h4>
                  <div className="flex justify-between items-center mt-3 mute" style={{ fontSize: 11 }}>
                    <span>{n.authorName} · {timeAgo(n.start_date)}</span>
                    <Link href={`/article?slug=${n.slug}`} style={{ color: "var(--accent)" }}>Read →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
