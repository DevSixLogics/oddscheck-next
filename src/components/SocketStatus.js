"use client";

import { useEffect, useState } from "react";
import useSocket from "@/hooks/useSocket";
import { SOCKET_URL } from "@/lib/socket";

/**
 * Tiny live-connection indicator: green + glowing when the socket is connected,
 * muted grey when it's offline. Mounting it (in the global header) also opens
 * the shared socket app-wide so every live surface reuses one connection.
 */
export default function SocketStatus({ label = "Live" }) {
  const socket = useSocket(SOCKET_URL);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const io = socket?.connector?.socket;
    if (!io) return;
    const onUp = () => setConnected(true);
    const onDown = () => setConnected(false);
    setConnected(!!io.connected);
    io.on("connect", onUp);
    io.on("reconnect", onUp);
    io.on("disconnect", onDown);
    io.on("connect_error", onDown);
    return () => {
      io.off("connect", onUp);
      io.off("reconnect", onUp);
      io.off("disconnect", onDown);
      io.off("connect_error", onDown);
    };
  }, [socket]);

  return (
    <span
      title={connected ? "Live socket connected" : "Live socket offline — showing last fetched data"}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: connected ? "#2ECC71" : "var(--text-mute)",
          boxShadow: connected ? "0 0 8px rgba(46,204,113,0.7)" : "none",
          transition: "background .2s",
        }}
      />
      {label}
    </span>
  );
}
