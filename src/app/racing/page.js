import Link from "next/link";
import { getRacingMeetings, todayISO } from "@/lib/api";
import { kickoffTime } from "@/lib/format";
import DateNav from "@/components/DateNav";

export const metadata = {
  title: "Horse racing — today's meetings & racecards",
  description: "Today's race meetings, racecards, going and runners across UK, Ireland and worldwide.",
};

function raceStatusChip(status) {
  const s = (status || "").toUpperCase();
  if (s === "RESULT") return <span className="chip chip-muted" style={{ fontSize: 10 }}>Result</span>;
  if (s === "INTERIM" || s === "OFF") return <span className="chip chip-live" style={{ fontSize: 10 }}>Live</span>;
  return null;
}

export default async function RacingPage({ searchParams }) {
  const sp = await searchParams;
  const { meetings, date } = await getRacingMeetings(sp?.date || todayISO());
  const totalRaces = meetings.reduce((n, m) => n + (m.races?.length || 0), 0);

  return (
    <>
      <section style={{ padding: "28px 0 16px", background: "linear-gradient(180deg, rgba(45,212,191,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Horse Racing</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(28px,4vw,38px)" }}>Horse racing</h1>
              <p className="sub" style={{ marginTop: 6, maxWidth: 560 }}>Today&apos;s meetings, racecards, going and runners.</p>
              <div className="flex gap-3 flex-wrap" style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6 }}>
                <span><b className="num" style={{ color: "var(--text)" }}>{meetings.length}</b> meetings</span>
                <span className="mute">·</span>
                <span><b className="num" style={{ color: "var(--text)" }}>{totalRaces}</b> races</span>
              </div>
            </div>
            <DateNav date={date} />
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container">
          {meetings.length ? (
            <div className="grid grid-2" style={{ gap: 18 }}>
              {meetings.map((m) => (
                <div className="card" key={m.id} style={{ padding: 0, overflow: "hidden" }}>
                  <div className="flex justify-between items-start flex-wrap gap-2" style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{m.cnm}</div>
                      <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>{m.co}{m.go ? ` · Going: ${m.go}` : ""}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="chip chip-muted">{m.races?.length || m.nor} races</span>
                      {m.wea && <div className="mute" style={{ fontSize: 11, marginTop: 4 }}>{m.wea}</div>}
                    </div>
                  </div>
                  <div>
                    {(m.races || []).map((r) => (
                      <div key={r.id} className="flex items-center gap-3" style={{ padding: "11px 18px", borderBottom: "1px solid var(--border-soft)" }}>
                        <span className="num" style={{ fontWeight: 700, minWidth: 48, color: "var(--accent)" }}>{kickoffTime(r.st)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis" }}>{r.nm}</div>
                          <div className="mute" style={{ fontSize: 11, marginTop: 2 }}>{r.dis}{r.nor ? ` · ${r.nor} runners` : ""}</div>
                        </div>
                        {/* No per-runner prices in the racing feed — show null odds (—) */}
                        <span
                          title="Odds not available"
                          className="num"
                          style={{ minWidth: 48, textAlign: "right", color: "var(--text-mute)", fontWeight: 700, border: "1px dashed var(--border-strong)", borderRadius: 6, padding: "4px 8px", fontSize: 13 }}
                        >
                          —
                        </span>
                        {raceStatusChip(r.status)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>No meetings for {date}</h3>
              <p className="sub" style={{ marginBottom: 20 }}>The racing card may not be published yet — check back later.</p>
              <Link className="btn btn-primary" href="/football">Browse football odds</Link>
            </div>
          )}
          <p className="mute" style={{ fontSize: 11, marginTop: 18 }}>
            Racecards from the meetings feed. Per-runner prices aren&apos;t exposed by this API yet.
          </p>
        </div>
      </section>
    </>
  );
}
