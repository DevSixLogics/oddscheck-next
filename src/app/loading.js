// Global route-loading fallback shown while a server segment streams in.
export default function Loading() {
  return (
    <section className="section" aria-busy="true" aria-live="polite">
      <div className="container" style={{ padding: "48px 0" }}>
        <div className="skeleton" style={{ height: 32, width: "40%", borderRadius: 8, marginBottom: 20 }} />
        <div className="grid grid-3" style={{ gap: 20 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: 18 }}>
                <div className="skeleton" style={{ height: 14, width: "90%", borderRadius: 6, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    </section>
  );
}
