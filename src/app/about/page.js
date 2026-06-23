import Link from "next/link";
import PagePlaceholder from "@/components/PagePlaceholder";
import { getSiteMeta } from "@/lib/api";

export const metadata = { title: "About", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const meta = await getSiteMeta();
  const name = meta.siteTitle || "OddsCheck";
  const lead =
    meta.description ||
    `${name} compares live betting odds across leading bookmakers so you always find the best price.`;
  return (
    <PagePlaceholder title={`About ${name}`} crumb="About" lead={lead}>
      <div className="card" style={{ padding: 28 }}>
        <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
          {name} brings together live odds from leading bookmakers across football, horse racing,
          tennis, basketball, cricket and more — so you can compare prices, spot the best value and
          follow in-play scores in one place. Every market shows the best available price across the
          bookmakers we track, with quick links through to each one.
        </p>
        <p style={{ color: "var(--text-2)", lineHeight: 1.7, marginTop: 14 }}>
          Alongside the odds we publish betting news, expert analysis and how-to guides to help you
          bet more informedly. 18+ only — please{" "}
          <Link href="/responsible-gambling">gamble responsibly</Link>.
        </p>
      </div>
    </PagePlaceholder>
  );
}
