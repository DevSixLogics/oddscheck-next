import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Football odds — compare best prices from top UK bookmakers",
  description:
    "Live football fixtures, results and in-play scores across every competition, straight from the feed.",
};

export default function Page() {
  return (
    <SportPage
      sport="football"
      title="Football odds"
      lead="Live fixtures, results and in-play scores across every competition."
    />
  );
}
