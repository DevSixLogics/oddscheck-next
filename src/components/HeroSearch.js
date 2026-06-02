"use client";

import { useRouter } from "next/navigation";

// Hero search form — mirrors the original index.html design (card + icon + input
// + "Football" chip + Search button). Submitting routes to the football page.
export default function HeroSearch() {
  const router = useRouter();

  function onSubmit(e) {
    e.preventDefault();
    const q = e.currentTarget.elements.q?.value?.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      className="card"
      role="search"
      onSubmit={onSubmit}
      style={{
        padding: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: 580,
        marginBottom: 22,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0 6px 0 12px",
          color: "var(--text-mute)",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <input
        className="input"
        name="q"
        style={{ background: "transparent", border: 0, padding: "10px 0" }}
        placeholder="Search team, event, league or bookmaker"
        aria-label="Search"
      />
      <span className="chip chip-muted" style={{ padding: "4px 8px", fontSize: 11 }}>
        Football
      </span>
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
}
