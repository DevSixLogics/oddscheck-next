import Link from "next/link";

// Shown on sport pages whose feed carries NO bookmaker odds (horse racing, golf).
// OddsCheck is an odds-comparison site, so those pages list nothing and explain
// why instead of showing odds-less cards. The route is kept so the URL resolves
// (no 404) for direct visits / old links.
export default function NoOddsNotice({ sport = "This sport" }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: "center" }}>
      <span className="chip chip-muted mb-3">No odds available</span>
      <h3 style={{ fontSize: 20, margin: "8px 0" }}>{sport} odds aren&apos;t available</h3>
      <p className="sub" style={{ marginBottom: 20, maxWidth: 460, marginInline: "auto" }}>
        OddsCheck compares bookmaker prices, and this feed doesn&apos;t carry odds —
        so there&apos;s nothing to list here. Browse a sport with live odds instead.
      </p>
      <Link className="btn btn-primary btn-lg" href="/football">Browse football odds</Link>
    </div>
  );
}
