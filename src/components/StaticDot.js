// Small red dot that flags a section as static (no API data).
export default function StaticDot() {
  return (
    <span
      title="Static section — no API data"
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#FF4D67",
        boxShadow: "0 0 0 3px rgba(255,77,103,0.10), 0 12px 32px rgba(255,77,103,0.35)",
      }}
    />
  );
}
