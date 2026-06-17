// Shared SEO helpers for sport match surfaces — metadata + JSON-LD built the same
// way everywhere so /football, /tennis, the [slug] sports and /event stay consistent.
// Sport names/headings are NOT hardcoded here — they come from the CMS /seo-settings
// templates; surfaces emit nothing when the CMS has no value (no static fallback).
import { SITE_URL } from "@/lib/site";
import { getSeoSettings, getSettings } from "@/lib/api";

/**
 * Metadata for a sport fixtures/odds listing page — title, description, canonical
 * and Open Graph, identical shape for every sport. Pure (only reads SITE_URL), so
 * it can back either `export const metadata = …` or a `generateMetadata`.
 */
export function sportMetadata(slug, { title } = {}) {
  const canonical = `/${String(slug).toLowerCase()}`;
  // No fallback values: a title is emitted only if explicitly provided. With no CMS
  // template the page title inherits the layout's CMS site_title, and the description
  // is `null` so it doesn't inherit the generic site description either.
  return {
    ...(title ? { title } : {}),
    description: null,
    // Relative URLs resolve against metadataBase (the CMS site_url) — no hardcoded host.
    alternates: { canonical },
    openGraph: { type: "website", ...(title ? { title } : {}), url: canonical },
  };
}

/**
 * Visible heading (H1) + lead for a sport surface, taken from the CMS /seo-settings
 * template (`h` = heading, `d` = lead) with %TOKEN% replacement. No fallback values:
 * both are empty/null when the CMS doesn't provide them, and the caller omits them.
 */
export async function sportListingContent(slug, { kind = "listing", subsection, replacements = {} } = {}) {
  const seo = await getSeoSettings();
  const sportKey = resolveSeoSportKey(seo, slug);
  let heading = "";
  let lead = "";
  if (sportKey) {
    const seoData = seo[sportKey];
    const section = seoSection(seoData, kind);
    const subKey = subsection || (kind === "detail" ? "info" : "all");
    const sectionNode = seoData?.[section];
    const node = sectionNode?.[subKey] || sectionNode?.all || sectionNode?.info;
    if (node) {
      const repl = { SITE_NAME: seo?.site_title || "", ...replacements };
      heading = applyTokens(node.h, repl).trim();
      lead = applyTokens(node.d, repl).trim();
    }
  }
  return { heading: heading || "", lead: lead || null };
}

/**
 * JSON-LD for a sport listing page: BreadcrumbList (Home › Sport) + a CollectionPage
 * whose mainEntity is an ItemList of the listed fixtures as SportsEvent items.
 * `matches` is the flattened match array (competitors + id + dt) SportPage already has.
 */
export function sportListJsonLd({ slug, matches = [], name = "", limit = 50 }) {
  const path = `/${String(slug).toLowerCase()}`;
  const events = matches
    .slice(0, limit)
    .map((m, i) => {
      const c = m.competitors || {};
      const evName = c.htn && c.atn ? `${c.htn} v ${c.atn}` : m.nm || m.league || "";
      if (!evName) return null;
      const item = { "@type": "SportsEvent", name: evName, url: `${SITE_URL}/event?sport=${String(slug).toLowerCase()}&id=${m.id}` };
      const start = m.dt || m.gdt;
      if (start) item.startDate = String(start).replace(" ", "T");
      return { "@type": "ListItem", position: i + 1, item };
    })
    .filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          // The sport crumb/name come from the CMS heading — omitted when absent (no static name).
          ...(name ? [{ "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` }] : []),
        ],
      },
      {
        "@type": "CollectionPage",
        ...(name ? { name } : {}),
        url: `${SITE_URL}${path}`,
        ...(events.length
          ? { mainEntity: { "@type": "ItemList", numberOfItems: events.length, itemListElement: events } }
          : {}),
      },
    ],
  };
}

