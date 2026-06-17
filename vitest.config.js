import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests live next to source. Playwright e2e specs are run separately
    // (npm run test:e2e) and must NOT be collected by Vitest.
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    exclude: ["node_modules/**", ".next/**", "tests/e2e/**"],
    environment: "node",
  },
});
