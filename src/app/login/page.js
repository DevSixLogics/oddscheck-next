import Link from "next/link";
import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Sign in — OddsCheck",
  description: "Sign in to your OddsCheck account to follow teams, track bets and get price alerts.",
};

export default function LoginPage() {
  return (
    <section className="auth-wrap">
      <div className="card auth-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ display: "inline-flex", justifyContent: "center" }}><Logo /></span>
        </div>
        <h1 style={{ fontSize: 24, textAlign: "center", marginBottom: 6 }}>Sign in</h1>
        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginBottom: 24 }}>
          Welcome back — your dashboard is waiting.
        </p>

        <LoginForm />

        <div className="flex items-center gap-3" style={{ margin: "20px 0" }}>
          <hr className="divider" style={{ flex: 1 }} />
          <span className="mute" style={{ fontSize: 11 }}>or continue with</span>
          <hr className="divider" style={{ flex: 1 }} />
        </div>

        <div className="grid grid-3" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm">Google</button>
          <button className="btn btn-ghost btn-sm">Apple</button>
          <button className="btn btn-ghost btn-sm">Facebook</button>
        </div>

        <div className="text-center mt-4 muted" style={{ fontSize: 13 }}>
          New to OddsCheck? <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </section>
  );
}
