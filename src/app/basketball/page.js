import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Basketball odds",
  description: "NBA, EuroLeague and more â€” live scores and prices.",
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return (
    <SportPage
      sport="basketball"
      date={sp?.date}
      title="Basketball odds"
      lead="NBA, EuroLeague and more â€” live scores and prices."
      subjectWord="matches"
    />
  );
}