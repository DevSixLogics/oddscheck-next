import Link from "next/link";
import Crest from "./Crest";
import { kickoffTime, statusOf, statusLabel, score, oddsTriple } from "@/lib/format";
import styles from "./MatchTable.module.scss";

function Odds({ match }) {
  // The feed carries a single pre-match 1·X·2 market (one bookmaker) on upcoming
  // games, and null on finished ones. Render real prices when present, "—" when not.
  const t = oddsTriple(match);
  const cells = [
    { sym: "1", price: t?.home },
    { sym: "X", price: t?.draw },
    { sym: "2", price: t?.away },
  ];
  const prices = cells.map((c) => c.price).filter((p) => typeof p === "number");
  const fav = prices.length ? Math.min(...prices) : null; // shortest price = favourite

  return (
    <div className={styles.odds} aria-label={t ? "1 X 2 odds" : "Odds not available"}>
      {cells.map((c) => {
        const has = typeof c.price === "number";
        return (
          <div
            className={`${styles.oddsCell}${has ? " " + styles.live : ""}${has && c.price === fav ? " " + styles.fav : ""}`}
            key={c.sym}
          >
            <span className={styles.sym}>{c.sym}</span>
            {has ? <span className={styles.price}>{c.price.toFixed(2)}</span> : <span className={styles.dash}>—</span>}
          </div>
        );
      })}
    </div>
  );
}

function Row({ match, sport }) {
  const c = match.competitors || {};
  const bucket = statusOf(match);
  const sc = score(match);
  const showScore = bucket !== "upcoming" && sc.raw;

  return (
    <div className={styles.row}>
      <div className={styles.teams}>
        <div className={styles.crests}>
          <Crest name={c.htn} id={c.htid} />
          <Crest name={c.atn} id={c.atid} />
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
              <span className="live-dot" /> <span className={styles.live}>{statusLabel(match)}</span>
            </>
          ) : bucket === "finished" ? (
            <span>FT</span>
          ) : (
            <span>{kickoffTime(match.dt)}</span>
          )}
        </div>
      </div>

      <Odds match={match} />

      <div className={styles.compare}>
        <Link className="btn btn-primary btn-xs" href={`/event?sport=${sport}&id=${match.id}`}>
          Compare
        </Link>
      </div>
    </div>
  );
}

export default function MatchTable({ groups, sport = "football" }) {
  if (!groups?.length) {
    return <div className={styles.note}>No matches found for this date.</div>;
  }
  return (
    <>
      {groups.map((g) => (
        <div className={styles.group} key={g.id}>
          <div className={styles.groupHead}>
            <span>
              {g.nm}
              {g.is_cup ? <span className={styles.cup}>CUP</span> : null}
            </span>
            <span className={styles.count}>{g.match_count} matches</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            {(g.matches || []).map((m) => (
              <Row key={m.id} sport={sport} match={{ ...m, league: g.name || g.nm }} />
            ))}
          </div>
        </div>
      ))}
      <div className={styles.note}>
        1·X·2 prices are a single pre-match market from the feed (one bookmaker, shortest
        price highlighted). Finished matches show “—”. Multi-bookmaker comparison, price
        movement and extra markets are not in the feed yet.
      </div>
    </>
  );
}
