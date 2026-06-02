"use client";

import Link from "next/link";
import { useState } from "react";

// ---- conversion helpers ----
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function decToFractional(d) {
  const x = d - 1;
  if (x <= 0) return "0/1";
  let bestN = 1, bestD = 1, bestErr = Infinity;
  for (let den = 1; den <= 100; den++) {
    const num = Math.round(x * den);
    const err = Math.abs(num / den - x);
    if (err < bestErr) { bestErr = err; bestN = num; bestD = den; if (err < 1e-9) break; }
  }
  const g = gcd(bestN, bestD) || 1;
  return `${bestN / g}/${bestD / g}`;
}

function decToAmerican(d) {
  if (!(d > 1)) return "—";
  return d >= 2 ? `+${Math.round((d - 1) * 100)}` : `${Math.round(-100 / (d - 1))}`;
}

function parseFractional(s) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/.exec(s);
  if (!m) return null;
  const a = parseFloat(m[1]), b = parseFloat(m[2]);
  if (!b) return null;
  return 1 + a / b;
}

function parseAmerican(s) {
  const m = /^\s*([+-]?\d+(?:\.\d+)?)\s*$/.exec(s);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (v === 0) return null;
  return v > 0 ? 1 + v / 100 : 1 + 100 / Math.abs(v);
}

const money = (n) => `£${n.toFixed(2)}`;

export default function OddsCalculator() {
  const [decimal, setDecimal] = useState(2.5);
  const [dec, setDec] = useState("2.50");
  const [frac, setFrac] = useState("3/2");
  const [amer, setAmer] = useState("+150");
  const [stake, setStake] = useState("20.00");
  const [over, setOver] = useState("6.5");

  // set canonical decimal and re-derive the other two formats
  function applyDecimal(d, keep) {
    if (!(d > 1) || !isFinite(d)) return;
    setDecimal(d);
    if (keep !== "dec") setDec(d.toFixed(2));
    if (keep !== "frac") setFrac(decToFractional(d));
    if (keep !== "amer") setAmer(decToAmerican(d));
  }

  const onDec = (e) => { setDec(e.target.value); const d = parseFloat(e.target.value); if (d > 1) applyDecimal(d, "dec"); };
  const onFrac = (e) => { setFrac(e.target.value); const d = parseFractional(e.target.value); if (d) applyDecimal(d, "frac"); };
  const onAmer = (e) => { setAmer(e.target.value); const d = parseAmerican(e.target.value); if (d) applyDecimal(d, "amer"); };

  function reset() {
    setDecimal(2.5); setDec("2.50"); setFrac("3/2"); setAmer("+150"); setStake("20.00"); setOver("6.5");
  }

  // ---- results ----
  const stakeN = parseFloat(stake) || 0;
  const overN = parseFloat(over) || 0;
  const impliedProb = 100 / decimal;
  const fairProb = impliedProb / (1 + overN / 100);
  const fairOdds = 100 / fairProb;
  const ret = stakeN * decimal;
  const profit = stakeN * (decimal - 1);
  const edge = (decimal / fairOdds - 1) * 100;

  const rows = [
    ["Decimal", decimal.toFixed(2)],
    ["Fractional", decToFractional(decimal)],
    ["American", decToAmerican(decimal)],
    ["Implied probability", `${impliedProb.toFixed(2)}%`],
    ["Fair probability (no margin)", `${fairProb.toFixed(2)}%`],
    [`To return on ${money(stakeN)}`, money(ret)],
    ["Profit", money(profit)],
  ];

  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" aria-label="Calculator inputs" onSubmit={(e) => e.preventDefault()}>
        <label className="field">
          <span className="label">Decimal odds <span className="mute">(e.g. 2.50)</span></span>
          <input className="input num" value={dec} onChange={onDec} inputMode="decimal" />
        </label>
        <div className="field-row">
          <label className="field"><span className="label">Fractional</span><input className="input num" value={frac} onChange={onFrac} /></label>
          <label className="field"><span className="label">American</span><input className="input num" value={amer} onChange={onAmer} /></label>
        </div>
        <label className="field"><span className="label">Stake (£)</span><input className="input num" value={stake} onChange={(e) => setStake(e.target.value)} inputMode="decimal" /></label>
        <label className="field"><span className="label">Margin removal · book overround (%)</span><input className="input num" value={over} onChange={(e) => setOver(e.target.value)} inputMode="decimal" /></label>
        <div className="flex gap-2 mt-3">
          <button className="btn btn-primary flex-1" type="submit">Calculate</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      <div style={{ padding: 24, background: "linear-gradient(180deg, rgba(45,212,191,0.06), rgba(45,212,191,0.02))", border: "1px solid rgba(45,212,191,0.20)", borderRadius: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Result</div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between items-baseline" style={{ padding: "9px 0", borderBottom: "1px solid rgba(45,212,191,0.10)" }}>
            <span className="muted" style={{ fontSize: 12 }}>{k}</span>
            <span className="num" style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{v}</span>
          </div>
        ))}
        <div className="flex justify-between items-baseline" style={{ padding: "9px 0" }}>
          <span className="muted" style={{ fontSize: 12 }}>Edge vs fair price</span>
          <span className="num" style={{ fontSize: 18, fontWeight: 700, color: edge >= 0 ? "var(--accent)" : "var(--down)" }}>
            {edge >= 0 ? "+" : ""}{edge.toFixed(1)}%
          </span>
        </div>
        <Link className="btn btn-primary btn-block btn-sm" href="/dashboard" style={{ marginTop: 14 }}>Save to bet tracker</Link>
      </div>
    </div>
  );
}
