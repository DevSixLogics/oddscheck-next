"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { kickoffTime } from "@/lib/format";

// Quick filters. Going is meeting-level; the rest are race-level (read from the
// race name / distance). Multiple active filters combine with AND.
const FILTERS = [
  { key: "soft", label: "Going · Soft", scope: "meeting", test: (m) => /soft|heavy/i.test(m.go || "") },
  { key: "2m", label: "Distance · 2m+", scope: "race", test: (r) => furlongs(r.dis) >= 16 },
  { key: "class1", label: "Class 1 only", scope: "race", test: (r) => /class\s*1\b/i.test(r.nm || "") },
  { key: "hurdles", label: "Hurdles", scope: "race", test: (r) => /hurdle/i.test(r.nm || "") },
  { key: "chase", label: "Chase", scope: "race", test: (r) => /\bchase\b/i.test(r.nm || "") },
  { key: "flat", label: "Flat", scope: "race", test: (r) => !/hurdle|chase|fences?/i.test(r.nm || "") },
];

// Parse a distance string like "2m4f" / "5f" / "1m" into furlongs.
function furlongs(dis) {
  if (!dis) return 0;
  const s = String(dis).toLowerCase();
  let f = 0;
  const m = s.match(/(\d+)\s*m/);
  if (m) f += parseInt(m[1], 10) * 8;
  const fl = s.match(/(\d+)\s*f/);
  if (fl) f += parseInt(fl[1], 10);
  return f;
}

function statusChip(status, isPast) {
  const s = (status || "").toUpperCase();
  // A past meeting day is fully run — never show "Live", everything is a result.
  if (isPast) return <span className="chip chip-muted" style={{ fontSize: 10 }}>Result</span>;
  // INTERIM = provisional result (race already run); only OFF is in-running.
  if (s === "RESULT" || s === "INTERIM") return <span className="chip chip-muted" style={{ fontSize: 10 }}>Result</span>;
  if (s === "OFF") return <span className="chip chip-live" style={{ fontSize: 10 }}>Live</span>;
  return null;
}

export default function RacingBoard({ meetings, date, isPast = false, children }) {
  const [active, setActive] = useState(() => new Set());

  const toggle = (key) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Apply active filters: meeting-scope filters drop whole meetings; race-scope
  // filters drop individual races (a meeting with no surviving races is hidden).
  const filtered = useMemo(() => {
    const activeFilters = FILTERS.filter((f) => active.has(f.key));
    const meetingTests = activeFilters.filter((f) => f.scope === "meeting");
    const raceTests = activeFilters.filter((f) => f.scope === "race");
    return meetings
      .filter((m) => meetingTests.every((f) => f.test(m)))
      .map((m) => ({ ...m, races: (m.races || []).filter((r) => raceTests.every((f) => f.test(r))) }))
      .filter((m) => (m.races || []).length > 0);
  }, [meetings, active]);

  const hasFilters = active.size > 0;

  return (
    <div className="container layout-split">
      {/* Sidebar — meetings + quick filters */}
      <aside className="flex-col gap-4">
        <div className="card side-card">
          <h4 className="flex justify-between items-center">Today&apos;s meetings<span className="mute">{filtered.length}</span></h4>
          <nav className="side-list">
            {filtered.length ? filtered.map((m, i) => (
              <a href={`#meeting-${m.id}`} key={m.id} className={i === 0 ? "active" : undefined}>
                <span>{m.cnm}</span>
                <span className="num">{m.races?.length || m.nor}</span>
              </a>
            )) : <span className="mute" style={{ fontSize: 12, padding: "8px 0", display: "block" }}>No meetings match.</span>}
          </nav>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: 13, margin: 0 }}>Quick filters</h4>
            {hasFilters && (
              <button type="button" onClick={() => setActive(new Set())} style={{ background: "none", border: 0, color: "var(--accent)", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}>Clear</button>
            )}
          </div>
          <div className="flex-col gap-2">
            {FILTERS.map((f) => {
              const on = active.has(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(f.key)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: on ? "var(--text)" : "var(--text-2)", background: "none", border: 0, padding: "2px 0", cursor: "pointer", textAlign: "left" }}
                >
                  {f.label}<span className={`toggle${on ? " on" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main — lead cards (server-rendered) + filtered meeting tables */}
      <div className="flex-col gap-5">
        {children}

        {filtered.length ? filtered.map((m) => (
          <div className="card" id={`meeting-${m.id}`} key={m.id} style={{ padding: 0, overflow: "hidden", scrollMarginTop: 96 }}>
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 style={{ fontSize: 20 }}>{m.cnm}</h2>
                <div className="mute" style={{ fontSize: 12, marginTop: 4 }}>{m.co}{m.go ? ` · Going: ${m.go}` : ""}{m.wea ? ` · ${m.wea}` : ""}</div>
              </div>
              <span className="chip chip-muted">{m.races?.length || m.nor} races</span>
            </div>
            <div className="table-scroll">
              <table className="dt dt-compact" style={{ minWidth: 620 }}>
                <thead>
                  <tr><th>Off</th><th>Race</th><th className="text-center">Dist</th><th className="text-center">Runners</th><th className="text-right">Best odds</th><th /></tr>
                </thead>
                <tbody>
                  {(m.races || []).map((r) => (
                    <tr key={r.id}>
                      <td className="num"><b style={{ color: "var(--accent)" }}>{kickoffTime(r.st)}</b></td>
                      <td><div style={{ fontWeight: 600, fontSize: 13 }}>{r.nm}</div></td>
                      <td className="text-center num">{r.dis || "–"}</td>
                      <td className="text-center num">{r.nor || "–"}</td>
                      <td className="text-right">
                        <span title="Odds not available" className="num" style={{ color: "var(--text-mute)", fontWeight: 700, border: "1px dashed var(--border-strong)", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>—</span>
                      </td>
                      <td className="text-right">
                        <span className="flex items-center gap-2" style={{ justifyContent: "flex-end" }}>
                          {statusChip(r.status, isPast)}
                          <Link className="btn btn-primary btn-xs" href={`/race?id=${r.id}`}>Card</Link>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )) : (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <h3 style={{ fontSize: 18, margin: "0 0 8px" }}>{hasFilters ? "No meetings match these filters" : `No meetings for ${date}`}</h3>
            <p className="sub" style={{ marginBottom: 20 }}>{hasFilters ? "Try clearing a filter or two." : "The racing card may not be published yet — check back later."}</p>
            {hasFilters
              ? <button className="btn btn-primary" type="button" onClick={() => setActive(new Set())}>Clear filters</button>
              : <Link className="btn btn-primary" href="/football">Browse football odds</Link>}
          </div>
        )}
        <p className="mute" style={{ fontSize: 11 }}>Racecards from the meetings feed. Per-runner prices aren&apos;t exposed by this API, so odds show as “—”.</p>
      </div>
    </div>
  );
}
