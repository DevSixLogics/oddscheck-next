import { getFootballMatches, getMatches, flattenMatches } from "@/lib/api";
import { statusOf } from "@/lib/format";
import Hero from "@/components/Hero";
import TodaysTopOdds from "@/components/TodaysTopOdds";
import BestOffers from "@/components/BestOffers";
import FeaturedEvent from "@/components/FeaturedEvent";
import TipsSection from "@/components/TipsSection";
import ScoresSection from "@/components/ScoresSection";
import SmartTools from "@/components/SmartTools";
import NewsSection from "@/components/NewsSection";
import LearnToBet from "@/components/LearnToBet";
import DashboardCTA from "@/components/DashboardCTA";

export const metadata = {
  title: "OddsCheck.com — compare best odds from top UK bookmakers",
};

// Other sports offered in the "Today's top odds" in-place switcher.
const SPORT_DEFS = [
  { key: "tennis", label: "Tennis", href: "/tennis" },
  { key: "basketball", label: "Basketball", href: "/basketball" },
  { key: "cricket", label: "Cricket", href: "/cricket" },
  { key: "racing", label: "Horse Racing", href: "/racing" },
  { key: "nfl", label: "NFL", href: "/nfl" },
  { key: "baseball", label: "Baseball", href: "/baseball" },
  { key: "golf", label: "Golf", href: "/golf" },
];

export default async function HomePage() {
  const { groups, source } = await getFootballMatches();
  const matches = flattenMatches(groups);
  const liveCount = matches.filter((m) => statusOf(m) === "live").length;

  // Matches per sport for the switcher (only sports that actually have matches).
  const others = await Promise.all(
    SPORT_DEFS.map(async (s) => {
      const res = await getMatches(s.key);
      return { ...s, matches: flattenMatches(res.groups) };
    })
  );
  const sportsData = [
    { key: "football", label: "Football", href: "/football", matches },
    ...others,
  ].filter((s) => s.matches.length);

  return (
    <>
      <Hero matches={matches} liveCount={liveCount} />
      <TodaysTopOdds sports={sportsData} />
      <BestOffers />
      <FeaturedEvent matches={matches} />
      <TipsSection />
      <ScoresSection matches={matches} source={source} />
      <SmartTools />
      <NewsSection />
      <LearnToBet />
      <DashboardCTA />
    </>
  );
}