// ── CMS-driven SEO templates (/seo-settings) ────────────────────────────────────
// The CMS returns per-sport title/description/keyword templates with %TOKEN%
// placeholders. We resolve the tokens at request time and build full metadata,
// exactly like the listing/detail pages. Sports the CMS has no template for fall
// back to sportMetadata() in the callers.

// Top-level /seo-settings keys that aren't sports (so we skip them when matching).
const SEO_META_KEYS = new Set(["site_url", "site_title", "site_og_image", "site_description"]);
const normSport = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Resolve an app sport slug to the matching /seo-settings top-level key DYNAMICALLY
 * — no hardcoded map. The CMS response itself is the source of truth: we match the
 * slug against the sport keys the CMS actually returns (e.g. "ice-hockey"→"icehockey",
 * "racing"→"horse-racing"). Returns null when the CMS has no node for the sport.
 */
function resolveSeoSportKey(seo, slug) {
  if (!seo) return null;
  const target = normSport(slug);
  if (!target) return null;
  const keys = Object.keys(seo).filter((k) => !SEO_META_KEYS.has(k) && seo[k] && typeof seo[k] === "object");
  // Exact normalized match first ("ice-hockey" === "icehockey"), then a contains
  // match for differing-word slugs ("racing" ⊂ "horseracing", "hockey" ⊂ "icehockey").
  return (
    keys.find((k) => normSport(k) === target) ||
    keys.find((k) => { const n = normSport(k); return n.includes(target) || target.includes(n); }) ||
    null
  );
}

/**
 * Read the section name (listing/detail) from the sport node's own shape — racing
 * carries race_listings/race_detail, team sports carry match_listings/match_detail.
 */
function seoSection(seoData, kind) {
  if (kind === "detail") return seoData?.race_detail ? "race_detail" : "match_detail";
  return seoData?.race_listings ? "race_listings" : "match_listings";
}

/** Replace %TOKEN% placeholders in a template string. */
function applyTokens(text, replacements) {
  if (!text) return "";
  let out = String(text);
  for (const [token, value] of Object.entries(replacements)) {
    out = out.replace(new RegExp(`%${token}%`, "g"), value ?? "");
  }
  return out;
}

/**
 * Build Next.js metadata from the CMS /seo-settings templates for a sport surface.
 * Returns null when the CMS has no template for this sport/section — callers then
 * fall back to their own defaults (sportMetadata / static).
 *
 * @param sport         app slug (football, ice-hockey, racing, …)
 * @param kind          "listing" | "detail" — picks the right section per sport
 *                      (match_listings/match_detail, or race_listings/race_detail)
 * @param subsection    e.g. "all" (listing) or "info" (detail); falls back to info/all
 * @param replacements  token map, e.g. { HOME_TEAM, AWAY_TEAM, LEAGUE_NAME, DATE }
 *                      or { RACE_NAME, PLAYER_NAME, COUNTRY_NAME, DATE } for racing
 * @param canonicalPath site-relative canonical/OG path for this page
 */
