import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { alternates: { canonical: "/dashboard" } };

export default function Page() {
  return <PagePlaceholder title="Your dashboard" crumb="Dashboard" lead="Followed teams, tracked bets and price alerts." />;
}