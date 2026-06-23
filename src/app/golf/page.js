import Link from "next/link";
import { matchListingSeo, sportListingContent, breadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import NoOddsNotice from "@/components/NoOddsNotice";

export function generateMetadata() {
  return matchListingSeo("golf");
}

// Golf carries NO bookmaker odds in the feed (the leaderboard endpoint exposes
// scores only — no outright/winner prices). This is an odds-comparison site, so
// the golf route is kept (no 404 for direct/old links) but lists nothing — it
// shows a clear "no odds" notice instead of an odds-less leaderboard.
export default async function GolfPage() {
  const content = await sportListingContent("golf");

  // Breadcrumb JSON-LD — the sport crumb is added only when the CMS provides a heading.
  const golfSchema = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    ...(content.heading ? [{ name: content.heading }] : []),
  ]);

  return (
    <>
      <JsonLd data={golfSchema} />
      <section style={{ padding: "28px 0 16px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <li><Link href="/">Home</Link></li>
              {content.heading && <li className="sep" aria-hidden="true">/</li>}
              {content.heading && <li><span className="current" aria-current="page">{content.heading}</span></li>}
            </ol>
          </nav>
          {content.heading && <h1 style={{ fontSize: "clamp(28px,4vw,38px)", marginTop: 12 }}>{content.heading}</h1>}
          {content.lead && <p className="sub" style={{ marginTop: 6, maxWidth: 580 }}>{content.lead}</p>}
        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container">
          <NoOddsNotice sport="Golf" />
        </div>
      </section>
    </>
  );
}
