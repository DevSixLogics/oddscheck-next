"use client";

import { useState } from "react";
import ArticleCard from "./ArticleCard";

const PAGE_SIZE = 9;

/** Article grid for a single category, with gated pagination (pager shows only
 *  when there are more than PAGE_SIZE articles). */
export default function CategoryGrid({ articles = [] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const items = articles.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (articles.length === 0) {
    return <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>Nothing here right now.</div>;
  }

  return (
    <div className="flex-col gap-4">
      <div className="grid grid-3">
        {items.map((a) => <ArticleCard key={a.id || a.slug} a={a} />)}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          {current > 1 && <button type="button" className="page" onClick={() => setPage(current - 1)}>‹</button>}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button type="button" key={p} className={`page${p === current ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          {current < totalPages && <button type="button" className="page" onClick={() => setPage(current + 1)}>›</button>}
        </div>
      )}
    </div>
  );
}
