import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="OddsCheck.com home">
      <Image
        src="/oddscheck.png"
        alt="OddsCheck"
        width={272}
        height={88}
        priority
        style={{ height: 32, width: "auto" }}
      />
    </Link>
  );
}
