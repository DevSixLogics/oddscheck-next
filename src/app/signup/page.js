import Link from "next/link";
import Logo from "@/components/Logo";
import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Join free in 30 seconds — create your OddsCheck account",
  description: "Follow teams, leagues and bookmakers, get price alerts and track every bet. No card needed.",
};

export default function SignupPage() {
  return (
    <section className="auth-wrap">
      <div className="card auth-card" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ display: "inline-flex", justifyContent: "center" }}><Logo /></span>
        </div>
        <h1 style={{ fontSize: 26, textAlign: "center", marginBottom: 6 }}>Join free in 30 seconds</h1>
        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginBottom: 24 }}>
          187,420 sports fans already use OddsCheck. No card needed.
        </p>

        <div className="flex gap-2 mb-4" style={{ background: "var(--bg-2)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ flex: 1, padding: "8px 14px", background: "rgba(255,142,0,0.10)", borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: "center", color: "var(--accent)" }}>1 · Account</div>
          <div style={{ flex: 1, padding: "8px 14px", fontSize: 12, fontWeight: 500, textAlign: "center", color: "var(--text-mute)" }}>2 · Preferences</div>
          <div style={{ flex: 1, padding: "8px 14px", fontSize: 12, fontWeight: 500, textAlign: "center", color: "var(--text-mute)" }}>3 · Done</div>
        </div>

        <SignupForm />

        <div className="text-center mt-4 muted" style={{ fontSize: 13 }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </section>
  );
}
