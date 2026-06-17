import Link from "next/link";

// `src` is CMS-driven (settings header_/footer_ logo); falls back to the bundled
// asset only when the CMS provides none. Plain <img> so any remote logo aspect
// ratio renders correctly (height fixed, width auto).
export default function Logo({ src, height = 44, alt = "OddsCheck" }) {
  return (
    <Link href="/" className="logo" aria-label="OddsCheck.com home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src || "/oddscheck.png"} alt={alt} style={{ height, width: "auto" }} />
    </Link>
  );
}
