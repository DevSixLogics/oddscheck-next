"use client";

import { useState } from "react";

// Dynamic tabs for a match-detail page. The available tabs are driven by the
// match's own `tabs` list (a match without standings simply won't get that tab),
// so the user only ever sees tabs that have data. Each tab renders its own shape.
const LABELS = { standings: "Standings", teams: "Teams", info: "Match info" };

const TH = { textAlign: "right", padding: "6px 8px", fontSize: 11, color: "var(--text-mute)", fontWeight: 700 };
const TD = { textAlign: "right", padding: "6px 8px", fontSize: 13 };
const empty = (msg) => <p className="muted" style={{ fontSize: 13, margin: 0 }}>{msg}</p>;

function StandingsTab({ groups, teamIds }) {
  if (!groups?.length) return empty("Standings aren't available for this match.");
  return (
    <>
      {groups.map((g, gi) => (
        <div key={gi} style={{ marginTop: gi ? 18 : 0 }}>
          {g[0]?.grp && <div className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Group {g[0].grp}</div>}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, textAlign: "left", width: 22 }}>#</th>
                  <th style={{ ...TH, textAlign: "left" }}>Team</th>
                  <th style={TH}>P</th><th style={TH}>W</th><th style={TH}>L</th><th style={TH}>Pts</th><th style={TH}>NRR</th>
                </tr>
              </thead>
              <tbody>
                {g.map((r) => {
                  const mine = teamIds.includes(String(r.tid));
                  return (
                    <tr key={r.tid} style={{ borderTop: "1px solid var(--border-soft)", background: mine ? "rgba(255,142,0,0.08)" : undefined }}>
                      <td style={{ ...TD, textAlign: "left", color: "var(--text-mute)" }}>{r.pos}</td>
                      <td style={{ ...TD, textAlign: "left", fontWeight: mine ? 700 : 500 }}>{r.tnm}</td>
                      <td style={TD} className="num">{r.mt}</td>
                      <td style={TD} className="num">{r.wo}</td>
                      <td style={TD} className="num">{r.lo}</td>
                      <td style={{ ...TD, fontWeight: 700 }} className="num">{r.pts}</td>
                      <td style={TD} className="num">{r.nrr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

function TeamsTab({ data }) {
  const teams = [data?.teams?.team1, data?.teams?.team2].filter(Boolean);
  // team_squards: [{ team_id, player: { id, nm, bows, bats } }] — group by team.
  const squad = Array.isArray(data?.team_squards) ? data.team_squards : [];
  const playersFor = (tid) =>
    squad.filter((s) => String(s.team_id) === String(tid)).map((s) => s.player).filter(Boolean);

  const cols = teams.map((t) => ({ team: t, players: playersFor(t.id) }));
  if (!cols.length) return empty("Team line-ups aren't available yet.");

  return (
    <div className="grid grid-2" style={{ gap: 20 }}>
      {cols.map(({ team, players }) => (
        <div key={team.id}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
            {team.code || team.nm || `Team ${team.id}`}
            {players.length > 0 && <span className="mute" style={{ fontWeight: 500, marginLeft: 6 }}>· {players.length}</span>}
          </div>
          {players.length ? (
            <ul className="flex-col" style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
              {players.map((p) => (
                <li key={p.id} className="flex justify-between items-center gap-3" style={{ padding: "6px 0", borderBottom: "1px solid var(--border-soft)" }}>
                  <span>{p.nm}</span>
                  {p.bows && p.bows !== "null" && <span className="mute" style={{ fontSize: 11, textAlign: "right" }}>{p.bows}</span>}
                </li>
              ))}
            </ul>
          ) : (
            empty("Squad to be confirmed.")
          )}
        </div>
      ))}
    </div>
  );
}

function InfoTab({ data }) {
  const umps = Array.isArray(data?.match_umpires)
    ? data.match_umpires.map((u) => u?.name || u).filter(Boolean).join(", ")
    : data?.match_umpires;
  const rows = [
    ["Format", data?.type],
    ["Toss", data?.ts_win ? `${data.ts_win}${data.elc ? ` — chose to ${data.elc}` : ""}` : null],
    ["Umpires", umps],
    ["Venue", data?.stad?.nm ? `${data.stad.nm}${data.stad.cty ? `, ${data.stad.cty}` : ""}` : null],
  ].filter(([, v]) => v);
  if (!rows.length) return empty("No additional match info yet.");
  return (
    <ul className="flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
      {rows.map(([k, v]) => (
        <li key={k} className="flex justify-between"><span className="mute">{k}</span><span style={{ textAlign: "right" }}>{v}</span></li>
      ))}
    </ul>
  );
}

export default function MatchTabs({ tabs = [], teamIds = [] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  if (!tabs.length) return null;
  const cur = tabs.find((t) => t.key === active) || tabs[0];
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="tab-pills-scroll" style={{ padding: "14px 18px 0", gap: 6 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab-pill${t.key === cur.key ? " active" : ""}`}
            aria-pressed={t.key === cur.key}
            onClick={() => setActive(t.key)}
          >
            {LABELS[t.key] || t.key}
          </button>
        ))}
      </div>
      <div style={{ padding: 22 }}>
        {cur.key === "standings" ? <StandingsTab groups={cur.data} teamIds={teamIds} />
          : cur.key === "teams" ? <TeamsTab data={cur.data} />
          : cur.key === "info" ? <InfoTab data={cur.data} />
          : empty("No data for this tab.")}
      </div>
    </div>
  );
}
