import Link from "next/link";
import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Dashboard", alternates: { canonical: "/dashboard" } };

export default function DashboardPage() {
  return (
    <PagePlaceholder
      title="Your dashboard"
      crumb="Dashboard"
      lead="Compare live odds, follow fixtures and keep an eye on price moves."
    >
      <div className="card" style={{ padding: 28 }}>
        <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
          Jump into <Link href="/live">live odds</Link>, browse today&apos;s{" "}
          <Link href="/football">fixtures</Link>, or open any match for the full multi-bookmaker
          price comparison and in-play scores.
        </p>
        <div className="flex gap-3 flex-wrap" style={{ marginTop: 18 }}>
          <Link className="btn btn-primary btn-sm" href="/live">Live odds</Link>
          <Link className="btn btn-outline btn-sm" href="/football">Today&apos;s fixtures</Link>
        </div>
      </div>
    </PagePlaceholder>
  );
}
