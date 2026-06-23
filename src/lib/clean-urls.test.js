import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { scanLegacyUrls } from "../../scripts/check-urls.mjs";

// Guard: the clean-URL migration must not revert. If this fails, a legacy
// query-string link (/article?slug=, /review?author=, /event?…) has been
// reintroduced — JSON-LD / canonical / sitemap URLs that 308-redirect are an
// SEO defect. Migrate the listed file to canonical paths.
describe("clean-URL guard", () => {
  it("has no legacy query-string article/review/event URLs in src/", () => {
    const hits = scanLegacyUrls(join(process.cwd(), "src"));
    const detail = hits.map((h) => `${h.file}:${h.line} → ${h.label}`).join("\n");
    expect(hits, `Legacy URLs must be migrated to clean paths:\n${detail}`).toEqual([]);
  });
});
