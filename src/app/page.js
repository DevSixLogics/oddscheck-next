import { getMatchesByLocalDate, flattenMatches, getSiteMeta } from "@/lib/api";
import { statusOf, todayInZone } from "@/lib/format";
import { getViewerTimeZone } from "@/lib/timezone";
import Hero from "@/components/Hero";
import TodaysTopOdds from "@/components/TodaysTopOdds";
import BestOffers from "@/components/BestOffers";
import FeaturedEvent from "@/components/FeaturedEvent";
import ScoresSection from "@/components/ScoresSection";
import SmartTools from "@/components/SmartTools";
import NewsSection from "@/components/NewsSection";
import LearnToBet from "@/components/LearnToBet";
import DashboardCTA from "@/components/DashboardCTA";

// Home title comes entirely from the CMS /settings API (site_title) — no static
// string here. `absolute` keeps the CMS title verbatim (no "| OddsCheck.com"
// suffix). If the API has no title, we set nothing and inherit the root layout.
// Description is inherited from the root layout (also driven by /settings).
export async function generateMetadata() {
  const meta = await getSiteMeta();
  return meta.siteTitle ? { title: { absolute: meta.siteTitle } } : {};
}

// Match-feed sports for the "Today's top odds" in-place switcher.
// Racing (meetings/races) and golf (leaderboards) use their own feeds — handled below.
const SPORT_DEFS = [
  { key: "tennis", label: "Tennis", href: "/tennis" },
  { key: "basketball", label: "Basketball", href: "/basketball" },
  { key: "cricket", label: "Cricket", href: "/cricket" },
  { key: "baseball", label: "Baseball", href: "/baseball" },
];

export default async function HomePage() {
  // Match-feed sports are grouped by the viewer's LOCAL today (so a late-UTC
  // kickoff shows on the right local day), like the sport listing pages.
  const tz = await getViewerTimeZone();
  const today = todayInZone(tz);
  const { groups } = await getMatchesByLocalDate("football", today, tz, { fresh: true });
  const matches = flattenMatches(groups);

  // Matches per sport for the switcher.
  const others = await Promise.all(
    SPORT_DEFS.map(async (s) => {
      const res = await getMatchesByLocalDate(s.key, today, tz, { fresh: true });
      return { ...s, matches: flattenMatches(res.groups) };
    })
  );

  // "Live now" count across the match-feed sports (football + other match feeds).
  const liveCount =
    matches.filter((m) => statusOf(m) === "live").length +
    others.reduce((n, s) => n + s.matches.filter((m) => statusOf(m) === "live").length, 0);

  // Sport pills. Racing & golf carry no odds in the feed, so their tabs are shown
  // (kept in the switcher + nav) but have no priced rows — they render the "no
  // data" empty state, like any sport with no odds-carrying matches right now.
  const sportsData = [
    { key: "football", label: "Football", href: "/football", matches },
    { key: "racing", label: "Horse Racing", href: "/racing", matches: [] },
    ...others,
    { key: "golf", label: "Golf", href: "/golf", matches: [] },
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
