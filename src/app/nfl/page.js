import SportPage from "@/components/SportPage";

export const metadata = {
  title: "NFL odds",
  description: "American football lines, totals and props.",
};

export default function Page() {
  return (
    <SportPage
      sport="nfl"
      title="NFL odds"
      lead="American football lines, totals and props."
      subjectWord="matches"
    />
  );
}