"use client";

import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  return (
    <form className="flex-col gap-3" onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }}>
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
        I&apos;m 18 or over &amp; agree to the <a href="#" style={{ color: "var(--accent)", textDecoration: "underline" }}>Terms</a> &amp; <a href="#" style={{ color: "var(--accent)", textDecoration: "underline" }}>Privacy Policy</a>
      </label>
      <label className="checkbox" style={{ marginTop: 0 }}>
        <input type="checkbox" />
        Send me odds alerts and free bets by email
      </label>
      <button className="btn btn-primary btn-lg btn-block" type="submit">Create account</button>
    </form>
  );
}
