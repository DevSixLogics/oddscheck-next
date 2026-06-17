import { getSettings } from "@/lib/api";
import { baseUrlFromHeaders } from "@/lib/base-url";

// Route Handler (not the robots.js metadata convention) so it renders per-request.
// Reading `request.headers` directly keeps it dynamic — the robots body comes from
// the CMS /settings `robots_txt_code` and the Sitemap line uses the live host.
export const dynamic = "force-dynamic";

const DEFAULT_RULES = "User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /login\nDisallow: /signup";

export async function GET(request) {
  const base = baseUrlFromHeaders(request.headers);

  let body = "";
  try {
    const settings = await getSettings();
    body = (settings?.robots_txt_code || "").trim();
  } catch {
    /* settings down — fall back to default rules */
  }
  if (!body) body = DEFAULT_RULES;

  // Drop any Sitemap line from the CMS text and emit a host-correct one.
  body = body
    .split(/\r?\n/)
    .filter((l) => !/^\s*sitemap\s*:/i.test(l))
    .join("\n")
    .trimEnd();
  body += `\n\nSitemap: ${base}/sitemap.xml\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
