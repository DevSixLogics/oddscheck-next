import Link from "next/link";
import { getRacingMeetings, getRaceRunners, todayISO } from "@/lib/api";
import { kickoffTime } from "@/lib/format";
import DateNav from "@/components/DateNav";
import RacingBoard from "@/components/RacingBoard";

export const metadata = {
  title: "Horse racing odds — today's meetings & racecards",
  description: "Today's race meetings, racecards, going and runners across UK, Ireland and worldwide.",
};

// Static editor tips (no racing tips endpoint in this API).
const RACING_TIPS = [
  { meet: "Feature · Each Way", pick: "Back the form pick each-way", conf: 4 },
  { meet: "Value angle", pick: "Each-way places in big fields", conf: 3 },
  { meet: "Trainer in form", pick: "Follow the in-form yard", conf: 4 },
];

export default async function RacingPage({ searchParams }) {
  const sp = await searchParams;
  const reqDate = sp?.date || todayISO();
  const { meetings, date } = await getRacingMeetings(reqDate);
  const totalRaces = meetings.reduce((n, m) => n + (m.races?.length || 0), 0);
  // A selected day earlier than today is fully run — results, not live.
  const isPast = date < todayISO();

  // Feature race = first race of the first meeting; fetch its runners for the lead card.
  const featureMeeting = meetings[0] || null;
  const featureRaceRef = featureMeeting?.races?.[0] || null;
  const featureRace = featureRaceRef ? await getRaceRunners(featureRaceRef.id) : null;
  const featureRunners = (featureRace?.runner || []).filter((r) => !r.non_r);

  // "Next 4 off" — the next four races across all meetings, by start time.
  const allRaces = meetings.flatMap((m) => (m.races || []).map((r) => ({ ...r, course: m.cnm })));
  // "Upcoming" = not yet off (OFF = running, INTERIM/RESULT = already run).
  const upcoming = allRaces.filter((r) => !["OFF", "INTERIM", "RESULT"].includes((r.status || "").toUpperCase()));
  const next4 = (upcoming.length ? upcoming : allRaces)
    .slice()
    .sort((a, b) => String(a.st || "").localeCompare(String(b.st || "")))
    .slice(0, 4);

  return (
    <>
      <section style={{ padding: "28px 0 24px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Horse Racing</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,142,0,0.10)", border: "1px solid rgba(255,142,0,0.25)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)" }}>Horse Racing odds</h1>
                <div className="flex gap-3 flex-wrap muted" style={{ fontSize: 13, marginTop: 6 }}>
                  <span><b className="num" style={{ color: "var(--text)" }}>{totalRaces}</b> races today</span>
                  <span className="mute">·</span>
                  <span><b className="num" style={{ color: "var(--text)" }}>{meetings.length}</b> meetings</span>
                </div>
              </div>
            </div>
            <DateNav date={reqDate} />
          </div>
        </div>
      </section>

      <section className="section">
        <RacingBoard meetings={meetings} date={date} isPast={isPast}>
            {/* Feature race card (lead) */}
            {featureRace && featureRunners.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                  <div>
                    <span className="chip chip-gold mb-2">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-2-4 1-7Z" /></svg>
                      Feature race
                    </span>
                    <h2 style={{ fontSize: 22, marginTop: 8 }}>{kickoffTime(featureRace.st)} {featureMeeting.cnm} · {featureRace.nm}</h2>
                    <div className="mute" style={{ fontSize: 12, marginTop: 6 }}>
                      {[featureMeeting.go && `Going: ${featureMeeting.go}`, `${featureRunners.length} runners`, featureRace.dis].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mute" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{isPast ? "Off was" : "Off at"}</div>
                    <div className="num" style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{kickoffTime(featureRace.st)}</div>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="dt dt-compact" style={{ minWidth: 760 }}>
                    <thead>
                      <tr><th>#</th><th>Horse</th><th>Trainer / Jockey</th><th className="text-center">Form</th><th className="text-right">Best win</th><th className="text-right">EW</th><th /></tr>
                    </thead>
                    <tbody>
                      {featureRunners.map((r, i) => (
                        <tr key={r.id}>
                          <td className="num"><b>{featureRace.st?.toUpperCase?.() ? (r.pos || i + 1) : i + 1}</b></td>
                          <td>
                            <div className="flex items-center gap-2">
                              {r.surl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={r.surl} alt="" width={24} height={24} style={{ borderRadius: 5, objectFit: "contain", background: "var(--bg-2)", flexShrink: 0 }} />
                              )}
                              <div style={{ fontWeight: 600 }}>{r.nm}</div>
                            </div>
                          </td>
                          <td><div style={{ fontSize: 12 }}>{r.tra}</div><div className="mute" style={{ fontSize: 11 }}>{r.joc}</div></td>
                          <td className="text-center"><span className="num" style={{ fontWeight: 600 }}>{r.ffg || "–"}</span></td>
                          <td className="text-right">
                            <span title="Odds not available" className="num" style={{ display: "inline-block", color: "var(--text-mute)", fontWeight: 700, border: "1px dashed var(--border-strong)", borderRadius: 6, padding: "5px 10px", fontSize: 13 }}>—</span>
                          </td>
                          <td className="text-right num muted" style={{ fontSize: 11 }}>—</td>
                          <td className="text-right"><Link className="btn btn-primary btn-xs" href={`/race?id=${featureRace.id}`}>Bet</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Next 4 off + Today's tips */}
            {!isPast && next4.length > 0 && (
              <div className="grid grid-2" style={{ gap: 20 }}>
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ fontSize: 17, marginBottom: 6 }}>Next 4 off</h3>
                  <div className="flex-col">
                    {next4.map((r, i) => (
                      <div key={r.id} className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: i === next4.length - 1 ? 0 : "1px solid var(--border-soft)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.course}</div>
                          <div className="mute" style={{ fontSize: 11.5, marginTop: 2 }}>
                            {[kickoffTime(r.st), r.dis, r.nor && `${r.nor} runners`].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span title="Odds not available" className="num" style={{ color: "var(--text-mute)", fontWeight: 700, border: "1px dashed var(--border-strong)", borderRadius: 6, padding: "4px 9px", fontSize: 13 }}>—</span>
                          <Link className="btn btn-primary btn-xs" href={`/race?id=${r.id}`}>Card</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ fontSize: 17, marginBottom: 6 }}>Today&apos;s tips</h3>
                  <div className="flex-col">
                    {RACING_TIPS.map((t, i) => (
                      <div key={i} style={{ padding: "12px 0", borderBottom: i === RACING_TIPS.length - 1 ? 0 : "1px solid var(--border-soft)" }}>
                        <div className="mute" style={{ fontSize: 11.5 }}>{t.meet}</div>
                        <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{t.pick}</div>
                          <span className="flex items-center gap-1" aria-label={`Confidence ${t.conf} of 5`}>
                            {[0, 1, 2, 3, 4].map((d) => (
                              <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: d < t.conf ? "var(--accent)" : "var(--border-strong)", display: "inline-block" }} />
                            ))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link className="btn btn-ghost btn-block" href="/tips" style={{ marginTop: 14 }}>All racing tips</Link>
                </div>
              </div>
            )}
        </RacingBoard>
      </section>
    </>
  );
}
