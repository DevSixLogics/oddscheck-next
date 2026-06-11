"use client";

import { useEffect } from "react";

// Debug helper: logs serializable data to the BROWSER console (server components
// can't do this — their console.log goes to the server terminal).
export default function ConsoleLog({ label = "debug", data }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`[${label}]`, data);
  }, [label, data]);
  return null;
}
