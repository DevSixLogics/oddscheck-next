import Link from "next/link";
import { getMatches, flattenMatches, todayISO } from "@/lib/api";
import { statusOf } from "@/lib/format";
import MatchTable from "@/components/MatchTable";
import StaticNote from "@/components/StaticNote";
import DateNav from "@/components/DateNav";

/**
 * Generic sport landing page (fixtures/results + 1·X·2 odds where available).
 * Reused by /football, /tennis, /basketball, /cricket, /racing — same feed shape.
 */
export default async function SportPage({ sport, title, lead, subjectWord = "matches", date: dateProp }) {
  const reqDate = dateProp || todayISO();
  const { groups, date } = await getMatches(sport, reqDate);
  const matches = flattenMatches(groups);
  // A selected day before today is fully played — never show "live" on it.
  const isPast = reqDate < todayISO();
  const liveCount = isPast ? 0 : matches.filter((m) => statusOf(m) === "live").length;

  return (
    <>
      <section
        style={{
          padding: "28px 0 16px",
          background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">{title}</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(28px,4vw,38px)" }}>{title}</h1>
              {lead && <p className="sub" style={{ marginTop: 6, maxWidth: 560 }}>{lead}</p>}
              <div className="flex gap-3 flex-wrap" style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6 }}>
                <span><b className="num" style={{ color: "var(--text)" }}>{matches.length}</b> {subjectWord}</span>
                <span className="mute">·</span>
                <span><b className="num" style={{ color: "var(--text)" }}>{groups.length}</b> competitions</span>
                <span className="mute">·</span>
                <span><b className="num" style={{ color: "var(--text)" }}>{liveCount}</b> live now</span>
              </div>
            </div>
            <DateNav date={reqDate} />
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container layout-split">
          <aside className="flex-col gap-4">
            <div className="card side-card">
              <h4 className="flex justify-between items-center">
                Competitions<span className="mute">{groups.length}</span>
              </h4>
              <nav className="side-list" aria-label="Competitions">
                {groups.slice(0, 14).map((g) => (
                  <a href={`#group-${g.id}`} key={g.id}>
                    <span>{g.name || g.nm}</span>
                    <span>{g.match_count}</span>
                  </a>
                ))}
              </nav>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Quick filters</div>
              <StaticNote>Market filters are static — feed has no market flags.</StaticNote>
            </div>
          </aside>

          <div className="flex-col gap-6">
            <div className="card" style={{ padding: 16 }}>
              <div className="flex justify-between items-center flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <h3 style={{ fontSize: 18 }}>Matches</h3>
                  <span className="chip chip-muted">{date}</span>
                </div>
              </div>
              {matches.length ? (
                <MatchTable groups={groups} sport={sport} isPast={isPast} />
              ) : (
                <div style={{ padding: 18, color: "var(--text-dim)", fontSize: 13 }}>
                  No {subjectWord} found for {date}. This sport&apos;s feed may be empty right now —
                  check back closer to game time.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
