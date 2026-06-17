import SportPage from "@/components/SportPage";
import { matchListingSeo } from "@/lib/seo";

export function generateMetadata() {
  return matchListingSeo("football");
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <SportPage sport="football" date={sp?.date} />;
}
