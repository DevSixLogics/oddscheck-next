import Link from "next/link";
import { getMatches, flattenMatches, getRacingMeetings, getGolfTournaments } from "@/lib/api";
import { statusOf } from "@/lib/format";
import LiveBoard from "@/components/LiveBoard";

export const metadata = { alternates: { canonical: "/live" } };

// Render fresh on every request: this is the LIVE page, so the initial server
// snapshot must reflect matches that are in-play right now. Without this, the page
// was served from the ISR cache (≤60s old) — so a match that kicked off after the
// last revalidation was missing on refresh and only appeared once the client poll
// caught up (the "matches vanish on refresh, then reappear" behaviour).
export const dynamic = "force-dynamic";

const MATCH_SPORTS = [
  { key: "football", label: "Football" },
  { key: "tennis", label: "Tennis" },
  { key: "basketball", label: "Basketball" },
  { key: "cricket", label: "Cricket" },
  { key: "baseball", label: "Baseball" },
];

const golfIsLive = (t) =>
  (t.matches || []).some((p) => {
    const thru = parseInt(p.thru, 10);
    return thru >= 1 && thru <= 17;
  });

export default async function LivePage() {
  // Initial snapshot (server). The socket then live-merges on the client.
  const [matchFeeds, racing, golf] = await Promise.all([
    // fresh: bypass the 60s data cache so the snapshot is current on every load.
    Promise.all(MATCH_SPORTS.map((s) => getMatches(s.key, undefined, { fresh: true }))),
    getRacingMeetings(),
    getGolfTournaments(),
  ]);

  const items = [];
  MATCH_SPORTS.forEach((s, i) => {
    flattenMatches(matchFeeds[i].groups)
      .filter((m) => statusOf(m) === "live")
      .forEach((m) => items.push({ kind: "match", sport: s.key, sportLabel: s.label, ...m }));
  });
  (racing.meetings || []).forEach((mt) =>
    (mt.races || [])
      .filter((r) => (r.status || "").toUpperCase() === "OFF")
      .forEach((r) => items.push({ kind: "race", course: mt.cnm, ...r }))
  );
  (golf.tournaments || []).filter(golfIsLive).forEach((t) => items.push({ kind: "golf", ...t }));

  return (
    <>
      <section style={{ padding: "32px 0 24px", background: "linear-gradient(180deg, rgba(255,77,103,0.06) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Live odds</span></li>
            </ol>
          </nav>
          <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginTop: 12 }}>
            <div>
              <span className="chip chip-live mb-3">LIVE NOW</span>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "8px 0" }}>Live odds &amp; in-play markets</h1>
              <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 640, lineHeight: 1.55 }}>
                Real-time scores across football, tennis, basketball, cricket, racing and golf —
                pushed live over the socket. Best in-play price highlighted where the feed provides it.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap" style={{ fontSize: 13 }}>
              <span className="flex items-center gap-2"><span className="live-dot" />Pulse = live update</span>
              <span className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />Markets open</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <LiveBoard initialItems={items} />
        </div>
      </section>
    </>
  );
}
