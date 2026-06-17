"use client";

// Global route-error boundary. Catches render/data errors in any route segment
// and offers a recovery action instead of a blank crash.
export default function Error({ error, reset }) {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", padding: "80px 0", maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Something went wrong</h1>
        <p className="sub" style={{ marginBottom: 24 }}>
          We hit a snag loading this page. This is usually temporary — please try again.
        </p>
        {process.env.NODE_ENV !== "production" && error?.message && (
          <pre style={{ textAlign: "left", whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.7, marginBottom: 24 }}>
            {error.message}
          </pre>
        )}
        <button className="btn btn-primary btn-lg" type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </section>
  );
}
