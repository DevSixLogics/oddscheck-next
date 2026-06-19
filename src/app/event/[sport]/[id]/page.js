import Link from "next/link";
import { getMatchDetail, getMatchH2H, getMatchTab } from "@/lib/api";
import { oddsMarkets, statusLabel, kickoffTime, kickoffDate, score } from "@/lib/format";
import EventScore from "@/components/EventScore";
import Crest from "@/components/Crest";
import OddsMarkets from "@/components/OddsMarkets";
import MatchTabs from "@/components/MatchTabs";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { cmsSeo } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { sport, id } = await params;
  const d = await getMatchDetail(sport, id);
  const c = d?.competitors;
  if (!c) return { title: "Event — odds & match detail" };

  const league = d.tournament?.nm || "";
  const replacements = {
    HOME_TEAM: c.htn || "",
    AWAY_TEAM: c.atn || "",
    HOME_PLAYER: c.htn || "",
    AWAY_PLAYER: c.atn || "",
    LEAGUE_NAME: league,
    TOURNAMENT_NAME: league,
    COUNTRY_NAME: league,
    DATE: kickoffDate(d.dt || d.gdt) || "",
  };
  // CMS /seo-settings match_detail template first; fall back to a built string.
  const cms = await cmsSeo({
    sport,
    kind: "detail",
    replacements,
    canonicalPath: `/event/${sport}/${id}`,
  });
  return (
    cms || {
      title: `${c.htn} vs ${c.atn} — odds & match detail`,
      description: null,
      alternates: { canonical: `/event/${sport}/${id}` },
    }
  );
}

function FormPills({ form }) {
  if (!Array.isArray(form) || !form.length) return null;
  return (
    <div className="flex gap-1 mt-2">
      {form.map((r, i) => (
        <span key={i} className={`result result-${(r || "").toLowerCase()}`}>{r}</span>
      ))}
    </div>
  );
}

// Tabs we know how to render in MatchTabs, in display order.
const SUPPORTED_TABS = ["standings", "teams", "info"];
const TAB_ORDER = { standings: 0, teams: 1, info: 2 };

// Shape a tab's raw payload for MatchTabs. For standings, keep only non-empty
// groups and prefer the group(s) containing this match's teams.
function processTab(key, data, teamIds) {
  if (key === "standings") {
    const groups = (Array.isArray(data) ? data : []).filter((g) => Array.isArray(g) && g.length);
    const rel = groups.filter((g) => g.some((r) => teamIds.includes(String(r.tid))));
    return rel.length ? rel : groups;
  }
  if (key === "teams") {
    // Trim to only the fields the UI renders (avoids shipping player_id/etc. in the payload).
    const squad = Array.isArray(data?.team_squards) ? data.team_squards : [];
    return {
      teams: data?.teams,
      team_squards: squad.map((s) => ({
        team_id: s.team_id,
        player: s.player ? { id: s.player.id, nm: s.player.nm, bows: s.player.bows } : null,
      })),
    };
  }
  return data;
}

function tabHasData(key, data) {
  if (key === "standings") return Array.isArray(data) && data.length > 0;
  if (key === "teams") return !!(data?.teams || (Array.isArray(data?.team_squards) && data.team_squards.length));
  if (key === "info") return !!(data && (data.type || data.stad || data.ts_win || data.match_umpires));
  return data != null;
}

