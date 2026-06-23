"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useOddsFormat } from "./OddsFormatProvider";
import SocketStatus from "./SocketStatus";

// Fallback nav, used only if the CMS /settings menu is unavailable.
const NAV_FALLBACK = [
  { href: "/football", label: "Sports" },
  { href: "/live", label: "Live Odds" },
  { href: "/offers", label: "Offers" },
  { href: "/news", label: "News" },
  { href: "/experts", label: "Experts" },
  { href: "/guides", label: "Guides" },
  { href: "/tools", label: "Tools" },
];

// Pathnames that should light up the "Sports" nav item.
const SPORTS_PATHS = ["/football", "/racing", "/tennis", "/basketball", "/cricket", "/baseball", "/golf"];

const I = (paths) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
    {paths}
  </svg>
);

const ICONS = {
  football: I(
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="m12 5 4 3-1.5 5h-5L8 8l4-3Zm0 0v-2m4.5 10 4 1m-13-1-4 1m6 6-2 2m6-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),
  tennis: I(
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 9c5 1 11 1 17 0M3.5 15c5-1 11-1 17 0" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  basketball: I(
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 12h18M12 3v18M5 5c3 3 4 11 0 14m14-14c-3 3-4 11 0 14" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  cricket: I(
    <>
      <path d="m4 20 8-8 6-6-3-3-6 6-8 8 3 3Zm10-10 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  racing: I(
    <path d="M5 20c0-4 2-7 5-8l-1-3 4-4 3 2 2-2v3l-1 2 2 1c2 3 2 9 2 9h-3v-5l-3 1v4h-3v-5l-3 1v4H5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  ),
  nfl: I(
    <>
      <ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" strokeWidth="1.4" transform="rotate(-30 12 12)" />
      <path d="M10 12h4M11 10v4M13 10v4" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  baseball: I(
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 6c3 3 3 9 0 12M18 6c-3 3-3 9 0 12" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  golf: I(
    <>
      <path d="M10 4v12M10 4l6 2-6 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="10" cy="19" rx="6" ry="2" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  globe: I(
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  chevron: I(
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const SPORTS = [
  { href: "/football", label: "Football", icon: ICONS.football, route: true },
  { href: "/racing", label: "Horse Racing", icon: ICONS.racing, route: true },
  { href: "/tennis", label: "Tennis", icon: ICONS.tennis, route: true },
  { href: "/basketball", label: "Basketball", icon: ICONS.basketball, route: true },
  { href: "/cricket", label: "Cricket", icon: ICONS.cricket, route: true },
  { href: "/baseball", label: "Baseball", icon: ICONS.baseball, route: true },
  { href: "/golf", label: "Golf", icon: ICONS.golf, route: true },
];

const ODDS_FORMATS = ["Decimal", "Fractional", "American"];

export default function Header({ menu, logo }) {
  const pathname = usePathname();
  const NAV = Array.isArray(menu) && menu.length ? menu : NAV_FALLBACK;
  const [open, setOpen] = useState(false);
  const { fmt, setFmt } = useOddsFormat();
  const [fmtOpen, setFmtOpen] = useState(false);
  const fmtBtnRef = useRef(null);
  const [fmtPos, setFmtPos] = useState({ top: 0, right: 16 });

  // The subnav scrolls horizontally (overflow-x: auto), which would clip an
  // absolutely-positioned menu — so anchor a fixed-position menu to the button.
  const toggleFmt = () =>
    setFmtOpen((v) => {
      if (!v) {
        const r = fmtBtnRef.current?.getBoundingClientRect();
        if (r) setFmtPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
      }
      return !v;
    });

  const isActive = (item) =>
    item.label === "Sports" ? SPORTS_PATHS.includes(pathname) : pathname === item.href;

  return (
    <>
      <header className="topnav" role="banner">
        <div className="topnav-inner">
          <Logo src={logo} />
          <nav className="topnav-links" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href + item.label}
                className={`topnav-link${isActive(item) ? " active" : ""}`}
                href={item.href}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                aria-current={isActive(item) ? "page" : undefined}
              >
                {item.label === "Sports" && <span className="nav-dot" aria-hidden="true" />}
                {item.label}
              </Link>
            ))}
          </nav>
          <form className="topnav-search" role="search" action="/search" method="get">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <input className="input" type="search" name="q" placeholder="Search team, event, league, bookmaker" aria-label="Search" />
            <span className="kbd" aria-hidden="true">⌘K</span>
          </form>
          <div className="topnav-actions">
            <button
              type="button"
              className="nav-toggle"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="subnav" aria-label="Sports">
          <div className="subnav-inner">
            {SPORTS.map((s) =>
              s.route ? (
                <Link
                  key={s.label}
                  className={`subnav-link${pathname === s.href ? " active" : ""}`}
                  href={s.href}
                  aria-current={pathname === s.href ? "page" : undefined}
                >
                  {s.icon}
                  {s.label}
                </Link>
              ) : (
                <a key={s.label} className="subnav-link" href={s.href}>
                  {s.icon}
                  {s.label}
                </a>
              )
            )}
            <span className="subnav-spacer" />
            <Link className="subnav-link" href="/live">
              <SocketStatus label="Live now" />
            </Link>

            {/* Odds-format dropdown (the original "UK · Decimal ▾" affordance) */}
            <div style={{ position: "relative" }}>
              <button
                ref={fmtBtnRef}
                type="button"
                className="subnav-link"
                aria-haspopup="menu"
                aria-expanded={fmtOpen}
                onClick={toggleFmt}
                style={{ background: "none", border: 0, cursor: "pointer", font: "inherit" }}
              >
                {ICONS.globe} UK · {fmt} {ICONS.chevron}
              </button>
              {fmtOpen && (
                <>
                  {/* click-away backdrop */}
                  <div
                    onClick={() => setFmtOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 200 }}
                    aria-hidden="true"
                  />
                  <div
                    role="menu"
                    style={{
                      position: "fixed",
                      top: fmtPos.top,
                      right: fmtPos.right,
                      minWidth: 160,
                      background: "var(--bg-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                      padding: 6,
                      zIndex: 201,
                    }}
                  >
                    {ODDS_FORMATS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        role="menuitemradio"
                        aria-checked={fmt === f}
                        onClick={() => {
                          setFmt(f);
                          setFmtOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: 0,
                          cursor: "pointer",
                          font: "inherit",
                          fontSize: 13,
                          textAlign: "left",
                          background: fmt === f ? "rgba(255,142,0,0.10)" : "transparent",
                          color: fmt === f ? "var(--accent)" : "var(--text-2)",
                        }}
                      >
                        {f}
                        {fmt === f && (
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                            <path d="M5 12 10 17 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer (useState toggle replaces the original :target behavior) */}
      <div
        className={`drawer-backdrop${open ? " open" : ""}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <aside
        className={`drawer${open ? " open" : ""}`}
        aria-label="Mobile menu"
        aria-hidden={!open}
      >
        <div className="drawer-inner">
          <div className="drawer-head">
            <Logo src={logo} />
            <button type="button" className="btn btn-ghost btn-sm" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav className="drawer-nav" aria-label="Primary">
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            {NAV.map((item) => (
              <Link key={item.href + item.label} href={item.href} target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noopener noreferrer" : undefined} className={isActive(item) ? "active" : undefined} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="drawer-section-h">Sports</div>
          <nav className="drawer-nav" aria-label="Sports">
            {SPORTS.map((s) => (
              <Link key={s.label} href={s.href} onClick={() => setOpen(false)}>{s.label}</Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
