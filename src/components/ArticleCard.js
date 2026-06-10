import Link from "next/link";

// Bookmaker brand classes that have a styled badge in globals.scss.
const BRANDS = new Set(["bet365", "williamhill", "paddypower", "skybet", "ladbrokes", "coral", "betvictor", "betfair", "unibet", "888sport"]);

function brandCode(name = "") {
  const n = name.trim().toUpperCase();
  if (n.length <= 8) return n;
  const parts = n.split(/\s+/);
  if (parts.length > 1) return `${parts[0][0]}.${parts[1]}`.slice(0, 8);
  return n.slice(0, 8);
}

function keyChip(kv = "") {
  const raw = String(kv).trim();
  // Ignore junk/placeholder values like "{'key':'value'}" or any JSON-ish string.
  if (!raw || /[{}:[\]"']/.test(raw)) return null;
  const txt = raw.split(",").map((s) => s.trim()).filter(Boolean).join(" ");
  if (!txt) return null;
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(s = "") {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return "";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** A single article summary card — shared by the category browser and category pages. */
export default function ArticleCard({ a }) {
  const name = a.authorName || a.subjects?.[0]?.name || "OddsCheck";
  const slug = (a.authorSlug || "").toLowerCase();
  const isBrand = BRANDS.has(slug);
  const chip = keyChip(a.key_values);
  return (
    <article className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="flex justify-between items-start gap-3">
        <span className="flex items-center gap-2">
          {isBrand
            ? <span className={`bm bm-md bm-${slug}`}>{brandCode(name)}</span>
            : <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(255,142,0,0.12)", color: "var(--accent)", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{name.charAt(0).toUpperCase()}</span>}
          <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
        </span>
        {chip && <span className="chip chip-best" style={{ fontSize: 10, padding: "2px 8px" }}>{chip}</span>}
      </div>
      <h3 style={{ fontSize: 18, lineHeight: 1.3 }}>
        <Link href={`/article?slug=${a.slug}`}>{a.headline}</Link>
      </h3>
      {a.strapline && <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>{a.strapline}</p>}
      <div className="flex justify-between items-center mute" style={{ fontSize: 12, marginTop: 2 }}>
        <span>{fmtDate(a.start_date)}{a.categoryName ? ` · ${a.categoryName}` : ""}</span>
        <Link href={`/article?slug=${a.slug}`} style={{ color: "var(--accent)", fontWeight: 600 }}>Read article →</Link>
      </div>
    </article>
  );
}
