"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns true briefly whenever `signal` changes (skipping the initial mount),
 * so a component can add a highlight class and then revert to its normal design.
 * Each new change re-triggers it. `signal` is typically a match's `_updatedAt`
 * stamp set by mergeMatch when a live update materially changes the match.
 */
export default function useFlashOnChange(signal, duration = 2500) {
  const [on, setOn] = useState(false);
  const seen = useRef(signal);

  useEffect(() => {
    if (signal === seen.current) return; // unchanged (also covers the initial mount)
    seen.current = signal;
    if (signal == null) return;          // nothing meaningful to flash yet
    // Reacting to an external live-data change (the match's _updatedAt) to run a
    // brief, self-clearing highlight is exactly what this effect is for; the
    // follow-up setOn(false) is deferred via the timeout below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(true);
    const t = setTimeout(() => setOn(false), duration);
    return () => clearTimeout(t);
  }, [signal, duration]);

  return on;
}
