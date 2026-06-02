import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Baseball odds",
  description: "MLB and more â€” live scores and prices.",
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return (
    <SportPage
      sport="baseball"
      date={sp?.date}
      title="Baseball odds"
      lead="MLB and more â€” live scores and prices."
      subjectWord="matches"
    />
  );
}