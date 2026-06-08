import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Tennis odds",
  description: "Tournament matches, sets and outright markets.",
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return (
    <SportPage
      sport="tennis"
      date={sp?.date}
      title="Tennis odds"
      lead="Tournament matches, sets and outright markets."
      subjectWord="matches"
    />
  );
}