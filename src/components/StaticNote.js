// Marks a section as static placeholder content because the CMS feed has no data
// for it yet (offers, tips, news, odds, analytics). See the coverage-map docs.
export default function StaticNote({ children = "Static placeholder — no API data available for this section yet." }) {
  return (
    <div
      style={{
        marginTop: 10,
        fontSize: 11,
        color: "var(--text-mute, #5A6680)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent, #DAB46B)" }}
      />
      {children}
    </div>
  );
}
