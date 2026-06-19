"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Crest from "./Crest";
import useSocket from "@/hooks/useSocket";
import useFlashOnChange from "@/hooks/useFlashOnChange";
import { SOCKET_URL, getSocketSportEvent, flattenSocketLeagues, mergeMatch } from "@/lib/socket";
import { oddsTriple, statusOf, score, kickoffTime } from "@/lib/format";
import { OddsValue } from "./OddsFormatProvider";
import LiveClock from "./LiveClock";

// Highlight applied to every in-play card.
const LIVE_CARD = {
  padding: 20,
  border: "1px solid rgba(255,142,0,0.45)",
  boxShadow: "0 0 0 1px rgba(255,142,0,0.12), 0 0 26px rgba(255,142,0,0.10)",
};

// Match-feed sports that have a live socket event (Tier 1).
const MATCH_SPORTS = [
  { key: "football", label: "Football" },
  { key: "tennis", label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "cricket", label: "Cricket" },
];
const PILL_LABELS = {
  football: "Football", tennis: "Tennis", basketball: "Basketball", cricket: "Cricket",
  baseball: "Baseball", racing: "Horse Racing", golf: "Golf",
};

// Sports refreshed by the REST poll. Superset of the socket sports — baseball has
// no live socket event, so the poll is its only live updater.
const POLL_SPORTS = [...MATCH_SPORTS, { key: "baseball", label: "Baseball" }];

// Merge a fresh batch of a sport's matches into the live board (shared by the
// socket push AND the REST poll): update existing live cards, drop any that are
// no longer live, and add newly-live matches. `incoming` may include non-live
// matches (the REST feed returns all of them) — statusOf() decides what stays.
function mergeSportInto(prev, sportKey, sportLabel, incoming) {
  if (!incoming?.length) return prev;
  const byId = new Map(incoming.map((m) => [String(m.id), m]));
  // 1) merge updates into existing cards for this sport
  let next = prev.map((it) =>
    it.kind === "match" && it.sport === sportKey && byId.has(String(it.id))
      ? { ...mergeMatch(it, byId.get(String(it.id))), kind: "match", sport: sportKey, sportLabel: it.sportLabel || sportLabel }
      : it
  );
  // 2) drop ones that are no longer live (finished/postponed/etc.)
  next = next.filter((it) => !(it.kind === "match" && it.sport === sportKey && byId.has(String(it.id)) && statusOf(it) !== "live"));
  // 3) add newly-live matches not already shown
  const present = new Set(next.filter((it) => it.kind === "match" && it.sport === sportKey).map((it) => String(it.id)));
  incoming.forEach((m) => {
    if (!present.has(String(m.id)) && statusOf(m) === "live") {
      next = [...next, { ...m, kind: "match", sport: sportKey, sportLabel, league: m.league || m.tournament_name || sportLabel }];
    }
  });
  return next;
}

function parColor(p) {
  if (typeof p === "string" && p.startsWith("-")) return "var(--accent)";
  if (typeof p === "string" && p.startsWith("+")) return "var(--down)";
  return "var(--text)";
}