export default async function EventPage({ params }) {
  const { sport, id } = await params;

  const isCricket = sport === "cricket";
  // Fetch detail + (football) H2H + (cricket) every supported tab in parallel.
  const [d, h2h, ...tabRaw] = await Promise.all([
    getMatchDetail(sport, id),
    isCricket ? Promise.resolve(null) : getMatchH2H(sport, id),
    ...(isCricket ? SUPPORTED_TABS.map((t) => getMatchTab(sport, id, t)) : []),
  ]);

  if (!d) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Match not found</h1>
          <p className="sub" style={{ marginBottom: 24 }}>We couldn&apos;t load odds for this event.</p>
          <Link className="btn btn-primary btn-lg" href={`/${sport}`}>Browse odds</Link>
        </div>
      </section>
    );
  }

  const c = d.competitors || {};
  // Kickoff datetime: football uses `dt`; cricket/others use `gdt`. Venue: football
  // `venue.name`, cricket `stad`. Score via score() (handles cricket runs + cfs).
  const ko = d.dt || d.gdt || "";
  const sc = score(d);
  const venue = d.venue?.name || d.stad?.nm || "";
  // Dynamic tabs: driven by the match's own `tabs` list (so a match without a
  // standings tab just shows the tabs it does have), keeping only ones with data.
  const teamIdsArr = [c.htid, c.atid].map((x) => String(x));
  const tabByKey = isCricket ? Object.fromEntries(SUPPORTED_TABS.map((t, i) => [t, tabRaw[i]])) : {};
  const availableKeys = (Array.isArray(d.tabs) && d.tabs.length ? d.tabs : SUPPORTED_TABS).filter((t) => SUPPORTED_TABS.includes(t));
  const matchTabs = isCricket
    ? availableKeys
        .map((key) => ({ key, data: processTab(key, tabByKey[key], teamIdsArr) }))
        .filter((t) => tabHasData(t.key, t.data))
        .sort((a, b) => (TAB_ORDER[a.key] ?? 9) - (TAB_ORDER[b.key] ?? 9))
    : [];
  // A match on an earlier calendar day is finished — ignore stale "live" flags.
  const matchDate = ko.slice(0, 10);
  const isPast = /^\d{4}-\d{2}-\d{2}$/.test(matchDate) && matchDate < new Date().toISOString().slice(0, 10);
  const statusText = isPast ? (d.mins || "FT") : statusLabel(d);

  // All odds markets (1x2, BTTS, …) grouped for the interactive comparison tabs.
  const markets = oddsMarkets(d);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        name: `${c.htn} vs ${c.atn}`,
        startDate: ko ? ko.replace(" ", "T") : undefined,
        eventStatus: "https://schema.org/EventScheduled",
        location: venue ? { "@type": "Place", name: venue } : undefined,
        competitor: [
          { "@type": "SportsTeam", name: c.htn },
          { "@type": "SportsTeam", name: c.atn },
        ],
        superEvent: d.tournament?.nm ? { "@type": "SportsOrganization", name: d.tournament.nm } : undefined,
        url: `${SITE_URL}/event/${sport}/${id}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: sport.charAt(0).toUpperCase() + sport.slice(1), item: `${SITE_URL}/${sport}` },
          { "@type": "ListItem", position: 3, name: `${c.htn} vs ${c.atn}` },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <section style={{ padding: "28px 0 32px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 80%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href={`/${sport}`} style={{ textTransform: "capitalize" }}>{sport}</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">{c.htn} vs {c.atn}</span></li>
            </ol>
          </nav>

          {/* One primary H1 describing the match entity (SEO). The big team names
              below are visual only, so they're styled divs, not extra headings. */}
          <h1 className="sr-only">{c.htn} vs {c.atn} — odds, stats &amp; match info{d.tournament?.nm ? ` · ${d.tournament.nm}` : ""}</h1>

          <div className="event-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 32, marginTop: 12 }}>
            <div className="flex items-center gap-4" style={{ justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div className="mute" style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>HOME</div>
                <div style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 700, lineHeight: 1.1 }}>{c.htn}</div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><FormPills form={c.htf} /></div>
              </div>
              <Crest name={c.htn} id={c.htid} sport={sport} size="xl" />
            </div>

            <EventScore sport={sport} id={id} match={d} />

            <div className="flex items-center gap-4">
              <Crest name={c.atn} id={c.atid} sport={sport} size="xl" />
              <div>
                <div className="mute" style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>AWAY</div>
                <div style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 700, lineHeight: 1.1 }}>{c.atn}</div>
                <FormPills form={c.atf} />
              </div>
            </div>
          </div>

        </div>
      </section>

      <section style={{ padding: "32px 0 64px" }}>
        <div className="container layout-split-wide">
          <div className="flex-col gap-5">
            <OddsMarkets markets={markets} home={c.htn} away={c.atn} />

            {h2h && (h2h.stats || h2h.meetings.length > 0) && (
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>Head to head</h3>
                {h2h.stats && (
                  <>
                    <div className="flex justify-between" style={{ fontSize: 13, marginBottom: 8 }}>
                      <span><b>{h2h.stats.wins.t1}</b> {h2h.stats.homeTeam} wins</span>
                      <span><b>{h2h.stats.draws.tot}</b> draws</span>
                      <span>{h2h.stats.awayTeam} wins <b>{h2h.stats.wins.t2}</b></span>
                    </div>
                    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--bg-3)", marginBottom: 14 }}>
                      <div style={{ width: `${h2h.stats.wins.t1p}%`, background: "var(--accent)" }} />
                      <div style={{ width: `${h2h.stats.draws.perct}%`, background: "var(--border-strong)" }} />
                      <div style={{ width: `${h2h.stats.wins.t2p}%`, background: "var(--gold)" }} />
                    </div>
                    <div className="mute" style={{ fontSize: 12, marginBottom: 16 }}>
                      Avg goals — {h2h.stats.homeTeam}: <b className="num">{h2h.stats.average_goal_score?.t1}</b> · {h2h.stats.awayTeam}: <b className="num">{h2h.stats.average_goal_score?.t2}</b>
                    </div>
                  </>
                )}
                {h2h.meetings.length > 0 && (
                  <>
                    <div className="mute" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8 }}>Recent meetings</div>
                    <div className="flex-col gap-1">
                      {h2h.meetings.slice(0, 6).map((mm) => (
                        <div key={mm.id} className="flex items-center" style={{ fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--border-soft)", gap: 10 }}>
                          <span className="mute" style={{ fontSize: 11, minWidth: 64 }}>{kickoffDate(mm.dt)}</span>
                          <span style={{ flex: 1, textAlign: "center" }}>{mm.competitors?.htn} <b className="num">{mm.cfs || mm.ft}</b> {mm.competitors?.atn}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {matchTabs.length > 0 && <MatchTabs tabs={matchTabs} teamIds={teamIdsArr} />}
          </div>

          <aside className="flex-col gap-4">
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 14 }}>Match info</h4>
              <ul className="flex-col gap-2" style={{ fontSize: 13, color: "var(--text-2)", listStyle: "none", padding: 0 }}>
                <li className="flex justify-between"><span className="mute">Competition</span><span>{d.tournament?.nm || "—"}</span></li>
                <li className="flex justify-between"><span className="mute">Country</span><span>{d.tournament?.cat || d.stad?.ctry || "—"}</span></li>
                {d.ro && <li className="flex justify-between"><span className="mute">Round</span><span>{d.ro}</span></li>}
                {d.mty && <li className="flex justify-between"><span className="mute">Format</span><span>{d.mty}</span></li>}
                {venue && <li className="flex justify-between"><span className="mute">Venue</span><span style={{ textAlign: "right" }}>{venue}{d.stad?.cty ? `, ${d.stad.cty}` : ""}</span></li>}
                {ko && <li className="flex justify-between"><span className="mute">{sport === "cricket" ? "Start" : "Kickoff"}</span><span>{kickoffDate(ko)} · {kickoffTime(ko)}</span></li>}
                <li className="flex justify-between"><span className="mute">Status</span><span>{statusText}</span></li>
                {sc.raw && <li className="flex justify-between"><span className="mute">Score</span><span className="num">{sc.home}{sc.away ? ` – ${sc.away}` : ""}</span></li>}
              </ul>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Recent form</h4>
              <div className="flex justify-between items-center" style={{ fontSize: 13 }}>
                <span>{c.htn}</span><FormPills form={c.htf} />
              </div>
              <div className="flex justify-between items-center mt-3" style={{ fontSize: 13 }}>
                <span>{c.atn}</span><FormPills form={c.atf} />
              </div>
            </div>
            <div className="rg-banner" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 12 }}><b>18+ · Bet responsibly.</b></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
