import Link from "next/link";
import HeroSearch from "./HeroSearch";
import TopOddsWidget from "./TopOddsWidget";

const HERO_FEATURES = [
  { label: "Live price updates", icon: (<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" /></svg>) },
  { label: "Best odds highlighted", icon: (<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" /></svg>) },
  { label: "Expert insights", icon: (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>) },
  { label: "Responsible betting", icon: (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>) },
];

// Static marketing data — no API source.
const STATS = [
  { val: "120+", label: "bookmakers compared" },
  { val: "8+", label: "sports & 8,400 leagues" },
  { val: "60+", label: "Multiple Markets" },
  { val: "14.7%", label: "avg. value gained vs single book" },
  { val: "4.8★", label: "iOS & Android" },
];

/** Homepage hero — marketing copy + search + the data-driven live-odds widget. */
export default function Hero({ matches, liveCount }) {
  return (
    <section className="hero bg-radial-green bg-grid">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="chip chip-best" style={{ marginBottom: 24 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M13 2 4 13h7l-1 9 9-11h-7l1-9Z" />
              </svg>
              {liveCount > 0 ? `${liveCount} matches live now` : "Live odds comparison"}
            </span>
            <h1 style={{ fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.05 }}>
              Compare live odds<br />from <span className="hero-gradient-text">top bookmakers.</span>
            </h1>
            <p className="lede">
              Find the best price across football, racing, tennis, basketball, cricket and
              more — with expert tips, odds movement and smart tools, all in one place.
            </p>
            <HeroSearch />
            <div className="flex gap-3 flex-wrap">
              <Link className="btn btn-primary btn-lg" href="/football">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                  <path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Compare Live Odds
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/tips">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />
                </svg>
                View Today&apos;s Tips
              </Link>
            </div>

            <div className="flex gap-6 flex-wrap" style={{ marginTop: 32, fontSize: 13, color: "var(--text-2)" }}>
              {HERO_FEATURES.map((f) => (
                <span className="flex items-center gap-2" key={f.label}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.10)", color: "var(--accent)" }}>
                    {f.icon}
                  </span>
                  {f.label}
                </span>
              ))}
            </div>
          </div>
          <TopOddsWidget matches={matches} />
        </div>

        <div className="stat-strip">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-val num">{s.val}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
