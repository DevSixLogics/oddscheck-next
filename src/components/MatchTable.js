import Link from "next/link";
import Crest from "./Crest";
import Flag from "./Flag";
import { kickoffLabel, statusOf, statusLabel, score, oddsTriple, oddsLineCount } from "@/lib/format";
import { OddsValue } from "./OddsFormatProvider";
import styles from "./MatchTable.module.scss";

function Odds({ match, finished }) {
  // Pre-match odds are meaningless once a game is over (and the feed prunes them
  // for old finished matches), so finished matches render "—", never stale prices.
  const t = finished ? null : oddsTriple(match);
  // 2-way market (tennis/basketball moneyline) → 1 / 2; otherwise 1 / X / 2.
  const twoWay = t?.twoWay;
  const cells = twoWay
    ? [{ sym: "1", price: t?.home }, { sym: "2", price: t?.away }]
    : [{ sym: "1", price: t?.home }, { sym: "X", price: t?.draw }, { sym: "2", price: t?.away }];
  return (
    <div className={styles.odds} style={twoWay ? { gridTemplateColumns: "1fr 1fr" } : undefined} aria-label={t ? "odds" : "Odds not available"}>
      {cells.map((c) => {
        const has = typeof c.price === "number";
        return (
          <div
            className={`${styles.oddsCell}${has ? " " + styles.live : ""}`}
            key={c.sym}
          >
            <span className={styles.sym}>{c.sym}</span>
            {has ? <span className={styles.price}><OddsValue value={c.price} /></span> : <span className={styles.dash}>—</span>}
          </div>
        );
      })}
    </div>
  );
}

function Row({ match, sport, isPast, tz }) {
  const c = match.competitors || {};
  // Past day → results only, regardless of stale "live" flags in the feed.
  const bucket = isPast ? "finished" : statusOf(match);
  const sc = score(match);
  const showScore = bucket !== "upcoming" && sc.raw;
  const finished = bucket === "finished";
  // Total odds lines available (across all markets) — matches the detail page.
  // Suppressed for finished matches (their odds are stale / pruned upstream).
  const books = finished ? 0 : oddsLineCount(match);

  return (
    <div className={styles.row}>
      <div className={styles.teams}>
        <div className={styles.crests}>
          <Crest name={c.htn} id={c.htid} sport={sport} />
          <Crest name={c.atn} id={c.atid} sport={sport} />
        </div>
        <div className={styles.names}>
          <div>{c.htn}</div>
          <div>{c.atn}</div>
        </div>
        {showScore && (
          <span className={styles.score}>
            {sc.home}–{sc.away}
          </span>
        )}
      </div>

      <div className={styles.meta}>
        <div>{match.league}</div>
        <div className={styles.status}>
          {bucket === "live" ? (
            <>
              <span className="live-dot" /> <span className={styles.live}>{statusLabel(match, tz)}</span>
            </>
          ) : bucket === "finished" ? (
            <span>FT</span>
          ) : (
            <span>{kickoffLabel(match.dt, tz)}</span>
          )}
        </div>
      </div>

      <Odds match={match} finished={finished} />

      <div className={styles.compare} style={{ flexDirection: "column", gap: 6, alignItems: "center", justifyContent: "center" }}>
        <Link className="btn btn-primary btn-sm" href={`/event/${sport}/${match.id}`}>
          Compare
        </Link>
        {books > 0 && (
          <Link href={`/event/${sport}/${match.id}`} className="mute" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
            {books} odds
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MatchTable({ groups, sport = "football", isPast = false, tz }) {
  if (!groups?.length) {
    return <div className={styles.note}>No matches found for this date.</div>;
  }
  return (
    <>
      {groups.map((g) => (
        <div className={styles.group} id={`group-${g.id}`} key={g.id} style={{ scrollMarginTop: 96 }}>
          <div className={styles.groupHead}>
            <span className="flex items-center gap-2">
              <Flag fid={g.fid} sport={sport} size={18} />
              {g.nm}
              {g.is_cup ? <span className={styles.cup}>CUP</span> : null}
            </span>
            <span className={styles.count}>{g.match_count} matches</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            {(g.matches || []).map((m) => (
              <Row key={m.id} sport={sport} isPast={isPast} tz={tz} match={{ ...m, league: g.name || g.nm }} />
            ))}
          </div>
        </div>
      ))}
      <div className={styles.note}>
        1·X·2 prices are a single pre-match market from the feed. Finished matches show
        “—”. Open a match for the full multi-bookmaker comparison.
      </div>
    </>
  );
}
