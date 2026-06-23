"use client";

import { useEffect, useRef, useState } from "react";
import { statusLabel } from "@/lib/format";
import { useTimeZone } from "./TimeZoneProvider";

const TICK_MS = 15000;
// Bound the staleness we add to a feed value, so a minute captured BEFORE a
// half-time break can't overshoot into the 2nd half.
const FEED_LATENCY_CAP = 5;

// Paused / non-running states where the clock should not advance.
function isPaused(match) {
  const sun = String(match.sun || "").toLowerCase();
  const mins = String(match.mins || "").toLowerCase();
  return /half[\s-]?time|\bht\b|break|interval|paused|finished|full/.test(sun) || /ht|ht'|fin/.test(mins);
}

// How stale the feed's `mins` already was when the response was generated:
// (f_time − sut). Both are feed-side timestamps, so the subtraction is timezone-
// independent (no need to know the feed's zone). Bounded by FEED_LATENCY_CAP so a
// value from before half-time can't run away.
function feedLatencyMin(match) {
  const { sut, f_time: ft } = match;
  if (!sut || !ft) return 0;
  const a = Date.parse(String(sut).replace(" ", "T"));
  const b = Date.parse(String(ft).replace(" ", "T"));
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.min(Math.floor((b - a) / 60000), FEED_LATENCY_CAP);
}

/**
 * Live match minute — computed on the frontend (the API doesn't push a
 * continuously-correct minute). Best-effort accuracy:
 *
 *  1. Anchor = feed/socket `mins` + how stale that value already was
 *     (`f_time − sut`, capped) — closes the feed's own latency.
 *  2. Tick the anchor forward on a timer (real elapsed time).
 *  3. Re-sync only when the feed sends a minute >= what we show (moved forward);
 *     ignore staler/lower values → never jumps backward (no 54↔57 flicker).
 *  4. Freeze at half-time / breaks.
 *
 * Exact for socket-covered leagues (real minute pushed live); for leagues the
 * socket doesn't cover it tracks the freshest REST value + latency compensation,
 * which is the most the frontend can derive without a backend period-start time.
 */
export default function LiveClock({ match }) {
  const tz = useTimeZone();
  const feedMin = parseInt(String(match.mins || "").trim(), 10);
  const running = !isPaused(match) && Number.isFinite(feedMin);
  const base0 = running ? feedMin + feedLatencyMin(match) : NaN;

  const anchor = useRef({ base: null, at: 0 });
  const [shown, setShown] = useState(null);

  useEffect(() => {
    if (!running) {
      anchor.current = { base: null, at: 0 };
      setShown(null);
      return;
    }
    const now = Date.now();
    const ticked =
      anchor.current.base == null
        ? -Infinity
        : anchor.current.base + Math.floor((now - anchor.current.at) / 60000);
    if (base0 >= ticked) {
      anchor.current = { base: base0, at: now };
      setShown(base0);
    }
  }, [base0, running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (anchor.current.base == null) return;
      setShown(anchor.current.base + Math.floor((Date.now() - anchor.current.at) / 60000));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  if (isPaused(match)) return <>{statusLabel(match, tz) || "HT"}</>;
  if (shown == null) return <>{statusLabel(match, tz)}</>;
  return <>{shown}&apos;</>;
}
