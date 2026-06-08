import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <h1 style={{ fontSize: 64, marginBottom: 8 }}>404</h1>
        <p className="sub" style={{ marginBottom: 24 }}>That page doesn’t exist or has moved.</p>
        <Link className="btn btn-primary btn-lg" href="/">Back to home</Link>
      </div>
    </section>
  );
}