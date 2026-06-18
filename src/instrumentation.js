import * as Sentry from "@sentry/nextjs";

// Server/edge error + performance reporting. ENTIRELY INERT unless a DSN is set,
// so local dev and DSN-less deploys are unaffected. Activate by setting, on the
// deployment:
//   SENTRY_DSN             — server/edge DSN
//   NEXT_PUBLIC_SENTRY_DSN — client DSN (same value is fine)
// (Optionally add SENTRY_AUTH_TOKEN + withSentryConfig later for source maps.)
export function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV || "development",
      tracesSampleRate: 0.1,
    });
  }
}

// Reports server-side render / route-handler errors (the 500-class failures the
// audit flagged, e.g. the old article crash) to Sentry. No-op when uninitialised.
export const onRequestError = Sentry.captureRequestError;
