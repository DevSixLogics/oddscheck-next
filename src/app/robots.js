import { getSettings } from "@/lib/api";
import { getBaseUrl } from "@/lib/base-url";

// Render per-request so host + CMS robots_txt_code reflect the live deploy.
// (Uses the robots.js metadata convention — a route handler at /robots.txt conflicts.)
export const dynamic = "force-dynamic";

// Default rules used only if the CMS doesn't supply robots_txt_code.
const FALLBACK_RULES = { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login", "/signup", "/api/"] };

/** Parse the CMS `robots_txt_code` into Next's Robots rules (Sitemap line ignored). */
function parseRobots(txt) {
  const out = { userAgent: "*", allow: [], disallow: [] };
  let seen = false;
  for (const raw of String(txt).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    const val = line.slice(i + 1).trim();
    if (key === "user-agent") { out.userAgent = val || "*"; seen = true; }
    else if (key === "allow") { if (val) out.allow.push(val); seen = true; }
    else if (key === "disallow") { if (val) out.disallow.push(val); seen = true; }
  }
  if (!seen) return null;
  if (out.allow.length === 0) delete out.allow;
  else if (out.allow.length === 1) out.allow = out.allow[0];
  if (out.disallow.length === 0) delete out.disallow;
  return out;
}

export default async function robots() {
  const base = await getBaseUrl();

  let rules = FALLBACK_RULES;
  try {
    const settings = await getSettings();
    const parsed = settings?.robots_txt_code ? parseRobots(settings.robots_txt_code) : null;
    if (parsed) rules = parsed;
  } catch {
    /* settings down — fall back to default rules */
  }

  return { rules, sitemap: `${base}/sitemap.xml`, host: base };
}
