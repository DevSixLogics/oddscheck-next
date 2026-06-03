import { getFootballMatches, getMatches, flattenMatches, getRacingMeetings } from "@/lib/api";
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
// Racing uses a different feed (meetings/races) and renders race rows.
const SPORT_DEFS = [
  { key: "tennis", label: "Tennis", href: "/tennis" },
  { key: "basketball", label: "Basketball", href: "/basketball" },
  { key: "cricket", label: "Cricket", href: "/cricket" },
  { key: "nfl", label: "NFL", href: "/nfl" },
  { key: "baseball", label: "Baseball", href: "/baseball" },
  { key: "golf", label: "Golf", href: "/golf" },
];

export default async function HomePage() {
  const { groups } = await getFootballMatches();
  const matches = flattenMatches(groups);
  const liveCount = matches.filter((m) => statusOf(m) === "live").length;

  // Matches per sport for the switcher.
  const others = await Promise.all(
    SPORT_DEFS.map(async (s) => {
      const res = await getMatches(s.key);
      return { ...s, matches: flattenMatches(res.groups) };
    })
  );

  // Racing: pull today's races from the meetings feed (not new-matches), and
  // flatten to race rows the switcher can render (no 1·X·2 odds in this feed).
  const { meetings } = await getRacingMeetings();
  const races = meetings.flatMap((m) =>
    (m.races || []).map((r) => ({ ...r, course: m.cnm, going: m.go }))
  );
  const racing = { key: "racing", label: "Horse Racing", href: "/racing", kind: "racing", races, matches: [] };

  // Show every sport as a pill (matching the reference). Racing sits second.
  const sportsData = [
    { key: "football", label: "Football", href: "/football", matches },
    racing,
    ...others,
  ];

  return (
    <>
      <Hero matches={matches} liveCount={liveCount} />
      <TodaysTopOdds sports={sportsData} />
      <BestOffers />
      <FeaturedEvent matches={matches} />
      <TipsSection />
      <ScoresSection matches={matches} />
      <SmartTools />
      <NewsSection />
      <LearnToBet />
      <DashboardCTA />
    </>
  );
}
