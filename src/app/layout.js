import "./globals.scss";
import Script from "next/script";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { OddsFormatProvider } from "@/components/OddsFormatProvider";
import GoalAlerts from "@/components/GoalAlerts";
import JsonLd from "@/components/JsonLd";
import WebVitals from "@/components/WebVitals";
import { getHeaderMenu, getSiteMeta } from "@/lib/api";
import { SITE_URL, normalizeUrl } from "@/lib/site";

// All metadata is driven by the CMS /settings API — no static brand strings or
// asset fallbacks here. Fields the CMS doesn't provide are omitted entirely.
// (metadataBase uses SITE_URL, the env-configured canonical origin, not a literal.)
export async function generateMetadata() {
  const meta = await getSiteMeta();
  // Canonical/OG origin comes from the CMS site_url; env SITE_URL is the fallback.
  const baseUrl = normalizeUrl(meta.siteUrl) || SITE_URL;
  return {
    metadataBase: new URL(baseUrl),
    alternates: { canonical: "/" },
    ...(meta.siteTitle
      ? { title: { default: meta.siteTitle, template: `%s | ${meta.siteTitle}` } }
      : {}),
    ...(meta.description ? { description: meta.description } : {}),
    openGraph: {
      type: "website",
      ...(meta.siteTitle ? { siteName: meta.siteTitle } : {}),
      ...(meta.ogImage ? { images: [meta.ogImage] } : {}),
    },
    twitter: { card: "summary_large_image" },
    ...(meta.favicon
      ? { icons: { icon: meta.favicon, shortcut: meta.favicon, apple: meta.favicon } }
      : {}),
    ...(meta.gscCode ? { verification: { google: meta.gscCode } } : {}),
  };
}

export const viewport = {
  themeColor: "#0A0F1C",
};

// Site-wide Organization + WebSite (with on-site search) structured data, enriched
// from /settings (logo, social profiles, contact) when the CMS provides them.
function buildSiteSchema(meta, base) {
  const org = {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    url: base,
    ...(meta.siteTitle ? { name: meta.siteTitle } : {}),
    ...(meta.logo ? { logo: meta.logo } : {}),
  };
  if (meta.sameAs?.length) org.sameAs = meta.sameAs;
  if (meta.email || meta.phone) {
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer support",
      ...(meta.email ? { email: meta.email } : {}),
      ...(meta.phone ? { telephone: meta.phone } : {}),
    };
  }
  if (meta.contact?.city || meta.contact?.streetAddress || meta.contact?.country) {
    org.address = {
      "@type": "PostalAddress",
      ...(meta.contact.streetAddress ? { streetAddress: meta.contact.streetAddress } : {}),
      ...(meta.contact.city ? { addressLocality: meta.contact.city } : {}),
      ...(meta.contact.region ? { addressRegion: meta.contact.region } : {}),
      ...(meta.contact.postalCode ? { postalCode: meta.contact.postalCode } : {}),
      ...(meta.contact.country ? { addressCountry: meta.contact.country } : {}),
    };
  }
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        ...(meta.siteTitle ? { name: meta.siteTitle } : {}),
        publisher: { "@id": `${base}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${base}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export default async function RootLayout({ children }) {
  const [menu, meta] = await Promise.all([getHeaderMenu(), getSiteMeta()]);
  const baseUrl = normalizeUrl(meta.siteUrl) || SITE_URL;
  const siteSchema = buildSiteSchema(meta, baseUrl);
  return (
    <html lang="en">
      <body>
        <JsonLd data={siteSchema} />
        <WebVitals />
        {/* Google Analytics — only rendered when the CMS supplies a measurement ID. */}
        {meta.gaCode && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${meta.gaCode}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${meta.gaCode}');`}
            </Script>
          </>
        )}
        <a href="#main" className="skip-link">Skip to content</a>
        <OddsFormatProvider>
          <GoalAlerts />
          <Header menu={menu} logo={meta.headerLogo} />
          <main id="main" role="main">
            {children}
          </main>
          <SiteFooter logo={meta.footerLogo} />
        </OddsFormatProvider>
      </body>
    </html>
  );
}