function LiveMatchCard({ m }) {
  const flash = useFlashOnChange(m._updatedAt);
  const c = m.competitors || {};
  const t = oddsTriple(m);
  const sc = score(m);
  const twoWay = t?.twoWay;
  const cells = twoWay
    ? [{ sym: "1", price: t?.home }, { sym: "2", price: t?.away }]
    : [{ sym: "1", price: t?.home }, { sym: "X", price: t?.draw }, { sym: "2", price: t?.away }];
  return (
    <article className={`card${flash ? " match-flash" : ""}`} style={LIVE_CARD}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="chip chip-live" style={{ fontSize: 10 }}><LiveClock match={m} /></span>
          <span className="chip chip-muted">{m.sportLabel}</span>
        </div>
        <span className="mute" style={{ fontSize: 11 }}>{m.league}</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Crest name={c.htn} id={c.htid} sport={m.sport} /><span style={{ fontSize: 14, fontWeight: 600 }}>{c.htn}</span></div>
        <span className="num score" style={{ fontWeight: 700 }}>{sc.home || "0"}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Crest name={c.atn} id={c.atid} sport={m.sport} /><span style={{ fontSize: 14, fontWeight: 600 }}>{c.atn}</span></div>
        <span className="num score" style={{ fontWeight: 700 }}>{sc.away || "0"}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: twoWay ? "1fr 1fr" : "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        {cells.map((x) => {
          const has = typeof x.price === "number";
          const isBest = false; // favourite/best highlight removed — not a backend value (re-enable when the feed flags a best price)
          return (
            <button key={x.sym} className={`odds-cell${isBest ? " best" : ""}`}>
              <span className="meta">{x.sym}</span>
              <span className="price">{has ? <OddsValue value={x.price} /> : "—"}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center mute" style={{ fontSize: 11 }}>
        <span className="flex items-center gap-1"><span className="live-dot" /> Markets open</span>
        <Link href={`/event/${m.sport}/${m.id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>All markets →</Link>
      </div>
    </article>
  );
}

function LiveRaceCard({ r }) {
  return (
    <article className="card" style={LIVE_CARD}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2"><span className="chip chip-live" style={{ fontSize: 10 }}>LIVE</span><span className="chip chip-muted">Horse Racing</span></div>
        <span className="mute" style={{ fontSize: 11 }}>{kickoffTime(r.st)}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{r.course}</div>
      <div className="mute" style={{ fontSize: 13, marginBottom: 14 }}>{r.nm}</div>
      <div className="flex gap-3 mb-4" style={{ fontSize: 12, color: "var(--text-2)" }}>
        {r.dis && <span>{r.dis}</span>}{r.nor && <span>{r.nor} runners</span>}
      </div>
      <div className="flex justify-between items-center mute" style={{ fontSize: 11 }}>
        <span className="flex items-center gap-1"><span className="live-dot" /> Off &amp; running</span>
        <Link href={`/race?id=${r.id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>Racecard →</Link>
      </div>
    </article>
  );
}

function LiveGolfCard({ t }) {
  const leader = (t.matches || []).find((p) => p.pos === "1") || (t.matches || [])[0];
  return (
    <article className="card" style={LIVE_CARD}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2"><span className="chip chip-live" style={{ fontSize: 10 }}>LIVE</span><span className="chip chip-muted">Golf</span></div>
        <span className="mute" style={{ fontSize: 11 }}>Round in play</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{t.nm}</div>
      {leader && (
        <div className="flex justify-between items-center mb-4" style={{ fontSize: 13 }}>
          <span className="mute">Leader</span>
          <span><b>{leader.nm}</b> <span className="num" style={{ color: parColor(leader.par), fontWeight: 700 }}>{leader.par}</span></span>
        </div>
      )}
      <div className="flex justify-between items-center mute" style={{ fontSize: 11 }}>
        <span className="flex items-center gap-1"><span className="live-dot" /> {(t.matches || []).length} players</span>
        <Link href="/golf" style={{ color: "var(--accent)", fontWeight: 600 }}>Leaderboard →</Link>
      </div>
    </article>
  );
}

export default function LiveBoard({ initialItems = [] }) {
  const socket = useSocket(SOCKET_URL);
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("all"); // selected sport tab

  // Socket push (instant) — Tier 1 per sport. Merges into the live board.
  useEffect(() => {
    if (!socket) return;
    const channel = socket.channel("IPUB");
    const subs = [];
    MATCH_SPORTS.forEach((s) => {
      const ev = getSocketSportEvent(s.key);
      if (!ev) return;
      const handler = (e) => {
        const incoming = flattenSocketLeagues(e?.data);
        if (!incoming.length) return;
        setItems((prev) => mergeSportInto(prev, s.key, s.label, incoming));
      };
      channel.listen(ev, handler);
      subs.push([ev, handler]);
    });
    // Unsubscribe our listeners only — never disconnect the shared socket.
    return () => subs.forEach(([ev, h]) => channel.stopListening(ev, h));
  }, [socket]);

  // REST poll (reliable) — the socket may not carry every match (different
  // backend ID space), and a sport can time out on the initial server render.
  // Polling /api/matches every 20s re-syncs scores/minutes, drops finished
  // matches, and pulls in any live match the snapshot/socket missed — so the
  // live list converges to the true set instead of a random snapshot.
  useEffect(() => {
    let stop = false;
    let timer;
    const poll = async () => {
      for (const s of POLL_SPORTS) {
        if (stop) return;
        try {
          const res = await fetch(`/api/matches?sport=${s.key}`, { cache: "no-store" });
          if (!res.ok) continue;
          const { matches } = await res.json();
          if (!stop && Array.isArray(matches)) setItems((prev) => mergeSportInto(prev, s.key, s.label, matches));
        } catch { /* transient — next tick retries */ }
      }
      // Schedule the NEXT poll only after this one finishes, so a slow CMS cycle
      // can't overlap/stack up.
      if (!stop) timer = setTimeout(poll, 20000);
    };
    poll();
    return () => { stop = true; clearTimeout(timer); };
  }, []);

  const itemKey = (it) => (it.kind === "race" ? "racing" : it.kind === "golf" ? "golf" : it.sport);
  const counts = {};
  items.forEach((it) => {
    const key = itemKey(it);
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = items.length;
  const PILLS = [...MATCH_SPORTS.map((s) => s.key), "baseball", "racing", "golf"];
  const shown = filter === "all" ? items : items.filter((it) => itemKey(it) === filter);

  return (
    <>
      <div className="tab-pills-scroll mb-4">
        <button type="button" className={`tab-pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
          All sports <span style={{ fontSize: 11, opacity: 0.7 }}>{total}</span>
        </button>
        {PILLS.map((k) => (
          <button key={k} type="button" className={`tab-pill${filter === k ? " active" : ""}`} disabled={!counts[k]} onClick={() => setFilter(k)}>
            {PILL_LABELS[k]} <span style={{ fontSize: 11, opacity: 0.7 }}>{counts[k] || 0}</span>
          </button>
        ))}
      </div>

      {shown.length ? (
        <div className="grid grid-3">
          {shown.map((it) =>
            it.kind === "race" ? <LiveRaceCard key={`race-${it.id}`} r={it} />
            : it.kind === "golf" ? <LiveGolfCard key={`golf-${it.id}`} t={it} />
            : <LiveMatchCard key={`${it.sport}-${it.id}`} m={it} />
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <span className="chip chip-muted mb-3">Nothing live right now</span>
          <h3 style={{ fontSize: 20, margin: "8px 0" }}>No events in play</h3>
          <p className="sub" style={{ marginBottom: 20 }}>Live scores appear here automatically the moment a match or race goes in-play.</p>
          <Link className="btn btn-primary btn-lg" href="/football">Browse today&apos;s fixtures</Link>
        </div>
      )}
    </>
  );
}
