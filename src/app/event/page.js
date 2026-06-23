import { redirect } from "next/navigation";

// Back-compat redirector for the legacy query-string URL (/event?sport=…&id=…).
// The real match lives at the clean path /event/[sport]/[id]; middleware
// (proxy.js) 308-redirects the query-string form before this even renders, but
// this keeps any direct hit working AND guarantees the old two-<h1> query-param
// page can never render. No match data is fetched here.
export default async function LegacyEventRedirect({ searchParams }) {
  const sp = await searchParams;
  if (sp?.sport && sp?.id) redirect(`/event/${sp.sport}/${sp.id}`);
  redirect("/live");
}
