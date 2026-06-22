import Link from "next/link";
import Crest from "./Crest";
import { oddsTriple, statusOf, statusLabel, kickoffLabel } from "@/lib/format";
import { OddsValue } from "./OddsFormatProvider";
import { getViewerTimeZone } from "@/lib/timezone";

function PreviewRow({ match, tz }) {
  const c = match.competitors || {};
  const bucket = statusOf(match);
  // Finished matches keep stale pre-match odds in the feed — never show them.
  const t = bucket === "finished" ? null : oddsTriple(match);
  const cells = [
    { sym: "1", price: t?.home },
    { sym: "X", price: t?.draw },
    { sym: "2", price: t?.away },
  ];
  const live = bucket === "live";

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
      <div className="flex justify-between items-center mb-3" style={{ gap: 10 }}>
        <div className="flex items-center gap-2" style={{ minWidth: 0, flex: "1 1 auto" }}>
          <Crest name={c.htn} id={c.htid} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{c.htn}</span>
          <span className="mute" style={{ fontSize: 12 }}>vs</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{c.atn}</span>
          <Crest name={c.atn} id={c.atid} />
        </div>
        {live ? (
          <span className="chip chip-live" style={{ fontSize: 10, flexShrink: 0, whiteSpace: "nowrap" }}>LIVE {statusLabel(match, tz)}</span>
        ) : (
          <span className="mute" style={{ fontSize: 11, flexShrink: 0, whiteSpace: "nowrap" }}>{kickoffLabel(match.dt, tz)}</span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {cells.map((x) => {
          const has = typeof x.price === "number";
          const isBest = false; // favourite/best highlight removed — not a backend value (re-enable when the feed flags a best price)
          return (
            <button
              type="button"
              key={x.sym}
              className={`odds-cell${isBest ? " best" : ""}`}
            >
              <span className="flex justify-between items-center" style={{ gap: 4 }}>
                <span className="meta">{x.sym}</span>
              </span>
              <span className="price">{has ? <OddsValue value={x.price} /> : "—"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hero "Live odds preview" widget — DATA-DRIVEN, styled to match the original
 * index.html hero-right card. Shows matches that carry a 1·X·2 market; each cell
 * is the best price across bookmakers for that outcome (no client-side favourite
 * highlight — that isn't a backend value).
 */
export default async function TopOddsWidget({ matches, limit = 3 }) {
  const tz = await getViewerTimeZone();
  // Exclude finished matches — their feed odds are stale pre-match prices.
  const withOdds = matches.filter((m) => statusOf(m) !== "finished" && oddsTriple(m));
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
        <span className="chip chip-muted">Auto-updating</span>
      </div>

      {ordered.length ? (
        ordered.map((m) => <PreviewRow key={m.id} match={m} tz={tz} />)
      ) : (
        <div style={{ color: "var(--text-dim)", fontSize: 13, padding: "8px 0" }}>
          No priced matches right now — check back closer to kickoff.
        </div>
      )}

      <div className="flex justify-between items-center" style={{ marginTop: 14, fontSize: 12, color: "var(--text-dim)" }}>
        <span>Best price across bookmakers</span>
        <Link href="/football" style={{ color: "var(--accent)", fontWeight: 600 }}>View all odds →</Link>
      </div>
    </aside>
  );
}
