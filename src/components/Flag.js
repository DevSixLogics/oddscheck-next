"use client";

import { useState } from "react";
import { leagueFlagURL } from "@/lib/images";

/**
 * League / tournament country flag, served from the app's own static assets
 * (/ip/assets/images/flags/country_{fid}.png). Renders nothing if there's no fid
 * or the file 404s. Country flags are sport-agnostic, so only `fid` is needed.
 */
export default function Flag({ fid, size = 16 }) {
  const [failed, setFailed] = useState(false);
  const url = leagueFlagURL(fid);
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
