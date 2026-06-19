"use client";

import { useEffect, useState } from "react";
import useSocket from "@/hooks/useSocket";
import useFlashOnChange from "@/hooks/useFlashOnChange";
import { SOCKET_URL, mergeMatch } from "@/lib/socket";
import { statusOf, score, kickoffDate, kickoffTime } from "@/lib/format";
import LiveClock from "./LiveClock";

// Sports whose live score/minute can be refreshed from the /api/matches feed.
const POLLABLE = new Set(["football", "tennis", "basketball", "cricket", "baseball"]);

// Tier-2 detail contract per sport (see live-match-socket skill).
const DETAIL = {
  football: { channel: "IPUB", event: () => "FootballLiveMatches", kind: "league" },
  cricket: { channel: "CricketMatch", event: (id) => `CricketMatchDetails-${id}`, kind: "single" },
  tennis: { channel: "TennisMatch", event: (id) => `TennisDetails-${id}`, kind: "tennis" },
  basketball: { channel: "BasketballMatch", event: (id) => `BasketballMatchDetails-${id}`, kind: "single" },
};

/** Live header score + status for a single match, fed by the socket. */
export default function EventScore({ sport, id, match }) {
  const socket = useSocket(SOCKET_URL);
  const [m, setM] = useState(match);

  useEffect(() => {
    if (!socket) return;
    const cfg = DETAIL[sport];
    if (!cfg) return; // sport has no live socket
    const channel = socket.channel(cfg.channel);
    const eventName = cfg.event(id);
    const handler = (e) => {
      let incoming = null;
      if (cfg.kind === "league") {
        for (const lg of e?.data || []) {
          if (String(lg.id) !== String(m.tournament_id ?? m.tournament?.id)) continue;
          incoming = (lg.matches || []).find((x) => String(x.id) === String(id));
          if (incoming) break;
        }
      } else if (cfg.kind === "tennis") {
        incoming = e?.data?.detail;
      } else {
        incoming = e?.data && String(e.data.id) === String(id) ? e.data : null;
      }
      if (incoming) setM((prev) => mergeMatch(prev, incoming));
    };
    channel.listen(eventName, handler);
    return () => channel.stopListening(eventName, handler); // unsubscribe only
  }, [socket, sport, id, m.tournament_id]);

  // REST-poll fallback — the socket may not carry this match (smaller leagues,
  // different ID space). Poll the sport's live feed every 20s, find this match by
  // id, and merge its fresh score/status/minute into the header. Only the header
  // state `m` is touched; the page's odds/H2H come from the server prop, untouched.
  useEffect(() => {
    if (!POLLABLE.has(sport)) return;
    let stop = false;
    let timer;
    const poll = async () => {
      try {
        const res = await fetch(`/api/matches?sport=${sport}`, { cache: "no-store" });
        if (res.ok) {
          const { matches } = await res.json();
          const fresh = Array.isArray(matches) && matches.find((x) => String(x.id) === String(id));
          if (!stop && fresh) setM((prev) => mergeMatch(prev, fresh));
        }
      } catch { /* transient — next tick retries */ }
      if (!stop) timer = setTimeout(poll, 20000);
    };
    poll();
    return () => { stop = true; clearTimeout(timer); };
  }, [sport, id]);

  const bucket = statusOf(m);
  const sc = score(m);
  const updated = useFlashOnChange(m._updatedAt);

  return (
    <div className="event-head-vs" style={{ textAlign: "center", padding: "0 16px" }}>
      {bucket === "live" ? (
        <div className="chip chip-live mb-3"><LiveClock match={m} /></div>
      ) : bucket === "finished" ? (
        <div className="chip chip-muted mb-3">Full time</div>
      ) : (
        <div className="chip chip-best mb-3"><span className="live-dot" style={{ background: "var(--accent)" }} /> {kickoffDate(m.dt || m.gdt)} · {kickoffTime(m.dt || m.gdt)}</div>
      )}
      <div className={`num${updated ? " match-flash" : ""}`} style={{ fontSize: 52, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "-0.04em", lineHeight: 1, borderRadius: 12 }}>
        {bucket !== "upcoming" && sc.raw ? `${sc.home}–${sc.away}` : "vs"}
      </div>
      <div className="flex gap-2 mt-3" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <span className="chip chip-muted">{[m.tournament?.cat, m.tournament?.nm].filter(Boolean).join(" · ") || m.league}{m.ro ? ` · ${m.ro}` : ""}</span>
      </div>
    </div>
  );
}
