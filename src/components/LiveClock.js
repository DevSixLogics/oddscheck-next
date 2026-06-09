"use client";

import { useEffect, useRef, useState } from "react";
import { statusLabel } from "@/lib/format";

// Paused / non-running states where a climbing minute would be wrong.
function isPaused(match) {
  const sun = String(match.sun || "").toLowerCase();
  const mins = String(match.mins || "").toLowerCase();
  return /half[\s-]?time|\bht\b|break|interval|paused|finished|full/.test(sun) || /ht|ht'|fin/.test(mins);
}

/**
 * Running match clock. Seeds from the feed's `mins` (e.g. "67'") and ticks it up
 * ~every 15s, re-syncing whenever a fresh `mins` arrives. Falls back to the plain
 * status label (HT, LIVE, set scores…) when there's no numeric minute to count.
 */
export default function LiveClock({ match }) {
  const running = !isPaused(match) && /\d/.test(String(match.mins || "")) && /half|live|playing|\d/.test(String(match.sun || "").toLowerCase());
  const seed = parseInt(String(match.mins || "").replace(/[^\d]/g, ""), 10);
  const ref = useRef({ base: running && Number.isFinite(seed) ? seed : null, at: Date.now() });
  const [min, setMin] = useState(ref.current.base);

  useEffect(() => {
    const ok = running && Number.isFinite(seed);
    ref.current = { base: ok ? seed : null, at: Date.now() };
    setMin(ok ? seed : null);
  }, [match.mins, match.sun, running, seed]);

  useEffect(() => {
    if (ref.current.base == null) return;
    const id = setInterval(() => {
      const { base, at } = ref.current;
      if (base == null) return;
      setMin(base + Math.floor((Date.now() - at) / 60000));
    }, 15000);
    return () => clearInterval(id);
  }, [match.mins, match.sun]);

  if (isPaused(match)) return <>{statusLabel(match) || "HT"}</>;
  if (min == null) return <>{statusLabel(match)}</>;
  return <>{min}&apos;</>;
}
