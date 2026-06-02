import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Baseball odds",
  description: "MLB and more — live scores and prices.",
};

export default function Page() {
  return (
    <SportPage
      sport="baseball"
      title="Baseball odds"
      lead="MLB and more — live scores and prices."
      subjectWord="matches"
    />
  );
}