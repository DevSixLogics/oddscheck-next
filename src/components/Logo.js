import Link from "next/link";
import Image from "next/image";

export default function Logo({ height = 44 }) {
  return (
    <Link href="/" className="logo" aria-label="OddsCheck.com home">
      <Image
        src="/oddscheck.png"
        alt="OddsCheck"
        width={272}
        height={88}
        priority
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
