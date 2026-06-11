"use client";

import { useEffect, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { SOCKET_URL, getSocketSportEvent, flattenSocketLeagues } from "@/lib/socket";
import { score, statusOf } from "@/lib/format";

function playOnce(a) {
  if (!a) return;
  try { a.currentTime = 0; a.play().catch(() => {}); } catch {}
}

/**
 * Global live-audio alerts driven by the football socket:
 *  - a GOAL (score increases)         → /goal.mp3
 *  - any other notable event          → /crowd-cheers.mp3
 *    (kickoff, full-time / status change, or a red card — NOT goals)
 * The first push per match only sets a baseline, so nothing fires on load.
 */
export default function GoalAlerts() {
  const socket = useSocket(SOCKET_URL);
  const prev = useRef(new Map()); // id -> { goals, bucket, cards }
  const goalA = useRef(null);
  const cheerA = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const g = new Audio("/goal.mp3"); g.preload = "auto"; goalA.current = g;
    const c = new Audio("/crowd-cheers.mp3"); c.preload = "auto"; cheerA.current = c;
    // Unlock both clips on the first interaction (browsers block autoplay).
    const unlock = () => {
      [g, c].forEach((a) => a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {}));
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const channel = socket.channel("IPUB");
    const eventName = getSocketSportEvent("football"); // FootballLiveMatches
    const handler = (e) => {
      const matches = flattenSocketLeagues(e?.data);
      let goal = false;
      let event = false;
      for (const m of matches) {
        const sc = score(m);
        const h = parseInt(sc.home, 10);
        const a = parseInt(sc.away, 10);
        const goals = (Number.isFinite(h) ? h : 0) + (Number.isFinite(a) ? a : 0);
        const bucket = statusOf(m);
        const cards = (Number(m.hrc) || 0) + (Number(m.arc) || 0);
        const key = String(m.id);
        const before = prev.current.get(key);
        if (before) {
          if (Number.isFinite(h) && Number.isFinite(a) && goals > before.goals) {
            goal = true; // a goal — overrides the generic cheer for this match
          } else if (bucket !== before.bucket || cards > before.cards) {
            event = true; // kickoff / full-time / red card
          }
        }
        prev.current.set(key, { goals, bucket, cards });
      }
      if (goal) playOnce(goalA.current);
      if (event) playOnce(cheerA.current);
    };
    channel.listen(eventName, handler);
    return () => channel.stopListening(eventName, handler);
  }, [socket]);

  return null;
}
