"use client";

import { useRouter, usePathname } from "next/navigation";

// Format a Date as YYYY-MM-DD using LOCAL parts (never UTC) to avoid
// timezone drift where +1 day round-trips back to the same calendar day.
function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shift(date, days) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return fmt(dt);
}

/** Date picker that navigates the current page to ?date=YYYY-MM-DD. */
export default function DateNav({ date }) {
  const router = useRouter();
  const pathname = usePathname();
  const today = fmt(new Date());
  // Only today + future are browsable — back dates (finished matches) are hidden.
  const atToday = date <= today;
  // push to the new ?date, then refresh so the server component re-renders with
  // the new date even if the client Router Cache still holds the old searchParams.
  const go = (d) => {
    if (d < today) return; // never navigate into the past
    router.push(`${pathname}?date=${d}`);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(shift(date, -1))} disabled={atToday} aria-label="Previous day" style={{ flexShrink: 0, opacity: atToday ? 0.4 : 1, cursor: atToday ? "not-allowed" : "pointer" }}>‹</button>
      <input
        className="input input-sm"
        type="date"
        value={date}
        min={today}
        onChange={(e) => e.target.value && go(e.target.value)}
        aria-label="Pick a date"
        style={{ width: 160, flexShrink: 0, colorScheme: "dark" }}
      />
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(shift(date, 1))} aria-label="Next day" style={{ flexShrink: 0 }}>›</button>
      {date !== today && (
        <button type="button" className="btn btn-outline btn-sm" onClick={() => go(today)} style={{ flexShrink: 0 }}>Today</button>
      )}
    </div>
  );
}