export async function cmsSeo({ sport, kind = "listing", subsection, replacements = {}, canonicalPath = "/" }) {
  const [seo, settings] = await Promise.all([getSeoSettings(), getSettings()]);
  const sportKey = resolveSeoSportKey(seo, sport);
  if (!sportKey) return null;

  const seoData = seo[sportKey];
  const section = seoSection(seoData, kind);
  const subKey = subsection || (kind === "detail" ? "info" : "all");
  const sectionNode = seoData?.[section];
  const node = sectionNode?.[subKey] || sectionNode?.info || sectionNode?.all;
  if (!node) return null;

  const siteTitle = seo.site_title || "";
  const siteOgImage = seo.site_og_image || null;
  const repl = { SITE_NAME: siteTitle, ...replacements };
  const sub = (t) => applyTokens(t, repl).trim();

  const title = sub(node.t);
  const description = sub(node.d);
  const keywords = node.k ? sub(node.k).split(",").map((s) => s.trim()).filter(Boolean) : [];
  if (!title && !description) return null;

  // Twitter handle from the general settings social links (matches the CMS theme).
  const tw = (settings?.social_links || []).find((l) => (l?.type || "").toLowerCase() === "twitter");
  const twitterHandle = (tw?.link || "").trim() || null;

  return {
    // `absolute` keeps the CMS title verbatim (templates already end in "- %SITE_NAME%").
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    ...(keywords.length ? { keywords } : {}),
    // Relative paths resolve against metadataBase (the CMS site_url) — no hardcoded host.
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(siteOgImage ? { images: [{ url: siteOgImage, width: 1200, height: 630, alt: siteTitle }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
      ...(siteOgImage ? { images: [siteOgImage] } : {}),
    },
    robots: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  };
}

/**
 * Common SEO builder for a sport fixtures listing — the single entry point every
 * sport route uses (mirrors the CMS theme's MatchListingSeo). Resolves the CMS
 * /seo-settings template for the sport (match_listings / race_listings, by the
 * sport's own shape), with NO static fallback — when the CMS has no node, only the
 * canonical/OG are emitted and the title inherits the CMS site_title.
 *
 * @param sport app slug (football, tennis, ice-hockey, racing, golf, …)
 * @param type  listing subsection — "all" (default) | "live" | "results" | "upcoming"
 */
export async function matchListingSeo(sport, { type = "all" } = {}) {
  const cms = await cmsSeo({
    sport,
    kind: "listing",
    subsection: type,
    canonicalPath: `/${String(sport).toLowerCase()}`,
  });
  return cms || sportMetadata(sport);
}

/**
 * CollectionPage + ItemList(NewsArticle) JSON-LD for an article-listing page
 * (news, offers, guides, a category, …). Mirrors the CMS theme's buildArticlesJsonLd.
 * `name`/`description` should come from the CMS (omitted when empty); each article
 * becomes a NewsArticle item. Articles link to the real /article?slug= URL.
 */
export function articleListJsonLd({ name, description, path = "/", articles = [], limit = 50 }) {
  const url = `${SITE_URL}${path}`;
  const items = (articles || [])
    .slice(0, limit)
    .map((a, i) => {
      if (!a?.headline) return null;
      const item = {
        "@type": "NewsArticle",
        headline: a.headline,
        url: a.slug ? `${SITE_URL}/article?slug=${a.slug}` : url,
      };
      const d = a.start_date ? new Date(String(a.start_date).replace(" ", "T")) : null;
      if (d && !isNaN(d)) { item.datePublished = d.toISOString(); item.dateModified = d.toISOString(); }
      if (a.meta_description || a.strapline) item.description = a.meta_description || a.strapline;
      if (a.image_path || a.image_path_jpg) item.image = a.image_path_jpg || a.image_path;
      if (a.authorName) {
        item.author = { "@type": "Person", name: a.authorName, ...(a.authorSlug ? { url: `${SITE_URL}/experts/${a.authorSlug}` } : {}) };
      }
      return { "@type": "ListItem", position: i + 1, item };
    })
    .filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    url,
    ...(items.length ? { mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items } } : {}),
  };
}

/**
 * CollectionPage + ItemList(Person) JSON-LD for the experts/authors listing.
 * Each author becomes a Person; name/url only (no fabricated fields).
 */
export function personListJsonLd({ name, description, path = "/", people = [], limit = 100 }) {
  const url = `${SITE_URL}${path}`;
  const items = (people || [])
    .slice(0, limit)
    .map((p, i) => {
      if (!p?.name) return null;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: p.name,
          ...(p.slug ? { url: `${SITE_URL}/experts/${p.slug}` } : {}),
          ...(p.image ? { image: p.image } : {}),
        },
      };
    })
    .filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    url,
    ...(items.length ? { mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items } } : {}),
  };
}

/**
 * Generic BreadcrumbList JSON-LD. `crumbs` = [{ name, path? }] in order; the last
 * (current page) typically omits `path`.
 */
export function breadcrumbJsonLd(crumbs = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${SITE_URL}${c.path}` } : {}),
    })),
  };
}
