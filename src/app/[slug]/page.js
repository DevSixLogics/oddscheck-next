import Link from "next/link";
import { notFound } from "next/navigation";
import SportPage from "@/components/SportPage";
import CategoryGrid from "@/components/CategoryGrid";
import JsonLd from "@/components/JsonLd";
import { getSettings, getCategoryBySlug } from "@/lib/api";
import { matchListingSeo, articleListJsonLd, breadcrumbJsonLd } from "@/lib/seo";

// One root dynamic segment handling any single-segment slug the CMS menu points at:
//   • an allowed sport       → the sport fixtures/odds page,
//   • a known article category → that category's articles,
//   • anything else          → 404.
// Dedicated routes (/football, /news, /experts, /tools, …) take precedence over this.
export const dynamic = "force-dynamic";

// ── Sports ──────────────────────────────────────────────────────────────────
const CORE_SPORTS = ["football", "basketball", "tennis", "cricket", "baseball", "golf", "racing"];

async function allowedSportSlugs() {
  const settings = await getSettings();
  const set = new Set(CORE_SPORTS);
  for (const name of settings?.allowed_sports || []) {
    const base = name.toLowerCase().trim();
    set.add(base.replace(/\s+/g, "-"));
    set.add(base.replace(/\s+/g, ""));
  }
  return set;
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = slug.toLowerCase();
  const canonical = `/${s}`;
  if ((await allowedSportSlugs()).has(s)) return await matchListingSeo(s);
  const cat = await getCategoryBySlug(s);
  if (cat) return { title: cat.name, alternates: { canonical } };
  return {};
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DynamicSlugPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const s = slug.toLowerCase();

  // 1) Sport
  if ((await allowedSportSlugs()).has(s)) {
    return <SportPage sport={s} date={sp?.date} subjectWord="matches" />;
  }

  // 2) Category
  const cat = await getCategoryBySlug(s);
  if (cat) {
    return (
      <>
        <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: cat.name }])} />
        <JsonLd data={articleListJsonLd({ name: cat.name, path: `/${s}`, articles: cat.articles })} />
        <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <li><Link href="/">Home</Link></li>
                <li className="sep" aria-hidden="true">/</li>
                <li><span className="current" aria-current="page">{cat.name}</span></li>
              </ol>
            </nav>
            <span className="chip chip-best mb-3" style={{ marginTop: 12 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" /></svg>
              {cat.articles.length} article{cat.articles.length === 1 ? "" : "s"}
            </span>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>{cat.name}</h1>
            <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660, lineHeight: 1.55 }}>
              The latest {cat.name.toLowerCase()} from the OddsCheck newsroom.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <CategoryGrid articles={cat.articles} />
          </div>
        </section>
      </>
    );
  }

  // 3) Neither sport nor category
  notFound();
}
