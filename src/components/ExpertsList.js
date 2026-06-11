"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const PAGE_SIZE = 9;

// Bookmaker brand classes that have a styled badge in globals.scss (hyphen-stripped slug).
const BRANDS = new Set(["bet365", "williamhill", "paddypower", "skybet", "ladbrokes", "coral", "betvictor", "betfair", "unibet", "888sport"]);
const brandKey = (slug = "") => slug.replace(/-/g, "");
function brandCode(name = "") {
  const n = name.trim().toUpperCase();
  if (n.length <= 8) return n;
  const parts = n.split(/\s+/);
  if (parts.length > 1) return `${parts[0][0]}.${parts[1]}`.slice(0, 8);
  return n.slice(0, 8);
}

const SORTS = [
  { key: "posts", label: "Most articles" },
  { key: "az", label: "A–Z" },
];

function ExpertCard({ a }) {
  const key = brandKey(a.slug);
  const isBrand = BRANDS.has(key);
  return (
    <Link className="card" href={`/experts/${a.slug}`} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12, minHeight: 168 }}>
      <div className="flex items-center gap-3">
        {isBrand
          ? <span className={`bm bm-lg bm-${key}`}>{brandCode(a.name)}</span>
          : <span style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,142,0,0.12)", color: "var(--accent)", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{a.name.charAt(0).toUpperCase()}</span>}
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{a.name}</div>
          <div className="mute" style={{ fontSize: 12 }}>{isBrand ? "Bookmaker" : "Contributor"}</div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>
        {a.bio || (isBrand ? "Welcome offers, free bets and boosts from this bookmaker." : "Betting tips, previews and analysis.")}
      </p>
      <div className="flex justify-between items-center" style={{ fontSize: 12 }}>
        <span className="mute">{a.postCount ?? 0} article{a.postCount === 1 ? "" : "s"}</span>
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>View author →</span>
      </div>
    </Link>
  );
}

export default function ExpertsList({ authors = [] }) {
  const [type, setType] = useState("all"); // all | bookmaker | contributor
  const [sort, setSort] = useState("posts");
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [type, sort]); // reset to first page when filters change

  const counts = useMemo(() => {
    let bookmaker = 0, contributor = 0;
    for (const a of authors) (BRANDS.has(brandKey(a.slug)) ? bookmaker++ : contributor++);
    return { all: authors.length, bookmaker, contributor };
  }, [authors]);

  const TYPES = [
    { key: "all", label: "All experts", count: counts.all },
    { key: "bookmaker", label: "Bookmakers", count: counts.bookmaker },
    { key: "contributor", label: "Writers", count: counts.contributor },
  ];

  const shown = useMemo(() => {
    let list = authors.filter((a) => {
      const isBrand = BRANDS.has(brandKey(a.slug));
      if (type === "bookmaker") return isBrand;
      if (type === "contributor") return !isBrand;
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "az" ? a.name.localeCompare(b.name) : (b.postCount || 0) - (a.postCount || 0)
    );
    return list;
  }, [authors, type, sort]);

  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="layout-split">
      <aside className="flex-col gap-4">
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ fontSize: 13, marginBottom: 12 }}>Filters</h4>
          <div className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Type</div>
          <div className="flex-col gap-2">
            {TYPES.map((t) => (
              <label key={t.key} className="radio" style={{ justifyContent: "space-between", width: "100%", cursor: "pointer" }}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="expert-type" checked={type === t.key} onChange={() => setType(t.key)} />
                  {t.label}
                </span>
                <span className="mute" style={{ fontSize: 11 }}>{t.count}</span>
              </label>
            ))}
          </div>

          <div className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 10px", paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>Sort by</div>
          <div className="flex-col gap-2">
            {SORTS.map((s) => (
              <label key={s.key} className="radio" style={{ cursor: "pointer" }}>
                <input type="radio" name="expert-sort" checked={sort === s.key} onChange={() => setSort(s.key)} />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-col gap-4">
        <div className="muted" style={{ fontSize: 13 }}>
          Showing <b style={{ color: "var(--text)" }}>{shown.length}</b> of {authors.length} experts
        </div>
        {shown.length === 0 ? (
          <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>No experts match this filter.</div>
        ) : (
          <>
            <div className="grid grid-2">
              {pageItems.map((a) => <ExpertCard key={a.slug} a={a} />)}
            </div>
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 4 }}>
                {current > 1 && <button type="button" className="page" onClick={() => setPage(current - 1)}>‹</button>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button type="button" key={p} className={`page${p === current ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                {current < totalPages && <button type="button" className="page" onClick={() => setPage(current + 1)}>›</button>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
