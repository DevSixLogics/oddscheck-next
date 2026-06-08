import { initials } from "@/lib/format";

// The API has no team logo or colour (only htid/atid). We derive a stable
// gradient from the team id/name so each club still gets a consistent badge.
function hueFor(seed = "") {
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export default function Crest({ name, id, size }) {
  const h = hueFor(id || name);
  const style = {
    background: `linear-gradient(135deg, hsl(${h} 55% 45%) 0%, hsl(${(h + 40) % 360} 60% 28%) 100%)`,
  };
  return (
    <span className={`crest${size === "xl" ? " crest-xl" : ""}`} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
