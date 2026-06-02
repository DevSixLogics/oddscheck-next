import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Football odds â€” compare best prices from top UK bookmakers",
  description:
    "Live football fixtures, results and in-play scores across every competition, straight from the feed.",
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return (
    <SportPage
      sport="football"
      date={sp?.date}
      title="Football odds"
      lead="Live fixtures, results and in-play scores across every competition."
    />
  );
}
