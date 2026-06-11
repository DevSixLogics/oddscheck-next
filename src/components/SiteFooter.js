import Link from "next/link";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Sports",
    links: [
      ["Football Odds", "/football"],
      ["Horse Racing Odds", "/racing"],
      ["Tennis Odds", "/tennis"],
      ["Basketball Odds", "/basketball"],
    ],
  },
  {
    title: "Tools",
    links: [
      ["Odds Calculator", "/odds-calculator"],
      ["Implied Probability", "/tools"],
      ["Accumulator Calculator", "/tools"],
      ["EV Calculator", "/tools"],
      ["Bet Tracker", "/dashboard"],
      ["Line Movement", "/live"],
    ],
  },
  {
    title: "Guides",
    links: [
      ["How to Bet", "/guide"],
      ["How to Read Odds", "/guide"],
      ["Value Betting Explained", "/guide"],
      ["Free Bets Explained", "/guide"],
      ["Responsible Gambling", "/responsible-gambling"],
    ],
  },
  {
    title: "Bookmakers",
    links: [
      ["Best Betting Sites", "/experts"],
      ["Sportsbook Reviews", "/experts"],
      ["Free Bet Offers", "/offers"],
      ["New Customer Offers", "/offers"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Responsible Gambling", "/responsible-gambling"],
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-intro">
            <Logo height={56} />
            <p>
              Live odds comparison and betting intelligence across football, racing, tennis,
              basketball and 30+ sports. Built for serious sports fans.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={label + href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rg-banner">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ flex: 1 }}>
            <b>18+ only · Gamble responsibly.</b> When the fun stops, stop. T&amp;Cs apply to all
            offers. OddsCheck.com promotes safer gambling and links to BeGambleAware, GamCare and GAMSTOP.
          </div>
          <Link className="btn btn-outline btn-sm" href="/responsible-gambling">Safer gambling →</Link>
        </div>
        <div className="footer-base">
          <div>© 2026 OddsCheck.com · Affiliate disclosure: we may earn a commission from bookmakers linked above.</div>
          <div className="footer-marks">
            <span>BeGambleAware</span>
            <span>GamCare</span>
            <span>GAMSTOP</span>
            <span className="chip chip-muted">18+</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
