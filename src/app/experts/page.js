import Link from "next/link";
import { getAuthors } from "@/lib/api";
import ExpertsList from "@/components/ExpertsList";
import JsonLd from "@/components/JsonLd";
import { personListJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = { alternates: { canonical: "/experts" } };

// Server-rendered on demand so the experts list always reflects the live CMS.
export const dynamic = "force-dynamic";

export default async function ExpertsPage() {
  const authors = await getAuthors();
  const total = authors.reduce((n, a) => n + (a.postCount || 0), 0);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Experts" }])} />
      <JsonLd data={personListJsonLd({ name: "Our experts & bookmakers", path: "/experts", people: authors })} />
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Experts</span></li>
            </ol>
          </nav>
          <span className="chip chip-best mb-3" style={{ marginTop: 12 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            {authors.length} experts · {total} articles
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Our experts &amp; bookmakers</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 660, lineHeight: 1.55 }}>
            The bookmakers and writers behind OddsCheck. Open one to see their profile and
            everything they&apos;ve published.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {authors.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>No authors found.</div>
          ) : (
            <ExpertsList authors={authors} />
          )}
        </div>
      </section>
    </>
  );
}
