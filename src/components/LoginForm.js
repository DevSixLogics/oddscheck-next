"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  return (
    <form className="flex-col gap-3" onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }}>
      <label className="field"><span className="label">Email</span><input className="input" type="email" required autoComplete="email" placeholder="you@email.com" /></label>
      <label className="field">
        <span className="label" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Password</span>
          <a href="#" style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>Forgot?</a>
        </span>
        <input className="input" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </label>
      <label className="checkbox" style={{ marginTop: 6 }}><input type="checkbox" defaultChecked />Keep me signed in</label>
      <button className="btn btn-primary btn-lg btn-block" type="submit">Sign in</button>
    </form>
  );
}
