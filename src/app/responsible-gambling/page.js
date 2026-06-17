import Link from "next/link";

export const metadata = { alternates: { canonical: "/responsible-gambling" } };

const ic = (paths, fill = "none", w = 18) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill={fill} aria-hidden="true">{paths}</svg>
);

// Safer-gambling controls every licensed UK operator must offer.
const TOOLS = [
  {
    title: "Set deposit limits",
    desc: "Cap how much you can pay in per day, week or month. Increases take effect after a cooling-off period; decreases apply straight away.",
    icon: ic(<><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" /></>),
  },
  {
    title: "Take a time-out",
    desc: "A short break — 24 hours up to 6 weeks. Your account locks for the period you choose and reopens automatically afterwards.",
    icon: ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>),
  },
  {
    title: "Reality checks",
    desc: "Get an on-screen reminder of how long you've been playing and how much you've staked, so a session never quietly runs away from you.",
    icon: ic(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>),
  },
  {
    title: "Self-exclude",
    desc: "Block yourself from one operator for 6–12 months, or from every UK online site at once for free through GamStop.",
    icon: ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="m6 6 12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>),
  },
];

// Honest, plain-English warning signs.
const SIGNS = [
  "Betting more than you can comfortably afford to lose",
  "Chasing losses — staking more to win back what you've lost",
  "Borrowing money or selling things to fund gambling",
  "Gambling to escape stress, boredom or low mood",
  "Lying to family or friends about how much you bet",
  "Feeling anxious, guilty or irritable when you can't play",
];

// Real UK help organisations — free and confidential.
const HELP = [
  {
    name: "National Gambling Helpline",
    detail: "Free, confidential support 24/7, run by GamCare. Talk it through on the phone or live chat.",
    action: "0808 8020 133",
    href: "tel:08088020133",
    tag: "24/7 · Freephone",
  },
  {
    name: "GamCare",
    detail: "Information, advice and free counselling for anyone affected by problem gambling — including friends and family.",
    action: "gamcare.org.uk",
    href: "https://www.gamcare.org.uk",
    tag: "Support & counselling",
  },
  {
    name: "GamStop",
    detail: "A free scheme that lets you self-exclude from every UK-licensed online gambling site in one place.",
    action: "gamstop.co.uk",
    href: "https://www.gamstop.co.uk",
    tag: "Self-exclusion",
  },
  {
    name: "BeGambleAware",
    detail: "Free, independent advice, a self-assessment tool and a directory of treatment near you.",
    action: "begambleaware.org",
    href: "https://www.begambleaware.org",
    tag: "Advice & tools",
  },
  {
    name: "Gamblers Anonymous",
    detail: "A fellowship of people who share their experience to help each other recover, with meetings across the UK.",
    action: "gamblersanonymous.org.uk",
    href: "https://www.gamblersanonymous.org.uk",
    tag: "Peer support",
  },
  {
    name: "Gamban",
    detail: "Software that blocks gambling websites and apps across all your devices — a useful companion to self-exclusion.",
    action: "gamban.com",
    href: "https://www.gamban.com",
    tag: "Blocking software",
  },
];

const TIPS = [
  "Only ever bet money you can afford to lose.",
  "Set a budget and a time limit before you start — and stick to both.",
  "Treat any winnings as a bonus, not income you can rely on.",
  "Never chase your losses; walk away and come back another day.",
  "Don't gamble when you're upset, stressed or under the influence.",
  "Take regular breaks and keep gambling one hobby among many.",
];

