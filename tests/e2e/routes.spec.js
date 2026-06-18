import { test, expect } from "@playwright/test";

// Regression guard for the production-readiness audit finding where public nav
// routes returned 401/500. Every route below MUST return HTTP 200. The local
// prod server runs with PREVIEW_PROTECT=0 (see playwright.config.js), mirroring
// the public production deployment where the Basic-Auth gate is off.
const PUBLIC_ROUTES = [
  "/",
  "/football", "/live", "/racing", "/tennis", "/basketball", "/cricket", "/baseball", "/golf",
  "/news", "/offers", "/experts", "/guides", "/tools",
  "/about", "/contact", "/responsible-gambling", "/odds-calculator",
];

for (const path of PUBLIC_ROUTES) {
  test(`GET ${path} -> 200`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), `${path} should be 200 but was ${res.status()}`).toBe(200);
  });
}

test("sitemap index links child sitemaps", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).toContain("<sitemapindex");
});

// Crawl every internal link on the homepage and fail if any is broken (>=400).
// This catches the exact regression class the audit hit — a nav/footer link
// pointing at a route that 401s/404s/500s.
test("homepage internal links are not broken", async ({ page, request }) => {
  test.setTimeout(120_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const hrefs = await page.$$eval("a[href]", (as) =>
    as.map((a) => a.getAttribute("href")).filter(Boolean)
  );
  const internal = [
    ...new Set(
      hrefs
        .filter((h) => h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/#"))
        .map((h) => h.split("#")[0])
    ),
  ];

  const broken = [];
  for (const path of internal) {
    const res = await request.get(path, { maxRedirects: 5 });
    if (res.status() >= 400) broken.push(`${path} -> ${res.status()}`);
  }
  expect(broken, `Broken homepage links:\n${broken.join("\n")}`).toEqual([]);
});
