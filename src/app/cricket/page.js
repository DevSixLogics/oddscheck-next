import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Cricket odds",
  description: "Internationals and T20 leagues — live scores and prices.",
};

export default function Page() {
  return (
    <SportPage
      sport="cricket"
      title="Cricket odds"
      lead="Internationals and T20 leagues — live scores and prices."
      subjectWord="matches"
    />
  );
}