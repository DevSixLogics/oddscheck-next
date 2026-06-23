"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Crest from "./Crest";
import useSocket from "@/hooks/useSocket";
import useFlashOnChange from "@/hooks/useFlashOnChange";
import { SOCKET_URL, getSocketSportEvent, flattenSocketLeagues, mergeMatch } from "@/lib/socket";
import { statusOf, statusLabel, score, kickoffLabel } from "@/lib/format";
import { useTimeZone } from "./TimeZoneProvider";
import styles from "./ScoresResults.module.scss";

const SHOW = 3; // rows per column before "View all"
// Match-feed sports that can appear in Scores & results and have a live socket.
const SOCKET_SPORTS = ["football", "tennis", "basketball", "cricket"];

const goalsFor = (m) => {
  const sc = score(m);
  return [parseInt(sc.home, 10), parseInt(sc.away, 10)];
};

function MatchRow({ match, bucket, flash }) {
  const tz = useTimeZone();
  const updated = useFlashOnChange(match._updatedAt);
  const c = match.competitors || {};
  const sc = score(match);
  const homeScored = flash === "home" || flash === "both";
  const awayScored = flash === "away" || flash === "both";
  return (
    <div className={`${styles.match}${updated ? " match-flash" : ""}`}>
      <div className={styles.teams}>
        <div className={styles.crests}>
          <Crest name={c.htn} id={c.htid} sport={match.sport} />
          <Crest name={c.atn} id={c.atid} sport={match.sport} />
        </div>
        <div className={styles.names}>
          <div className={homeScored ? "goal-flash" : undefined}>{c.htn}{homeScored && <span className="goal-tag">⚽ GOAL</span>}</div>
          <div className={awayScored ? "goal-flash" : undefined}>{c.atn}{awayScored && <span className="goal-tag">⚽ GOAL</span>}</div>
        </div>
      </div>

      {bucket !== "upcoming" && sc.raw ? (
        <div className={styles.score}>
          <div className={homeScored ? "goal-flash" : undefined}>{sc.home}</div>
          <div className={awayScored ? "goal-flash" : undefined}>{sc.away}</div>
        </div>
      ) : null}

      <div className={styles.right} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        {match.sport && (
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-mute)" }}>
            {match.sport === "football" ? "FB" : match.sport.slice(0, 3)}
          </span>
        )}
        {bucket === "live" ? (
          <span className={styles.badge}>{statusLabel(match, tz)}</span>
        ) : bucket === "finished" ? (
          <span className={styles.kickoff}>FT</span>
        ) : (
          <span className={styles.kickoff}>{kickoffLabel(match.dt || match.gdt, tz)}</span>
        )}
      </div>
    </div>
  );
}

function Column({ title, live, matches, href, flashes }) {
  const total = matches.length;
  const shown = Math.min(total, SHOW);
  return (
    <div className={styles.col}>
      <div className={`${styles.head}${live ? " " + styles.live : ""}`}>
        <span className={styles.label}>
          {live && <span className="live-dot" aria-hidden="true" />}
          {title}
        </span>
        <span className={styles.count}>{shown} of {total}</span>
      </div>
      {total ? (
        matches.slice(0, SHOW).map((m) => (
          <MatchRow key={m.id} match={m} bucket={live ? "live" : statusOf(m)} flash={flashes[m.id]} />
        ))
      ) : (
        <div className={styles.empty}>Nothing here right now.</div>
      )}
      {total > SHOW && (
        <div className={styles.foot}>
          <span className="more">+{total - shown} more</span>
          <Link href={href}>View all →</Link>
        </div>
      )}
    </div>
  );
}

export default function ScoresResults({ matches }) {
  const [list, setList] = useState(matches);
  const [flashes, setFlashes] = useState({}); // matchId -> "home" | "away" | "both"
  const prevScore = useRef(new Map()); // matchId -> [home, away]

  // Seed the baseline so the first update never false-flashes on load.
  useEffect(() => {
    matches.forEach((m) => prevScore.current.set(String(m.id), goalsFor(m)));
  }, [matches]);

  // Apply a batch of fresh matches for one sport: merge into the list AND detect
  // which side scored, flashing that team for a few seconds.
  function applyUpdates(incoming, sport) {
    if (!incoming?.length) return;
    const byId = new Map(incoming.map((m) => [String(m.id), m]));
    const newFlashes = {};
    for (const [id, nm] of byId) {
      const before = prevScore.current.get(id);
      const [nh, na] = goalsFor(nm);
      // Goal flash only makes sense for football (cricket runs change every ball).
      if (sport === "football" && before && Number.isFinite(nh) && Number.isFinite(na)) {
        const [oh, oa] = before;
        const home = nh > oh, away = na > oa;
        if (home && away) newFlashes[id] = "both";
        else if (home) newFlashes[id] = "home";
        else if (away) newFlashes[id] = "away";
      }
      if (Number.isFinite(nh) && Number.isFinite(na)) prevScore.current.set(id, [nh, na]);
    }
    setList((prev) => prev.map((m) => (m.sport === sport && byId.has(String(m.id)) ? { ...mergeMatch(m, byId.get(String(m.id))), sport } : m)));
    const ids = Object.keys(newFlashes);
    if (ids.length) {
      setFlashes((f) => ({ ...f, ...newFlashes }));
      ids.forEach((id) => setTimeout(() => setFlashes((f) => { const c = { ...f }; delete c[id]; return c; }), 6000));
    }
  }

  // Socket pushes (Tier 1) — works if the socket carries our match IDs.
  const socket = useSocket(SOCKET_URL);
  useEffect(() => {
    if (!socket) return;
    const channel = socket.channel("IPUB");
    const subs = [];
    SOCKET_SPORTS.forEach((sport) => {
      const ev = getSocketSportEvent(sport);
      if (!ev) return;
      const handler = (e) => applyUpdates(flattenSocketLeagues(e?.data), sport);
      channel.listen(ev, handler);
      subs.push([ev, handler]);
    });
    return () => subs.forEach(([ev, h]) => channel.stopListening(ev, h));
  }, [socket]);

  // REST polling — the reliable updater (the feed updates even if the socket
  // can't reach these matches). Polls only the sports present in the scores.
  useEffect(() => {
    const present = [...new Set(matches.map((m) => m.sport))].filter((s) => SOCKET_SPORTS.includes(s));
    if (!present.length) return;
    let stop = false;
    const poll = async () => {
      for (const sport of present) {
        try {
          const res = await fetch(`/api/matches?sport=${sport}`, { cache: "no-store" });
          if (!res.ok) continue;
          const { matches: fresh } = await res.json();
          if (!stop) applyUpdates(fresh, sport);
        } catch {}
      }
    };
    const id = setInterval(poll, 30000);
    poll();
    return () => { stop = true; clearInterval(id); };
  }, [matches]);

  const { live, upcoming, finished } = useMemo(() => ({
    live: list.filter((m) => statusOf(m) === "live"),
    upcoming: list.filter((m) => statusOf(m) === "upcoming"),
    finished: list.filter((m) => statusOf(m) === "finished"),
  }), [list]);

  return (
    <div className={styles.grid}>
      <Column title="Live" live matches={live} href="/live" flashes={flashes} />
      <Column title="Today's fixtures" matches={upcoming} href="/football" flashes={flashes} />
      <Column title="Finished" matches={finished} href="/live" flashes={flashes} />
    </div>
  );
}
