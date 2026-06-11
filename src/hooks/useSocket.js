"use client";

import { useEffect, useState } from "react";

/**
 * Shared Laravel Echo (socket.io v2) connection for live match data.
 * Returns the Echo instance (or null until ready). Consumers call
 * `.channel(name).listen(event, handler)` on it and must ONLY
 * `channel.stopListening(event, handler)` on cleanup — never disconnect the
 * raw socket (that would kill live updates for every other component).
 *
 * Echo + socket.io are imported dynamically so they never run during SSR.
 */
export default function useSocket(url) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!url || typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      try {
        const { default: Echo } = await import("laravel-echo");
        const io = (await import("socket.io-client")).default || (await import("socket.io-client"));
        if (cancelled) return;
        window.io = io; // laravel-echo's socket.io broadcaster reads window.io
        if (!window.Echo) {
          window.Echo = new Echo({
            broadcaster: "socket.io",
            host: url,
            transports: ["websocket", "polling"],
          });
        }
        setSocket(window.Echo);
      } catch (err) {
        // Socket is an enhancement — if it can't load, the page still shows
        // the server-fetched data. Don't crash the UI.
        console.warn("[useSocket] could not initialise:", err?.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return socket;
}
