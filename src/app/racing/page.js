import Link from "next/link";
import { matchListingSeo, sportListingContent } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import NoOddsNotice from "@/components/NoOddsNotice";

export function generateMetadata() {
  // Title comes from CMS /seo-settings; with no template nothing is emitted and the
  // page title inherits the CMS site_title. No static/fallback copy.
  return matchListingSeo("racing");
}

// Horse racing carries NO bookmaker odds in the feed (verified: the meetings and
// runners endpoints expose no odds/price fields). This is an odds-comparison
// site, so the racing route is kept (no 404 for direct/old links) but lists
// nothing — it shows a clear "no odds" notice instead of odds-less racecards.
export default async function RacingPage() {
  const content = await sportListingContent("racing");

  const racingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          // The sport crumb is emitted only when the CMS provides a heading — no static name.
          ...(content.heading ? [{ "@type": "ListItem", position: 2, name: content.heading, item: `${SITE_URL}/racing` }] : []),
        ],
      },
      {
        "@type": "CollectionPage",
        ...(content.heading ? { name: content.heading } : {}),
        url: `${SITE_URL}/racing`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={racingSchema} />
      <section style={{ padding: "28px 0 24px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              {content.heading && <li className="sep" aria-hidden="true">/</li>}
              {content.heading && <li><span className="current" aria-current="page">{content.heading}</span></li>}
            </ol>
          </nav>
          {content.heading && <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", marginTop: 12 }}>{content.heading}</h1>}
          {content.lead && <p className="sub" style={{ marginTop: 6, maxWidth: 580 }}>{content.lead}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <NoOddsNotice sport="Horse racing" />
        </div>
      </section>
    </>
  );
}
