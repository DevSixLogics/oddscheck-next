import { redirect } from "next/navigation";

// Back-compat redirector for the legacy query-string URL (/article?slug=…).
// The real article lives at the clean path /article/[slug]; middleware (proxy.js)
// 308-redirects the query-string form before this even renders, but this keeps
// /article (no slug) and any direct hit working too. No CMS HTML is rendered or
// sanitized here.
export default async function LegacyArticleRedirect({ searchParams }) {
  const sp = await searchParams;
  if (sp?.slug) redirect(`/article/${sp.slug}`);
  redirect("/news");
}
