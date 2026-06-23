"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Crest from "./Crest";
import Flag from "./Flag";
import useSocket from "@/hooks/useSocket";
import useFlashOnChange from "@/hooks/useFlashOnChange";
import { SOCKET_URL, getSocketSportEvent, flattenSocketLeagues, mergeMatch } from "@/lib/socket";
import { oddsTriple, oddsLineCount, statusOf, statusLabel, kickoffLabel, score, formatOdds } from "@/lib/format";
import { useTimeZone } from "@/components/TimeZoneProvider";
import styles from "./TodaysTopOdds.module.scss";

// This section has its OWN odds-format control (the Decimal/Fractional/American
// tabs) — local only, so it doesn't change odds elsewhere on the site.
const FORMATS = ["Decimal", "Fractional", "American"];

// Sport icons (same set as the reference subnav).
const ic = (paths) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">{paths}</svg>
);
const SPORT_ICONS = {
  football: ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="m12 5 4 3-1.5 5h-5L8 8l4-3Zm0 0v-2m4.5 10 4 1m-13-1-4 1m6 6-2 2m6-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></>),
  tennis: ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3.5 9c5 1 11 1 17 0M3.5 15c5-1 11-1 17 0" stroke="currentColor" strokeWidth="1.4" /></>),
  basketball: ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3 12h18M12 3v18M5 5c3 3 4 11 0 14m14-14c-3 3-4 11 0 14" stroke="currentColor" strokeWidth="1.2" /></>),
  cricket: ic(<><path d="m4 20 8-8 6-6-3-3-6 6-8 8 3 3Zm10-10 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" /></>),
  racing: ic(<path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />),
  baseball: ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M6 6c3 3 3 9 0 12M18 6c-3 3-3 9 0 12" stroke="currentColor" strokeWidth="1.2" /></>),
  golf: ic(<><path d="M10 4v12M10 4l6 2-6 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><ellipse cx="10" cy="19" rx="6" ry="2" stroke="currentColor" strokeWidth="1.4" /></>),
};

function Row({ match, sport, fmt }) {
  const updated = useFlashOnChange(match._updatedAt);
  const tz = useTimeZone();
  const c = match.competitors || {};
  const bucket = statusOf(match);
  // Finished matches keep stale pre-match odds in the feed — never show them.
  const t = bucket === "finished" ? null : oddsTriple(match);
  const twoWay = t?.twoWay;
  const cells = twoWay
    ? [{ sym: "1", price: t?.home }, { sym: "2", price: t?.away }]
    : [{ sym: "1", price: t?.home }, { sym: "X", price: t?.draw }, { sym: "2", price: t?.away }];
  const sc = score(match);
  // Total odds lines available (across all markets) — matches the detail page.
  // Finished matches carry stale odds we don't show, so report none for them.
  const books = bucket === "finished" ? 0 : oddsLineCount(match);

  return (
    <div className={`${styles.row}${updated ? " match-flash" : ""}`}>
      <div className={styles.teams}>
        <div className={styles.crests}>
          <Crest name={c.htn} id={c.htid} sport={sport} />
          <Crest name={c.atn} id={c.atid} sport={sport} />
        </div>
        <div className={styles.names}>
          <div>{c.htn}</div>
          <div>{c.atn}</div>
        </div>
        {bucket !== "upcoming" && sc.raw && <span className={styles.score}>{sc.home}–{sc.away}</span>}
      </div>

      <div className={styles.meta}>
        <div className="flex items-center gap-2"><Flag fid={match.fid} sport={sport} size={14} />{match.league}</div>
        <div className={styles.status}>
          {bucket === "live" ? (
            <><span className="live-dot" /> <span className={styles.live}>{statusLabel(match, tz)}</span></>
          ) : bucket === "finished" ? <span>FT</span> : <span>{kickoffLabel(match.dt, tz)}</span>}
        </div>
      </div>

      <div className={styles.odds} style={twoWay ? { gridTemplateColumns: "1fr 1fr" } : undefined}>
        {cells.map((x) => {
          const has = typeof x.price === "number";
          const isBest = false; // favourite/best highlight removed — not a backend value (re-enable when the feed flags a best price)
          return (
            <button type="button" key={x.sym} className={`odds-cell${isBest ? " best" : ""}`}>
              <span className="meta">{x.sym}</span>
              <span className="price">{has ? formatOdds(x.price, fmt) : "—"}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.action} style={{ flexDirection: "column", gap: 6, alignItems: "center", justifyContent: "center" }}>
        <Link className="btn btn-primary btn-sm" href={`/event/${sport}/${match.id}`}>Compare</Link>
        {books > 0 && (
          <Link href={`/event/${sport}/${match.id}`} className="mute" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
            {books} odds
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Homepage "Today's top odds" — sport pills switch the table BELOW in-place
 * (no navigation). The top subnav tabs are what navigate to a sport page.
 * `sports` = [{ key, label, href, matches }] — only the odds match-feed sports
 * (football, tennis, basketball, cricket, baseball). Racing & golf carry no odds
 * and are not shown on this odds-comparison site.
 */
export default function TodaysTopOdds({ sports = [], limit = 8 }) {
  const [fmt, setFmt] = useState("Decimal");
  const [active, setActive] = useState(sports[0]?.key);
  const [sportsState, setSportsState] = useState(sports);

  // Live-merge in-play score/odds updates over the socket (Tier 1, per sport).
  const socket = useSocket(SOCKET_URL);
  useEffect(() => {
    if (!socket) return;
    const channel = socket.channel("IPUB");
    const subs = [];
    ["football", "tennis", "basketball", "cricket"].forEach((key) => {
      const ev = getSocketSportEvent(key);
      if (!ev) return;
      const handler = (e) => {
        const incoming = flattenSocketLeagues(e?.data);
        if (!incoming.length) return;
        const byId = new Map(incoming.map((m) => [String(m.id), m]));
        setSportsState((prev) =>
          prev.map((s) =>
            s.key !== key ? s : { ...s, matches: (s.matches || []).map((m) => (byId.has(String(m.id)) ? mergeMatch(m, byId.get(String(m.id))) : m)) }
          )
        );
      };
      channel.listen(ev, handler);
      subs.push([ev, handler]);
    });
    return () => subs.forEach(([ev, h]) => channel.stopListening(ev, h));
  }, [socket]);

  // The socket broadcasts a different backend's match IDs, so it can't refresh
  // these matches. The REST feed DOES update (it just lags), so poll it for the
  // active match sport every 30s and replace that sport's matches with fresh data.
  useEffect(() => {
    if (!["football", "tennis", "basketball", "cricket"].includes(active)) return;
    let stop = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/matches?sport=${active}`, { cache: "no-store" });
        if (!res.ok) return;
        const { matches: fresh } = await res.json();
        if (stop || !Array.isArray(fresh) || !fresh.length) return;
        setSportsState((prev) => prev.map((s) => (s.key === active ? { ...s, matches: fresh } : s)));
      } catch {}
    };
    const id = setInterval(poll, 30000);
    poll();
    return () => { stop = true; clearInterval(id); };
  }, [active]);

  const current = sportsState.find((s) => s.key === active) || sportsState[0];
  const matches = current?.matches || [];
  const count = matches.length;

  // Only matches that are upcoming/live AND carry odds — finished matches and
  // matches without a 1·X·2 price are not shown (live first).
  const priced = matches.filter((m) => statusOf(m) !== "finished" && !!oddsTriple(m));
  const liveP = priced.filter((m) => statusOf(m) === "live");
  const ordered = [...liveP, ...priced.filter((m) => statusOf(m) !== "live")].slice(0, limit);

  return (
    <section className="section" style={{ background: "linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Live now</div>
            <h2>Today&apos;s top odds</h2>
            <p className="sub">Best price across 14+ bookmakers, refreshed every second.</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="tabs">
              {FORMATS.map((f) => (
                <button key={f} type="button" className={`tab${fmt === f ? " active" : ""}`} onClick={() => setFmt(f)} style={{ background: "none", border: 0, cursor: "pointer", font: "inherit" }}>{f}</button>
              ))}
            </div>
            {current && <Link className="btn btn-outline btn-sm" href={current.href}>All {current.label} →</Link>}
          </div>
        </div>

        {/* Sport pills — buttons that switch the table below (do NOT navigate) */}
        <div className="tab-pills-scroll mb-4">
          {sportsState.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`tab-pill${s.key === active ? " active" : ""}`}
              onClick={() => setActive(s.key)}
              aria-pressed={s.key === active}
            >
              {SPORT_ICONS[s.key]}
              {s.label} <span style={{ fontSize: 11, opacity: 0.7 }}>{(s.matches || []).length}</span>
            </button>
          ))}
        </div>

        <div className="card table-scroll" style={{ padding: 0, overflow: "hidden" }}>
          <div className={styles.headRow}>
            <div>Event</div>
            <div>Competition · Time</div>
            <div>Best odds · 1 / X / 2</div>
            <div />
          </div>
          <div className={styles.scroll}>
            {ordered.length ? (
              ordered.map((m) => <Row key={m.id} match={m} sport={current.key} fmt={fmt} />)
            ) : (
              <div style={{ padding: 18, color: "var(--text-dim)", fontSize: 13 }}>
                No odds available for {current?.label} right now — there&apos;s no data to show.
              </div>
            )}
          </div>
        </div>

        {current && (
          <div className="flex justify-between items-center mt-4 flex-wrap gap-3" style={{ fontSize: 13, color: "var(--text-dim)" }}>
            <div className="flex gap-4 flex-wrap">
              <span>Each price is the best across all bookmakers</span>
              <span className="flex items-center gap-2"><span className="live-dot" /> Live</span>
            </div>
            <Link href={current.href} style={{ color: "var(--accent)", fontWeight: 600 }}>
              See all {count} {current.label} matches →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
