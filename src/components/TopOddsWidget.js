import Link from "next/link";
import Crest from "./Crest";
import { oddsTriple, statusOf, statusLabel, kickoffTime } from "@/lib/format";

function PreviewRow({ match }) {
  const c = match.competitors || {};
  const t = oddsTriple(match);
  const cells = [
    { sym: "1", price: t.home },
    { sym: "X", price: t.draw },
    { sym: "2", price: t.away },
  ];
  const prices = cells.map((x) => x.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null; // shortest price = best/green
  const live = statusOf(match) === "live";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid var(--border-soft)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Crest name={c.htn} id={c.htid} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{c.htn}</span>
          <span className="mute" style={{ fontSize: 12 }}>vs</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{c.atn}</span>
          <Crest name={c.atn} id={c.atid} />
        </div>
        {live ? (
          <span className="chip chip-live" style={{ fontSize: 10 }}>LIVE {statusLabel(match)}</span>
        ) : (
          <span className="mute" style={{ fontSize: 11 }}>{kickoffTime(match.dt)}</span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {cells.map((x) => {
          const has = typeof x.price === "number";
          return (
            <button
              type="button"
              key={x.sym}
              className={`odds-cell${has && x.price === fav ? " best" : ""}`}
            >
              <span className="flex justify-between items-center" style={{ gap: 4 }}>
                <span className="meta">{x.sym}</span>
              </span>
              <span className="price">{has ? x.price.toFixed(2) : "—"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hero "Live odds preview" widget — DATA-DRIVEN, styled to match the original
 * index.html hero-right card. Shows matches that carry a 1·X·2 market, favourite
 * (shortest price) highlighted in green via `.odds-cell.best`.
 */
export default function TopOddsWidget({ matches, limit = 3 }) {
  const withOdds = matches.filter((m) => oddsTriple(m));
  const live = withOdds.filter((m) => statusOf(m) === "live");
  // prefer live matches first, then fill with the rest
  const ordered = [...live, ...withOdds.filter((m) => statusOf(m) !== "live")].slice(0, limit);

  return (
    <aside className="hero-right card-glass" style={{ padding: 22 }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Live odds preview
          </span>
        </div>
        <span className="chip chip-muted">Updated just now</span>
      </div>

      {ordered.length ? (
        ordered.map((m) => <PreviewRow key={m.id} match={m} />)
      ) : (
        <div style={{ color: "var(--text-dim)", fontSize: 13, padding: "8px 0" }}>
          No priced matches right now — check back closer to kickoff.
        </div>
      )}

      <div className="flex justify-between items-center" style={{ marginTop: 14, fontSize: 12, color: "var(--text-dim)" }}>
        <span>Best price highlighted in green</span>
        <Link href="/football" style={{ color: "var(--accent)", fontWeight: 600 }}>View all odds →</Link>
      </div>
    </aside>
  );
}
