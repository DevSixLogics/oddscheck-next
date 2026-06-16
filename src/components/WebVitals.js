"use client";

import { useReportWebVitals } from "next/web-vitals";

// Reports Core Web Vitals (LCP, CLS, INP, FCP, TTFB). Currently logs in dev and
// is the single hook point for an analytics/Sentry sink once a DSN is configured
// (see PRODUCTION-READINESS.md → Observability).
export default function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[web-vitals] ${metric.name}: ${Math.round(metric.value)}`);
    }
    // TODO(observability): forward `metric` to analytics/Sentry when configured.
  });
  return null;
}
