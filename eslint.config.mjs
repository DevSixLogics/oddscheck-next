// Flat ESLint config. eslint-config-next v16 exports native flat-config arrays,
// so we spread them directly (no FlatCompat needed on ESLint 9).
import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "tests/e2e/**",
      "playwright-report/**",
    ],
  },
  {
    // The react-hooks v7 rules below flag long-standing, intentional patterns
    // (lazy localStorage hydration, socket connect/disconnect subscriptions,
    // live-minute ref sync). They're tracked as tech debt in PRODUCTION-READINESS.md
    // rather than refactored in this P0/P1 pass — downgraded to warnings so they
    // stay visible without failing the build.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
