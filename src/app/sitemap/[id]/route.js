import { getBaseUrl } from "@/lib/base-url";
import { sitemapGroupIds, sitemapEntries, renderUrlset, renderIndex } from "@/lib/sitemap-data";

// Sitemap served under the /sitemap/ path. We use explicit route handlers rather
// than Next's metadata `sitemap.js` + generateSitemaps convention because that
// convention does NOT work in this app: the root [slug] catch-all shadows the
// /sitemap.xml index (Next never registers an index route for it), and the
// per-request host base URL (headers()) can't be resolved when Next pre-renders
// the children at build. Route handlers give a working, host-dynamic result
// whose XML output is fully sitemaps.org-compliant.
//
//   /sitemap/index.xml     → the sitemap INDEX (served at /sitemap.xml via a
//                            next.config rewrite — the canonical crawler path)
//   /sitemap/{group}.xml   → one child sitemap per group (served publicly as
//                            /sitemap-{group}.xml via next.config rewrites)
export const dynamic = "force-dynamic";

const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8" };

export async function GET(_request, { params }) {
  const { id: raw } = await params;
  const id = String(raw).replace(/\.xml$/i, ""); // tolerate /sitemap/pages.xml and /sitemap/pages
  const base = await getBaseUrl();

  // Index → list every child sitemap.
  if (id === "index") {
    const now = new Date();
    const children = sitemapGroupIds().map((gid) => ({ loc: `${base}/sitemap-${gid}.xml`, lastmod: now }));
    return new Response(renderIndex(children), { headers: XML_HEADERS });
  }

  // Otherwise a single child sitemap.
  const entries = await sitemapEntries(id, base);
  if (!entries) {
    return new Response("Sitemap not found", { status: 404 });
  }
  return new Response(renderUrlset(entries), { headers: XML_HEADERS });
}
