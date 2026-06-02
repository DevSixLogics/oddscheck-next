import "./globals.scss";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  metadataBase: new URL("https://oddscheck.com"),
  title: {
    default: "OddsCheck.com — compare best odds from top UK bookmakers",
    template: "%s | OddsCheck.com",
  },
  description:
    "Live odds comparison and betting intelligence across football, racing, tennis, basketball and 30+ sports.",
  openGraph: {
    type: "website",
    siteName: "OddsCheck.com",
    images: ["/og-default.svg"],
  },
  twitter: { card: "summary_large_image", site: "@oddscheck" },
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  themeColor: "#0A0F1C",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main" role="main">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
