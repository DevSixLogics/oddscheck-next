"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { formatOdds } from "@/lib/format";

const FORMATS = ["Decimal", "Fractional", "American"];

const OddsFormatContext = createContext({ fmt: "Decimal", setFmt: () => {}, formats: FORMATS });

/** App-wide provider for the selected odds format (persisted to localStorage). */
export function OddsFormatProvider({ children }) {
  const [fmt, setFmt] = useState("Decimal");

  // Restore the saved choice after mount (server always renders Decimal, so no
  // hydration mismatch — the value just updates once on the client).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oddsFmt");
      if (saved && FORMATS.includes(saved)) setFmt(saved);
    } catch {}
  }, []);

  const update = (f) => {
    setFmt(f);
    try { localStorage.setItem("oddsFmt", f); } catch {}
  };

  return (
    <OddsFormatContext.Provider value={{ fmt, setFmt: update, formats: FORMATS }}>
      {children}
    </OddsFormatContext.Provider>
  );
}

export function useOddsFormat() {
  return useContext(OddsFormatContext);
}

/** Renders a decimal odds value in the user's chosen format. */
export function OddsValue({ value }) {
  const { fmt } = useOddsFormat();
  return <>{formatOdds(value, fmt)}</>;
}
