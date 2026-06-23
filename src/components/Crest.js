"use client";

import { useState } from "react";
import { initials } from "@/lib/format";
import { teamImageURL } from "@/lib/images";

// Stable gradient from the team id/name — used as the fallback badge when the
// real logo is missing or fails to load.
function hueFor(seed = "") {
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export default function Crest({ name, id, sport = "football", size }) {
  const [failed, setFailed] = useState(false);
  const cls = `crest${size === "xl" ? " crest-xl" : size === "lg" ? " crest-lg" : ""}`;
  const url = teamImageURL(id, sport, name);

  // No usable id, or the image request errored → local initials gradient badge.
  // (The service itself renders an initials placeholder when a logo is missing,
  // so `failed` only fires on a real network/host error.)
  if (!url || failed) {
    const h = hueFor(id || name);
    return (
      <span
        className={cls}
        style={{ background: `linear-gradient(135deg, hsl(${h} 55% 45%) 0%, hsl(${(h + 40) % 360} 60% 28%) 100%)` }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cls}
      src={url}
      alt={name ? `${name} crest` : ""}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{ objectFit: "contain", background: "rgba(255,255,255,0.06)", padding: 2 }}
    />
  );
}
