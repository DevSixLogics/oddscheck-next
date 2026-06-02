import Link from "next/link";

// Lightweight static page shell for routes not yet ported in full.
// Keeps the design/layout consistent; content can be filled in next pass.
export default function PagePlaceholder({ title, lead, crumb }) {
  return (
    <section className="section">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <li><Link href="/">Home</Link></li>
            <li className="sep" aria-hidden="true">/</li>
            <li><span className="current" aria-current="page">{crumb || title}</span></li>
          </ol>
        </nav>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 14 }}>{title}</h1>
        {lead && <p className="sub" style={{ fontSize: 16, marginTop: 12, maxWidth: 640 }}>{lead}</p>}
        <div className="card" style={{ padding: 28, marginTop: 24 }}>
          <p style={{ color: "var(--text-2)" }}>
            This page is a static placeholder in the Next.js build. The original layout from{" "}
            <code>{(crumb || title).toLowerCase()}.html</code> can be ported here. Only the{" "}
            <Link href="/">Home</Link> and <Link href="/football">Football</Link> pages are wired to
            live API data in this pass.
          </p>
        </div>
      </div>
    </section>
  );
}
