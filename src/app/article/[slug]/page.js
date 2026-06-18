import Link from "next/link";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { getArticle } from "@/lib/api";
import { timeAgo, initials } from "@/lib/format";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await getArticle(slug);
  if (!res) return { title: "Article" };
  const a = res.article;
  return {
    title: a.headline,
    description: a.meta_description || a.strapline,
    alternates: { canonical: `/article/${a.slug}` },
    openGraph: a.image_path ? { images: [a.image_path] } : undefined,
  };
}

const FALLBACK_GRAD = "linear-gradient(135deg, #143138, #0F1729)";

function MiniArticle({ a }) {
  return (
    <Link href={`/article/${a.slug}`} className="flex gap-3" style={{ padding: "10px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <div style={{ width: 72, flexShrink: 0, height: 56, borderRadius: 8, overflow: "hidden", background: FALLBACK_GRAD, display: "grid", placeItems: "center" }}>
        {a.image_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" style={{ color: "rgba(255,255,255,0.35)" }}>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
            <path d="m21 16-5-5-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{a.headline}</div>
        <div className="mute" style={{ fontSize: 11, marginTop: 4 }}>{a.authorName} · {timeAgo(a.start_date)}</div>
      </div>
    </Link>
  );
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const res = await getArticle(slug);

  if (!res) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Article not found</h1>
          <p className="sub" style={{ marginBottom: 24 }}>This story may have moved or expired.</p>
          <Link className="btn btn-primary btn-lg" href="/news">Back to news</Link>
        </div>
      </section>
    );
  }

  const { article: a, related, random } = res;
  const heroImg = a.image_path_jpg || a.image_path;
  // Sanitize CMS-authored HTML before rendering (defence-in-depth with CSP).
  const bodyHtml = sanitizeArticleHtml(a.editor || a.preview || "");

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: a.headline,
        description: a.meta_description || a.strapline || undefined,
        image: a.image_path ? [a.image_path] : undefined,
        datePublished: a.start_date ? a.start_date.replace(" ", "T") : undefined,
        author: a.authorName ? { "@type": "Person", name: a.authorName } : { "@type": "Organization", name: SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/oddscheck.png` } },
        mainEntityOfPage: `${SITE_URL}/article/${a.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          ...(a.categoryName ? [{ "@type": "ListItem", position: 2, name: a.categoryName }] : []),
          { "@type": "ListItem", position: a.categoryName ? 3 : 2, name: a.headline },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <section style={{ padding: "32px 0 24px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">{a.categoryName}</span></li>
            </ol>
          </nav>
          <div className="flex gap-2 mb-3" style={{ marginTop: 12 }}>
            <span className="chip chip-muted">{a.categoryName}</span>
            {a.is_premium && <span className="chip chip-gold">Premium</span>}
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.15, maxWidth: "22ch", marginBottom: 12 }}>{a.headline}</h1>
          {a.strapline && <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.55, maxWidth: 680 }}>{a.strapline}</p>}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {a.authorName ? (
              <>
                <span className="avatar avatar-lg" style={{ background: "linear-gradient(135deg,#A855F7,#6D28D9)" }}>{initials(a.authorName)}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.authorName}</div>
                  <div className="mute" style={{ fontSize: 12 }}>Updated {timeAgo(a.start_date)}</div>
                </div>
              </>
            ) : (
              <div className="mute" style={{ fontSize: 12 }}>Updated {timeAgo(a.start_date)}</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}>
          <article>
            {heroImg && (
              <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 24, background: FALLBACK_GRAD }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImg} alt={a.img_data?.alt_text || a.headline || ""} style={{ width: "100%", display: "block" }} />
              </div>
            )}
            <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            {a.authorName && a.bio && (
              <div className="card" style={{ padding: 18, marginTop: 28, display: "flex", gap: 12, alignItems: "center" }}>
                <span className="avatar avatar-lg" style={{ background: "linear-gradient(135deg,#A855F7,#6D28D9)" }}>{initials(a.authorName)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.authorName}</div>
                  <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{a.bio}</div>
                </div>
              </div>
            )}
          </article>

          <aside className="flex-col gap-4">
            {related.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, marginBottom: 6 }}>Related articles</h4>
                {related.slice(0, 5).map((r) => <MiniArticle key={r.id} a={r} />)}
              </div>
            )}
            {random.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, marginBottom: 6 }}>More stories</h4>
                {random.slice(0, 5).map((r) => <MiniArticle key={r.id} a={r} />)}
              </div>
            )}
            <div className="rg-banner" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ fontSize: 12 }}><b>18+ · Gamble responsibly.</b></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
