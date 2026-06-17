import SportPage from "@/components/SportPage";
import { matchListingSeo } from "@/lib/seo";

export function generateMetadata() {
  return matchListingSeo("tennis");
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <SportPage sport="tennis" date={sp?.date} subjectWord="matches" />;
}