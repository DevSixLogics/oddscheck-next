"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Crest from "./Crest";
import LiveClock from "./LiveClock";
import { oddsTriple, statusOf, kickoffTime, kickoffDate, score } from "@/lib/format";
import { OddsValue } from "./OddsFormatProvider";
import { useTimeZone } from "./TimeZoneProvider";

const isTop = (m) => m.is_top === 1 || m.is_top === true;
const scoreTotals = (m) => {
  const s = score(m);
  return [parseInt(s.home, 10), parseInt(s.away, 10)];
};

/**
 * Choose the match to headline: prefer a LIVE game (a top-league one if possible),
 * then upcoming, then anything — always favouring matches that carry a 1·X·2 market.
 */
function pickFeatured(matches) {
  const odds = matches.filter((m) => oddsTriple(m));
  const live = odds.filter((m) => statusOf(m) === "live");
  const up = odds.filter((m) => statusOf(m) === "upcoming");
  return (
    live.find(isTop) || live[0] ||
    up.find(isTop) || up[0] ||
    odds[0] || matches[0] || null
  );
}

/**
 * "Featured event" — DATA-DRIVEN and LIVE: headlines a live match when one exists,
 * polls /api/matches to keep its score/minute/odds fresh, runs the match clock, and
 * flashes the team that scores. Football only (1·X·2 tiles).
 */
export default function FeaturedEvent({ matches }) {
  const tz = useTimeZone();
  const [m, setM] = useState(() => pickFeatured(matches));
  const prevScore = useRef(m ? scoreTotals(m) : null);
  const [flash, setFlash] = useState(null); // "home" | "away" | "both"

  function detectGoal(next) {
    const [nh, na] = scoreTotals(next);
    const before = prevScore.current;
    if (before && Number.isFinite(nh) && Number.isFinite(na)) {
      const home = nh > before[0], away = na > before[1];
      if (home || away) {
        setFlash(home && away ? "both" : home ? "home" : "away");
        setTimeout(() => setFlash(null), 6000);
      }
    }
    if (Number.isFinite(nh) && Number.isFinite(na)) prevScore.current = [nh, na];
  }

  // Keep the featured match fresh; the REST feed updates even though the socket's
  // IDs don't match ours. Re-select only if the headline match drops out.
  const id = m?.id;
  useEffect(() => {
    if (!id) return;
    let stop = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/matches?sport=football`, { cache: "no-store" });
        if (!res.ok) return;
        const { matches: fresh } = await res.json();
        if (stop || !Array.isArray(fresh)) return;
        const upd = fresh.find((x) => String(x.id) === String(id));
        if (upd) {
          detectGoal(upd);
          // If the headline match has finished and a live one is available, promote it.
          if (statusOf(upd) === "finished") {
            const liveNext = fresh.filter((x) => oddsTriple(x)).find((x) => statusOf(x) === "live");
            if (liveNext && String(liveNext.id) !== String(id)) {
              prevScore.current = scoreTotals(liveNext);
              setM(liveNext);
              return;
            }
          }
          setM((prev) => ({ ...prev, ...upd, competitors: { ...(prev.competitors || {}), ...(upd.competitors || {}) } }));
        } else {
          const next = pickFeatured(fresh);
          if (next) { prevScore.current = scoreTotals(next); setM(next); }
        }
      } catch {}
    };
    const t = setInterval(poll, 30000);
    poll();
    return () => { stop = true; clearInterval(t); };
  }, [id]);

  if (!m) return null;

  const c = m.competitors || {};
  const t = oddsTriple(m);
  const bucket = statusOf(m);
  const tiles = t
    ? [
        { side: "home", label: c.htn, price: t.home },
        { side: "draw", label: "Draw", price: t.draw },
        { side: "away", label: c.atn, price: t.away },
      ]
    : [];
  const homeScored = flash === "home" || flash === "both";
  const awayScored = flash === "away" || flash === "both";

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Match of the day</div>
            <h2>Featured event</h2>
          </div>
          <Link className="btn btn-outline btn-sm" href={`/event/football/${m.id}`}>Full breakdown →</Link>
        </div>

        <article className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: 32,
              background: "linear-gradient(135deg, #0F1729 0%, #131E3B 50%, #0F1729 100%)",
              borderBottom: "1px solid var(--border)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ position: "relative" }}>
              <div className="flex gap-2">
                <span className="chip chip-gold">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M12 2c1 4 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-2-4 1-7Z" />
                  </svg>
                  Match of the day
                </span>
                <span className="chip chip-muted">{m.league}{m.ro ? ` · ${m.ro}` : ""}</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: "var(--text-dim)" }}>
                {bucket === "live" ? (
                  <span className="chip chip-live" style={{ fontSize: 10 }}><LiveClock match={m} /></span>
                ) : bucket === "finished" ? (
                  <span>Finished · {m.cfs || m.ft}</span>
                ) : (
                  <span>{kickoffDate(m.dt, tz)} · {kickoffTime(m.dt, tz)}</span>
                )}
              </div>
            </div>

            <div
              className="event-head-grid"
              style={{ marginTop: 28, position: "relative" }}
            >
              <div className="flex items-center gap-4" style={{ justifyContent: "flex-end" }}>
                <div style={{ textAlign: "right" }}>
                  <h3 className={homeScored ? "goal-flash" : undefined} style={{ fontSize: 30 }}>{c.htn}{homeScored && <span className="goal-tag">⚽</span>}</h3>
                </div>
                <Crest name={c.htn} id={c.htid} sport="football" size="xl" />
              </div>
              <div className="event-head-vs" style={{ textAlign: "center" }}>
                <div className="num" style={{ fontSize: 48, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "-0.04em" }}>
                  {bucket !== "upcoming" && (m.cfs || m.ft) ? (m.cfs || m.ft) : "vs"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4, letterSpacing: "0.08em" }}>
                  {kickoffDate(m.dt, tz)} · {kickoffTime(m.dt, tz)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Crest name={c.atn} id={c.atid} sport="football" size="xl" />
                <div>
                  <h3 className={awayScored ? "goal-flash" : undefined} style={{ fontSize: 30 }}>{c.atn}{awayScored && <span className="goal-tag">⚽</span>}</h3>
                </div>
              </div>
            </div>
          </div>

          {tiles.length ? (
            <div className="grid grid-3" style={{ padding: 28, gap: 14 }}>
              {tiles.map((tile) => {
                const isFav = false; // best/favourite highlight removed (not a backend value)
                const scored = (tile.side === "home" && homeScored) || (tile.side === "away" && awayScored);
                return (
                  <div
                    key={tile.label}
                    className={`card-flat${scored ? " goal-flash" : ""}`}
                    style={{
                      padding: 18,
                      textAlign: "center",
                      borderColor: isFav ? "rgba(255,142,0,0.45)" : "var(--border)",
                      background: isFav ? "rgba(255,142,0,0.06)" : "var(--surface)",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>{tile.label}</div>
                    <div className="num" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: isFav ? "#FFE3C2" : "var(--text)" }}>
                      {typeof tile.price === "number" ? <OddsValue value={tile.price} /> : "—"}
                    </div>
                    {isFav && (
                      <div className="flex justify-center items-center gap-2 mt-3">
                        <span className="chip chip-best" style={{ fontSize: 10, padding: "2px 6px" }}>FAV</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: 28, color: "var(--text-dim)", fontSize: 13 }}>
              Odds for this match aren&apos;t available yet.
            </div>
          )}

          <div style={{ padding: "0 28px 28px" }}>
            <Link className="btn btn-primary btn-block btn-lg" href={`/event/football/${m.id}`}>
              View full comparison →
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
