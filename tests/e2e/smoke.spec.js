import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Key public routes that must render and be free of serious accessibility issues.
const ROUTES = [
  { path: "/", name: "home" },
  { path: "/news", name: "news" },
  { path: "/experts", name: "experts" },
  { path: "/football", name: "football" },
];

for (const route of ROUTES) {
  test(`${route.name} renders`, async ({ page }) => {
    const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(res?.status(), `${route.path} should not be a 5xx`).toBeLessThan(500);
    await expect(page.locator("main#main")).toBeVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test(`${route.name} has no serious axe violations`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id), null, 2)).toEqual([]);
  });
}

test("home exposes JSON-LD structured data", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const count = await page.locator('script[type="application/ld+json"]').count();
  expect(count).toBeGreaterThan(0);
});

test("sitemap index, a child sitemap, and robots are served", async ({ request }) => {
  // /sitemap.xml is now a sitemap INDEX listing per-section child sitemaps.
  const index = await request.get("/sitemap.xml");
  expect(index.ok()).toBeTruthy();
  expect(await index.text()).toContain("<sitemapindex");

  // …and each child is a urlset of real URLs.
  const child = await request.get("/sitemap/pages.xml");
  expect(child.ok()).toBeTruthy();
  const childXml = await child.text();
  expect(childXml).toContain("<urlset");
  expect(childXml).toContain("<loc>");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap:");
});

test("security headers are present", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  expect(headers["content-security-policy"]).toBeTruthy();
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBeTruthy();
});
