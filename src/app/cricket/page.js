import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Cricket odds",
  description: "Internationals and T20 leagues â€” live scores and prices.",
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return (
    <SportPage
      sport="cricket"
      date={sp?.date}
      title="Cricket odds"
      lead="Internationals and T20 leagues â€” live scores and prices."
      subjectWord="matches"
    />
  );
}