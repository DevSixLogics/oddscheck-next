import Link from "next/link";
import ScoresResults from "./ScoresResults";

/** "Scores & results" section — DATA-DRIVEN from the football feed. */
export default function ScoresSection({ matches }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Now &amp; next · live data</div>
            <h2>Scores &amp; results</h2>
            <p className="sub">Live matches, today&apos;s fixtures and finished results, straight from the feed.</p>
          </div>
          <Link className="btn btn-outline btn-sm" href="/live">All live →</Link>
        </div>
        <ScoresResults matches={matches} />
      </div>
    </section>
  );
}
