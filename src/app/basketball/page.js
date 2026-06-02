import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Basketball odds",
  description: "NBA, EuroLeague and more — live scores and prices.",
};

export default function Page() {
  return (
    <SportPage
      sport="basketball"
      title="Basketball odds"
      lead="NBA, EuroLeague and more — live scores and prices."
      subjectWord="matches"
    />
  );
}