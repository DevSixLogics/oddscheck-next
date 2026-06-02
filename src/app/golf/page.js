import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Golf odds",
  description: "Tournament outrights and matchups.",
};

export default function Page() {
  return (
    <SportPage
      sport="golf"
      title="Golf odds"
      lead="Tournament outrights and matchups."
      subjectWord="events"
    />
  );
}