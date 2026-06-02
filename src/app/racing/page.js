import SportPage from "@/components/SportPage";

export const metadata = {
  title: "Horse racing odds",
  description: "Today's meetings, races and best prices.",
};

export default function Page() {
  return (
    <SportPage
      sport="racing"
      title="Horse racing odds"
      lead="Today's meetings, races and best prices."
      subjectWord="races"
    />
  );
}