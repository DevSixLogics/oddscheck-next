import { defineConfig, devices } from "@playwright/test";

// Smoke + a11y suite. Runs against a local production build. The site sits behind
// HTTP Basic Auth (preview gate) — credentials come from env with preview defaults.
const PORT = process.env.E2E_PORT || 3940;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const USER = process.env.BASIC_AUTH_USER || "oddscheck";
const PASS = process.env.BASIC_AUTH_PASS || "preview2026";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    httpCredentials: { username: USER, password: PASS },
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
