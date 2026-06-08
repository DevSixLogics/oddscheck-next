import Link from "next/link";
import Crest from "./Crest";
import { oddsTriple, statusOf, statusLabel, kickoffTime, kickoffDate } from "@/lib/format";
import { OddsValue } from "./OddsFormatProvider";

function pickFeatured(matches) {
  const withOdds = matches.filter((m) => oddsTriple(m));
  return (
    withOdds.find((m) => statusOf(m) === "upcoming") ||
    withOdds.find((m) => statusOf(m) === "live") ||
    withOdds[0] ||
    matches[0] ||
    null
  );
}

/**
 * "Featured event" — DATA-DRIVEN: picks a top match that has a 1·X·2 market and
 * shows it like the reference (crests, vs, three outcome tiles, favourite = FAV).
 * Form pills and bookmaker names aren't in the list feed, so they're omitted.
 */
export default function FeaturedEvent({ matches }) {
  const m = pickFeatured(matches);
  if (!m) return null;

  const c = m.competitors || {};
  const t = oddsTriple(m);
  const bucket = statusOf(m);
  const tiles = t
    ? [
        { label: c.htn, price: t.home },
        { label: "Draw", price: t.draw },
        { label: c.atn, price: t.away },
      ]
    : [];
  const prices = tiles.map((x) => x.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Match of the day</div>
            <h2>Featured event</h2>
          </div>
          <Link className="btn btn-outline btn-sm" href={`/event?id=${m.id}`}>Full breakdown →</Link>
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
              <div className="flex items-center gap-3" style={{ fontSize: 13, color: "var(--text-dim)" }}>
                {bucket === "live" ? (
                  <>
                    <span className="live-dot" /> {statusLabel(m)}
                  </>
                ) : bucket === "finished" ? (
                  <span>Finished · {m.cfs || m.ft}</span>
                ) : (
                  <span>{kickoffDate(m.dt)} · {kickoffTime(m.dt)}</span>
                )}
              </div>
            </div>

            <div
              className="event-head-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24, marginTop: 28, position: "relative" }}
            >
              <div className="flex items-center gap-4" style={{ justifyContent: "flex-end" }}>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ fontSize: 30 }}>{c.htn}</h3>
                </div>
                <Crest name={c.htn} id={c.htid} size="xl" />
              </div>
              <div className="event-head-vs" style={{ textAlign: "center" }}>
                <div className="num" style={{ fontSize: 48, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "-0.04em" }}>
                  {bucket !== "upcoming" && (m.cfs || m.ft) ? (m.cfs || m.ft) : "vs"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4, letterSpacing: "0.08em" }}>
                  {kickoffDate(m.dt)} · {kickoffTime(m.dt)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Crest name={c.atn} id={c.atid} size="xl" />
                <div>
                  <h3 style={{ fontSize: 30 }}>{c.atn}</h3>
                </div>
              </div>
            </div>
          </div>

          {tiles.length ? (
            <div className="grid grid-3" style={{ padding: 28, gap: 14 }}>
              {tiles.map((tile) => {
                const isFav = typeof tile.price === "number" && tile.price === fav;
                return (
                  <div
                    key={tile.label}
                    className="card-flat"
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
            <Link className="btn btn-primary btn-block btn-lg" href={`/event?id=${m.id}`}>
              View full comparison →
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
