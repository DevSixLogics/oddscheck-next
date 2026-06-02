import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="OddsCheck.com home">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M5 12 10 17 19 7" stroke="#052026" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="logo-word">odds<b>check</b></span>
    </Link>
  );
}