export default function ResponsibleGamblingPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: "40px 0 28px", background: "linear-gradient(180deg, rgba(255,77,103,0.05) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Responsible gambling</span></li>
            </ol>
          </nav>
          <span className="chip mb-3" style={{ marginTop: 12, background: "rgba(255,77,103,0.10)", color: "#FF8095", border: "1px solid rgba(255,77,103,0.25)" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Safer gambling · 18+
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "10px 0" }}>Stay in control</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 680, lineHeight: 1.55 }}>
            OddsCheck is a comparison site — we don&apos;t take bets. But we care that betting stays fun.
            Set your own limits, learn the warning signs, and if it ever stops being a game, free and
            confidential help is one call away.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container flex-col gap-7">
          {/* Emergency help banner */}
          <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, rgba(255,77,103,0.10), rgba(255,77,103,0.03))", borderColor: "rgba(255,77,103,0.30)" }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(255,77,103,0.15)", color: "#FF6378", flexShrink: 0 }}>
                  {ic(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>, "none", 22)}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Need to talk to someone now?</div>
                  <div className="muted" style={{ fontSize: 13 }}>The National Gambling Helpline is free, confidential and open 24/7.</div>
                </div>
              </div>
              <a className="btn btn-lg" href="tel:08088020133" style={{ background: "#FF4D67", color: "#fff", borderColor: "#FF4D67" }}>Call 0808 8020 133</a>
            </div>
          </div>

          {/* Safer-gambling tools */}
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Tools to stay in control</h2>
            <p className="sub" style={{ marginBottom: 18 }}>Every UK-licensed bookmaker must offer these. Use them before you ever feel you need to.</p>
            <div className="grid grid-4">
              {TOOLS.map((t) => (
                <div className="card" key={t.title} style={{ padding: 22 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.10)", color: "var(--accent)", border: "1px solid rgba(255,142,0,0.20)", marginBottom: 14 }}>{t.icon}</span>
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{t.title}</h3>
                  <p className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning signs + golden rules, side by side */}
          <div className="grid grid-2" style={{ gap: 24, alignItems: "start" }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 6 }}>Signs it might be a problem</h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Recognising any of these in yourself — or someone close to you — is a reason to reach out.</p>
              <ul className="flex-col gap-3" style={{ listStyle: "none", padding: 0 }}>
                {SIGNS.map((s) => (
                  <li key={s} className="flex items-start gap-3" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
                    <span style={{ color: "#FF6378", marginTop: 2, flexShrink: 0 }}>
                      {ic(<><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>, "none", 16)}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 22, marginBottom: 6 }}>Six golden rules</h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Simple habits that keep betting where it belongs — a bit of fun.</p>
              <ul className="flex-col gap-3" style={{ listStyle: "none", padding: 0 }}>
                {TIPS.map((t) => (
                  <li key={t} className="flex items-start gap-3" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }}>
                      {ic(<path d="m20 6-11 11L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />, "none", 16)}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Where to get help */}
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Where to get help</h2>
            <p className="sub" style={{ marginBottom: 18 }}>All free, all confidential. You don&apos;t have to wait until things feel out of hand.</p>
            <div className="grid grid-3">
              {HELP.map((h) => (
                <a key={h.name} className="card" href={h.href} target={h.href.startsWith("http") ? "_blank" : undefined} rel={h.href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, minHeight: 190 }}>
                  <span className="chip chip-muted" style={{ alignSelf: "flex-start", fontSize: 10, padding: "2px 8px" }}>{h.tag}</span>
                  <h3 style={{ fontSize: 17 }}>{h.name}</h3>
                  <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>{h.detail}</p>
                  <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>{h.action} →</span>
                </a>
              ))}
            </div>
          </div>

          {/* Our commitment */}
          <div className="card" style={{ padding: 36, background: "linear-gradient(135deg, #0E1729, #0F2333 60%, #2A1A05)", borderColor: "rgba(255,142,0,0.25)" }}>
            <div className="grid grid-2" style={{ gap: 40, alignItems: "center" }}>
              <div>
                <span className="chip chip-best mb-3">Our commitment</span>
                <h2 style={{ fontSize: 26, margin: "12px 0" }}>We&apos;re built to be used in moderation</h2>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  OddsCheck shows you the best price across bookmakers — it never encourages you to bet
                  more, more often, or on credit. We display 18+ and safer-gambling messaging across the
                  site, and we&apos;ll always point you to independent help rather than a sign-up button.
                </p>
              </div>
              <ul className="flex-col gap-2" style={{ fontSize: 13, listStyle: "none", padding: 0 }}>
                {["You must be 18 or over to gamble", "We never offer betting accounts or take stakes", "We promote, not paywall, safer-gambling tools", "Treatment and advice links are independent & free"].map((f) => (
                  <li key={f} className="flex items-start gap-2"><span style={{ color: "var(--accent)" }}>✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer banner */}
          <div className="rg-banner" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 13 }}>
              <b>18+ · When the fun stops, stop.</b> Gamble responsibly. For free, confidential support call the
              National Gambling Helpline on <b>0808 8020 133</b> or visit <b>begambleaware.org</b>.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
