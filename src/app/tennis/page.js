import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Tennis odds",
  description: "Tournament matches, sets and outright markets.",
};

export default function Page() {
  return (
    <SportPage
      sport="tennis"
      title="Tennis odds"
      lead="Tournament matches, sets and outright markets."
      subjectWord="matches"
    />
  );
}