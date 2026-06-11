"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Crest from "./Crest";
import useSocket from "@/hooks/useSocket";
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

function parColor(p) {
  if (typeof p === "string" && p.startsWith("-")) return "var(--accent)";
  if (typeof p === "string" && p.startsWith("+")) return "var(--down)";
  return "var(--text)";
}

function LiveMatchCard({ m }) {
  const c = m.competitors || {};
  const t = oddsTriple(m);
  const sc = score(m);
  const twoWay = t?.twoWay;
  const cells = twoWay
    ? [{ sym: "1", price: t?.home }, { sym: "2", price: t?.away }]
    : [{ sym: "1", price: t?.home }, { sym: "X", price: t?.draw }, { sym: "2", price: t?.away }];
  const prices = cells.map((x) => x.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null;
  return (
    <article className="card" style={LIVE_CARD}>
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
          return (
            <button key={x.sym} className={`odds-cell${has && x.price === fav ? " best" : ""}`}>
              <span className="meta">{x.sym}</span>
              <span className="price">{has ? <OddsValue value={x.price} /> : "—"}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center mute" style={{ fontSize: 11 }}>
        <span className="flex items-center gap-1"><span className="live-dot" /> Markets open</span>
        <Link href={`/event?sport=${m.sport}&id=${m.id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>All markets →</Link>
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
        setItems((prev) => {
          const byId = new Map(incoming.map((m) => [String(m.id), m]));
          // 1) merge updates into existing live cards for this sport
          let next = prev.map((it) =>
            it.kind === "match" && it.sport === s.key && byId.has(String(it.id))
              ? { ...mergeMatch(it, byId.get(String(it.id))), kind: "match", sport: s.key, sportLabel: it.sportLabel }
              : it
          );
          // 2) drop ones that just went non-live
          next = next.filter((it) => !(it.kind === "match" && it.sport === s.key && byId.has(String(it.id)) && statusOf(it) !== "live"));
          // 3) add newly-live matches not already shown
          const present = new Set(next.filter((it) => it.kind === "match" && it.sport === s.key).map((it) => String(it.id)));
          incoming.forEach((m) => {
            if (!present.has(String(m.id)) && statusOf(m) === "live") {
              next = [...next, { ...m, kind: "match", sport: s.key, sportLabel: s.label, league: m.league || m.tournament_name || s.label }];
            }
          });
          return next;
        });
      };
      channel.listen(ev, handler);
      subs.push([ev, handler]);
    });
    // Unsubscribe our listeners only — never disconnect the shared socket.
    return () => subs.forEach(([ev, h]) => channel.stopListening(ev, h));
  }, [socket]);

  const counts = {};
  items.forEach((it) => {
    const key = it.kind === "race" ? "racing" : it.kind === "golf" ? "golf" : it.sport;
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = items.length;
  const PILLS = [...MATCH_SPORTS.map((s) => s.key), "baseball", "racing", "golf"];

  return (
    <>
      <div className="tab-pills-scroll mb-4">
        <button className="tab-pill active">All sports <span style={{ fontSize: 11, opacity: 0.7 }}>{total}</span></button>
        {PILLS.map((k) => (
          <button key={k} className="tab-pill" disabled={!counts[k]}>
            {PILL_LABELS[k]} <span style={{ fontSize: 11, opacity: 0.7 }}>{counts[k] || 0}</span>
          </button>
        ))}
      </div>

      {total ? (
        <div className="grid grid-3">
          {items.map((it) =>
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
