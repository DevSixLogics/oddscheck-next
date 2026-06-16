import SportPage from "@/components/SportPage";
import { matchListingSeo } from "@/lib/seo";

export function generateMetadata() {
  return matchListingSeo("basketball");
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <SportPage sport="basketball" date={sp?.date} subjectWord="matches" />;
}