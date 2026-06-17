"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
  // Accounts are not enabled in this preview — don't fake a login. Surface an
  // honest notice instead of pretending to authenticate (see PRODUCTION-READINESS.md).
  const [notice, setNotice] = useState(false);
  return (
    <form className="flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setNotice(true); }}>
      <label className="field"><span className="label">Email</span><input className="input" type="email" required autoComplete="email" placeholder="you@email.com" /></label>
      <label className="field">
        <span className="label" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Password</span>
          <Link href="/responsible-gambling" style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>Forgot?</Link>
        </span>
        <input className="input" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </label>
      <label className="checkbox" style={{ marginTop: 6 }}><input type="checkbox" defaultChecked />Keep me signed in</label>
      {notice && (
        <p role="status" className="mute" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Accounts aren&apos;t enabled in this preview yet — sign-in is coming soon.
        </p>
      )}
      <button className="btn btn-primary btn-lg btn-block" type="submit">Sign in</button>
    </form>
  );
}
