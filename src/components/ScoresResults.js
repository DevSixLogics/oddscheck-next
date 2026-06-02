import Link from "next/link";
import Crest from "./Crest";
import { statusOf, statusLabel, score, kickoffTime } from "@/lib/format";
import styles from "./ScoresResults.module.scss";

const SHOW = 3; // rows per column before "View all"

function MatchRow({ match, bucket }) {
  const c = match.competitors || {};
  const sc = score(match);
  return (
    <div className={styles.match}>
      <div className={styles.teams}>
        <div className={styles.crests}>
          <Crest name={c.htn} id={c.htid} />
          <Crest name={c.atn} id={c.atid} />
        </div>
        <div className={styles.names}>
          <div>{c.htn}</div>
          <div>{c.atn}</div>
        </div>
      </div>

      {bucket !== "upcoming" && sc.raw ? (
        <div className={styles.score}>
          <div>{sc.home}</div>
          <div>{sc.away}</div>
        </div>
      ) : null}

      <div className={styles.right}>
        {bucket === "live" ? (
          <span className={styles.badge}>{statusLabel(match)}</span>
        ) : bucket === "finished" ? (
          <span className={styles.kickoff}>FT</span>
        ) : (
          <span className={styles.kickoff}>{kickoffTime(match.dt)}</span>
        )}
      </div>
    </div>
  );
}

function Column({ title, live, matches, href }) {
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
        matches
          .slice(0, SHOW)
          .map((m) => <MatchRow key={m.id} match={m} bucket={live ? "live" : statusOf(m)} />)
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
  const live = matches.filter((m) => statusOf(m) === "live");
  const upcoming = matches.filter((m) => statusOf(m) === "upcoming");
  const finished = matches.filter((m) => statusOf(m) === "finished");

  return (
    <div className={styles.grid}>
      <Column title="Live" live matches={live} href="/live" />
      <Column title="Today's fixtures" matches={upcoming} href="/football" />
      <Column title="Finished" matches={finished} href="/live" />
    </div>
  );
}
