"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupForm() {
  // Accounts are not enabled in this preview — don't fake account creation.
  const [notice, setNotice] = useState(false);
  return (
    <form className="flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setNotice(true); }}>
      <div className="field-row">
        <label className="field"><span className="label">First name</span><input className="input" required autoComplete="given-name" placeholder="James" /></label>
        <label className="field"><span className="label">Last name</span><input className="input" required autoComplete="family-name" placeholder="Murphy" /></label>
      </div>
      <label className="field"><span className="label">Email</span><input className="input" type="email" required autoComplete="email" placeholder="you@email.com" /></label>
      <label className="field"><span className="label">Password <span className="mute">(8+ characters)</span></span><input className="input" type="password" required autoComplete="new-password" minLength={8} placeholder="••••••••" /></label>
      <label className="field">
        <span className="label">Country</span>
        <select className="input" required defaultValue="United Kingdom">
          <option>United Kingdom</option><option>Ireland</option><option>Australia</option><option>Canada</option><option>Other</option>
        </select>
      </label>
      <label className="checkbox">
        <input type="checkbox" required />
        I&apos;m 18 or over &amp; agree to the <Link href="/responsible-gambling" style={{ color: "var(--accent)", textDecoration: "underline" }}>Terms</Link> &amp; <Link href="/responsible-gambling" style={{ color: "var(--accent)", textDecoration: "underline" }}>Privacy Policy</Link>
      </label>
      <label className="checkbox" style={{ marginTop: 0 }}>
        <input type="checkbox" />
        Send me odds alerts and free bets by email
      </label>
      {notice && (
        <p role="status" className="mute" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Accounts aren&apos;t enabled in this preview yet — registration is coming soon.
        </p>
      )}
      <button className="btn btn-primary btn-lg btn-block" type="submit">Create account</button>
    </form>
  );
}
