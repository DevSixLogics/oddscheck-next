import Link from "next/link";

// Simple content-page shell: breadcrumb + heading + lead + body content.
export default function PagePlaceholder({ title, lead, crumb, children }) {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <li><Link href="/">Home</Link></li>
            <li className="sep" aria-hidden="true">/</li>
            <li><span className="current" aria-current="page">{crumb || title}</span></li>
          </ol>
        </nav>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 14 }}>{title}</h1>
        {lead && <p className="sub" style={{ fontSize: 16, marginTop: 12, maxWidth: 640 }}>{lead}</p>}
        {children && <div style={{ marginTop: 24 }}>{children}</div>}
      </div>
    </section>
  );
}
