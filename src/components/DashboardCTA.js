import Link from "next/link";

const sv = (paths, fill = "none", w = 14) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill={fill} aria-hidden="true">{paths}</svg>
);

const FEATURES = [
  { title: "Favourite teams", desc: "Get a personalised feed", icon: sv(<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />, "none", 16) },
  { title: "Favourite leagues", desc: "Top markets, every matchday", icon: sv(<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 19h6M12 14v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />) },
  { title: "Preferred bookmakers", desc: "Compare only what you bet at", icon: sv(<path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />, "currentColor") },
  { title: "Odds alerts", desc: "Ping when a price hits your target", icon: sv(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16) },
  { title: "Track line movement", desc: "See where sharp money goes", icon: sv(<><path d="m3 17 6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>) },
  { title: "Bet tracker & ROI", desc: "P&L by sport, market & book", icon: sv(<><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>, "none", 16) },
];

const star = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" />
  </svg>
);

/** "Build your personal betting dashboard" CTA — static (marketing). */
export default function DashboardCTA() {
  return (
    <section className="section">
      <div className="container">
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            background: "linear-gradient(135deg, #0E1729 0%, #0F2333 60%, #2A1A05 100%)",
            borderColor: "rgba(255,142,0,0.30)",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: -100, right: -50, width: 480, height: 480, background: "radial-gradient(circle, rgba(255,142,0,0.18), transparent 60%)" }} />
          <div className="grid grid-2 allow-mobile-split" style={{ gap: 48, padding: "52px 56px", position: "relative" }}>
            <div>
              <span className="chip chip-best" style={{ marginBottom: 18 }}>Free forever</span>
              <h2 style={{ fontSize: 42, marginBottom: 16, lineHeight: 1.05 }}>The smartest way to<br />bet on every match.</h2>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
                OddsCheck compares the best price across top bookmakers, follows live scores
                as they happen, and gives you free pro-grade calculators — football, racing,
                tennis, cricket and more, all in one place.
              </p>
              <div className="flex gap-3 mb-4 flex-wrap">
                <Link className="btn btn-primary btn-lg" href="/live">Compare live odds</Link>
                <Link className="btn btn-ghost btn-lg" href="/tools">Try the free tools</Link>
              </div>
              <div className="flex items-center gap-4 flex-wrap mute" style={{ fontSize: 13 }}>
                <div className="flex items-center gap-1">
                  <div className="flex" style={{ marginRight: 4 }}>
                    {["#FF8E00", "#DAB46B", "#3B82F6", "#EC4899"].map((c, i) => (
                      <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: "2px solid var(--bg-1)", marginLeft: i === 0 ? 0 : -8 }} />
                    ))}
                  </div>
                  <b style={{ color: "var(--text)" }}>187,420</b> active members
                </div>
                <span className="flex items-center gap-1" style={{ color: "var(--gold)" }}>
                  {star}{star}{star}{star}{star}
                  <b style={{ color: "var(--text)", marginLeft: 4 }}>4.8</b> on iOS &amp; Android
                </span>
              </div>
            </div>

            <div className="grid grid-2 allow-mobile-split" style={{ gap: 12 }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ padding: 16, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,142,0,0.12)", display: "grid", placeItems: "center", color: "var(--accent)", marginBottom: 10 }}>
                    {f.icon}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
