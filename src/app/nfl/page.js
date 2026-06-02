import SportPage from "@/components/SportPage";

export const metadata = {
  title: "NFL odds",
  description: "American football lines, totals and props.",
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return (
    <SportPage
      sport="nfl"
      date={sp?.date}
      title="NFL odds"
      lead="American football lines, totals and props."
      subjectWord="matches"
    />
  );
}