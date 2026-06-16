import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { getAuthorDetails } from "@/lib/api";

// Expert / author profile — the author's real /author/details info (name, bio,
// role, post count) plus every article they've published. Reached from the
// "View author" cards on /experts. Server-rendered so it tracks the live CMS.
export const dynamic = "force-dynamic";

const BRANDS = new Set(["bet365", "williamhill", "paddypower", "skybet", "ladbrokes", "coral", "betvictor", "betfair", "unibet", "888sport"]);
const brandKey = (slug = "") => slug.replace(/-/g, "");
function brandCode(name = "") {
  const n = name.trim().toUpperCase();
  if (n.length <= 8) return n;
  const parts = n.split(/\s+/);
  if (parts.length > 1) return `${parts[0][0]}.${parts[1]}`.slice(0, 8);
  return n.slice(0, 8);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { detail } = await getAuthorDetails(slug);
  const name = detail?.name || slug;
  return {
    title: `${name} — author profile`,
    description: detail?.bio || `Articles published by ${name} on OddsCheck.`,
    alternates: { canonical: `/experts/${slug}` },
  };
}

export default async function ExpertProfilePage({ params }) {
  const { slug } = await params;
  const { detail, articles } = await getAuthorDetails(slug.toLowerCase());
  if (!detail && articles.length === 0) notFound();

  const name = detail?.name || slug;
  const bio = detail?.bio && detail.bio.trim().toLowerCase() !== "author" ? detail.bio : null;
  const key = brandKey(slug.toLowerCase());
  const isBrand = BRANDS.has(key);
  const role = isBrand ? "Bookmaker" : (bio || "Contributor");
  const postCount = detail?.post_count ?? articles.length;
  const primary = articles[0] || null;

  return (
    <>
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
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
              ? <span className={`bm bm-lg bm-${key}`}>{brandCode(name)}</span>
              : <span style={{ width: 54, height: 54, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,142,0,0.12)", color: "var(--accent)", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>{name.charAt(0).toUpperCase()}</span>}
            <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>{name}</h1>
          </div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="chip chip-best">{role}</span>
            <span className="chip chip-muted">{postCount} article{postCount === 1 ? "" : "s"}</span>
          </div>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660, lineHeight: 1.55 }}>
            {bio
              ? bio
              : isBrand
                ? `${name} is a UK-licensed bookmaker. Everything they've published on OddsCheck is below.`
                : `${name} writes betting tips, previews and analysis for OddsCheck.`}
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {primary && <Link className="btn btn-primary" href={`/article?slug=${primary.slug}`}>{isBrand ? "See latest offer" : "Read latest article"}</Link>}
            <Link className="btn btn-ghost" href="/experts">All experts</Link>
          </div>
            </div>
            <aside className="card" style={{ padding: 24 }}>
              <div className="mute" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>Latest article</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{primary?.headline || "No articles yet"}</div>
              {primary && <Link className="btn btn-primary btn-block" href={`/article?slug=${primary.slug}`}>Read article</Link>}
              <hr className="divider" style={{ margin: "16px 0" }} />
              <div className="flex justify-between" style={{ fontSize: 13 }}>
                <span className="mute">Articles</span><b className="num">{postCount}</b>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: 22, marginBottom: 18 }}>Articles by {name}</h2>
          {articles.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>No articles published yet.</div>
          ) : (
            <div className="grid grid-3">
              {articles.map((a) => <ArticleCard key={a.id || a.slug} a={a} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
