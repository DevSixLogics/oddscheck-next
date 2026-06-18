import * as Sentry from "@sentry/nextjs";

// Client-side error reporting. Inert unless NEXT_PUBLIC_SENTRY_DSN is set.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// Lets Sentry tie client navigations to traces (no-op when uninitialised).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
