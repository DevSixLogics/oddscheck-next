"use client";

import { createContext, useContext } from "react";

// The viewer's IANA timezone, resolved server-side (proxy middleware → cookie)
// and handed to client components so they format match times in the same zone
// the server rendered — no hydration mismatch, no flash. Defaults to "UTC".
const TimeZoneContext = createContext("UTC");

export function TimeZoneProvider({ tz, children }) {
  return <TimeZoneContext.Provider value={tz || "UTC"}>{children}</TimeZoneContext.Provider>;
}

/** The viewer's timezone (IANA string) for use in client components. */
export function useTimeZone() {
  return useContext(TimeZoneContext);
}
