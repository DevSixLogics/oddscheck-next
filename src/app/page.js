import { getFootballMatches, getMatches, flattenMatches, getRacingMeetings, getGolfTournaments } from "@/lib/api";
import { statusOf } from "@/lib/format";
import Hero from "@/components/Hero";
import TodaysTopOdds from "@/components/TodaysTopOdds";
import BestOffers from "@/components/BestOffers";
import FeaturedEvent from "@/components/FeaturedEvent";
import ScoresSection from "@/components/ScoresSection";
import SmartTools from "@/components/SmartTools";
import NewsSection from "@/components/NewsSection";
import LearnToBet from "@/components/LearnToBet";
import DashboardCTA from "@/components/DashboardCTA";

export const metadata = {
  title: "OddsCheck.com — compare best odds from top UK bookmakers",
};

// Match-feed sports for the "Today's top odds" in-place switcher.
// Racing (meetings/races) and golf (leaderboards) use their own feeds — handled below.
const SPORT_DEFS = [
  { key: "tennis", label: "Tennis", href: "/tennis" },
  { key: "basketball", label: "Basketball", href: "/basketball" },
  { key: "cricket", label: "Cricket", href: "/cricket" },
  { key: "baseball", label: "Baseball", href: "/baseball" },
];

export default async function HomePage() {
  const { groups } = await getFootballMatches();
  const matches = flattenMatches(groups);

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

  // Golf: leaderboard feed (not new-matches). Flatten players with their tournament
  // for the switcher; no outright odds in this feed.
  const { tournaments } = await getGolfTournaments();
  const golfPlayers = tournaments.flatMap((t) =>
    (t.matches || []).map((p) => ({ ...p, tournament: t.nm }))
  );
  const golf = { key: "golf", label: "Golf", href: "/golf", kind: "golf", players: golfPlayers, matches: [] };

  // "Live now" count across ALL sports: football + other match feeds + racing
  // (a race is live only while OFF, i.e. in-running).
  const liveCount =
    matches.filter((m) => statusOf(m) === "live").length +
    others.reduce((n, s) => n + s.matches.filter((m) => statusOf(m) === "live").length, 0) +
    races.filter((r) => (r.status || "").toUpperCase() === "OFF").length;

  // Show every sport as a pill (matching the reference). Racing sits second.
  const sportsData = [
    { key: "football", label: "Football", href: "/football", matches },
    racing,
    ...others,
    golf,
  ];

  // Scores & results draws from ALL match-feed sports (not just football),
  // tagged with their sport so crests resolve to the right logo path.
  const scoresMatches = [
    ...matches.map((m) => ({ ...m, sport: "football" })),
    ...others.flatMap((s) => s.matches.map((m) => ({ ...m, sport: s.key }))),
  ];

  return (
    <>
      <Hero matches={matches} liveCount={liveCount} />
      <TodaysTopOdds sports={sportsData} />
      <BestOffers />
      <FeaturedEvent matches={matches} />
      <ScoresSection matches={scoresMatches} />
      <SmartTools />
      <NewsSection />
      <LearnToBet />
      <DashboardCTA />
    </>
  );
}
