"use client";

import { useState } from "react";
import ArticleCard from "./ArticleCard";

/**
 * Category-driven article browser. `categories` = [{ name, count }]; on tab click
 * it fetches /api/articles?category=<name> and shows that category's articles.
 * `initial` seeds the first ("All") tab so the page isn't empty on load.
 */
export default function CategoryArticles({ categories = [], initial = [] }) {
  const tabs = [{ name: "All", count: initial.length }, ...categories];
  const [active, setActive] = useState("All");
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function select(name) {
    if (name === active) return;
    setActive(name);
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?category=${encodeURIComponent(name)}`);
      const json = await res.json();
      setItems(Array.isArray(json.articles) ? json.articles : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.name}
              type="button"
              className={`tab${t.name === active ? " active" : ""}`}
              onClick={() => select(t.name)}
              style={{ cursor: "pointer", background: "none", border: 0, font: "inherit" }}
            >
              {t.name}{typeof t.count === "number" ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          {loading ? "Loading…" : `${items.length} article${items.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>
          No articles in this category yet.
        </div>
      ) : (
        <div className="grid grid-3" style={{ opacity: loading ? 0.5 : 1, transition: "opacity .15s" }}>
          {items.map((a) => <ArticleCard key={a.id || a.slug} a={a} />)}
        </div>
      )}
    </div>
  );
}
