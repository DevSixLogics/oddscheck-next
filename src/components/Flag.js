"use client";

import { useState } from "react";
import { leagueFlagURL } from "@/lib/images";

/** League / tournament country flag. Renders nothing if missing or it 404s. */
export default function Flag({ fid, sport = "football", size = 16 }) {
  const [failed, setFailed] = useState(false);
  const url = leagueFlagURL(fid, sport);
  if (!url || failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{ borderRadius: 3, objectFit: "contain", flexShrink: 0, verticalAlign: "middle" }}
    />
  );
}
