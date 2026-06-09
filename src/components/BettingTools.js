"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// ---- shared helpers ----
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
  return b ? 1 + a / b : null;
}
function parseAmerican(s) {
  const m = /^\s*([+-]?\d+(?:\.\d+)?)\s*$/.exec(s);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (!v) return null;
  return v > 0 ? 1 + v / 100 : 1 + 100 / Math.abs(v);
}
const money = (n) => `£${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
const num = (v) => parseFloat(v) || 0;

const TABS = [
  { id: "odds", label: "Odds Converter" },
  { id: "implied", label: "Implied %" },
  { id: "acca", label: "Accumulator" },
  { id: "ew", label: "Each-Way" },
  { id: "arb", label: "Arbitrage" },
  { id: "kelly", label: "Kelly Stake" },
];

// Shared layout: inputs on the left, a result panel on the right.
function Result({ rows, highlight }) {
  return (
    <div style={{ padding: 24, background: "linear-gradient(180deg, rgba(255,142,0,0.06), rgba(255,142,0,0.02))", border: "1px solid rgba(255,142,0,0.20)", borderRadius: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Result</div>
      {rows.map(([k, v], i) => (
        <div key={k} className="flex justify-between items-baseline" style={{ padding: "9px 0", borderBottom: i === rows.length - 1 ? 0 : "1px solid rgba(255,142,0,0.10)" }}>
          <span className="muted" style={{ fontSize: 12 }}>{k}</span>
          <span className="num" style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{v}</span>
        </div>
      ))}
      {highlight && (
        <div className="flex justify-between items-baseline" style={{ paddingTop: 12, marginTop: 4, borderTop: "1px solid rgba(255,142,0,0.2)" }}>
          <span className="muted" style={{ fontSize: 12 }}>{highlight.label}</span>
          <span className="num" style={{ fontSize: 20, fontWeight: 700, color: highlight.good === false ? "var(--down)" : "var(--accent)" }}>{highlight.value}</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, value, onChange, ...rest }) {
  return (
    <label className="field">
      <span className="label">{label}{hint && <span className="mute"> {hint}</span>}</span>
      <input className="input num" value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" {...rest} />
    </label>
  );
}

// ---------- 1. Odds converter + implied probability ----------
function OddsConverter() {
  const [decimal, setDecimal] = useState(2.5);
  const [dec, setDec] = useState("2.50");
  const [frac, setFrac] = useState("3/2");
  const [amer, setAmer] = useState("+150");
  const [stake, setStake] = useState("20.00");

  function apply(d, keep) {
    if (!(d > 1) || !isFinite(d)) return;
    setDecimal(d);
    if (keep !== "dec") setDec(d.toFixed(2));
    if (keep !== "frac") setFrac(decToFractional(d));
    if (keep !== "amer") setAmer(decToAmerican(d));
  }
  const impliedProb = 100 / decimal;
  const stakeN = num(stake);
  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <Field label="Decimal odds" hint="(e.g. 2.50)" value={dec} onChange={(v) => { setDec(v); const d = parseFloat(v); if (d > 1) apply(d, "dec"); }} />
        <div className="field-row">
          <Field label="Fractional" value={frac} onChange={(v) => { setFrac(v); const d = parseFractional(v); if (d) apply(d, "frac"); }} />
          <Field label="American" value={amer} onChange={(v) => { setAmer(v); const d = parseAmerican(v); if (d) apply(d, "amer"); }} />
        </div>
        <Field label="Stake (£)" value={stake} onChange={setStake} />
      </form>
      <Result
        rows={[
          ["Decimal", decimal.toFixed(2)],
          ["Fractional", decToFractional(decimal)],
          ["American", decToAmerican(decimal)],
          ["Implied probability", `${impliedProb.toFixed(2)}%`],
          [`Returns on ${money(stakeN)}`, money(stakeN * decimal)],
        ]}
        highlight={{ label: "Profit", value: money(stakeN * (decimal - 1)) }}
      />
    </div>
  );
}

// ---------- 1b. Implied probability ----------
function ImpliedProbability() {
  const [odds, setOdds] = useState("2.50");
  const [prob, setProb] = useState("40");

  const d = num(odds);
  const implied = d > 1 ? 100 / d : null; // odds → probability
  const p = num(prob) / 100;
  const fairDec = p > 0 && p < 1 ? 1 / p : null; // probability → fair odds

  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <Field label="Decimal odds → probability" hint="(e.g. 2.50)" value={odds} onChange={setOdds} />
        <Field label="Your probability (%) → fair odds" hint="(e.g. 40)" value={prob} onChange={setProb} />
        <p className="mute" style={{ fontSize: 11 }}>
          Implied probability is the chance a price represents: <b>100 ÷ decimal odds</b>.
          The reverse gives the fair (no-margin) price for a probability you believe.
        </p>
      </form>
      <Result
        rows={[
          ["Decimal odds", d > 1 ? d.toFixed(2) : "—"],
          ["Fractional", d > 1 ? decToFractional(d) : "—"],
          ["American", d > 1 ? decToAmerican(d) : "—"],
          ["— Fair odds for " + (num(prob) || 0) + "% —", ""],
          ["Decimal", fairDec ? fairDec.toFixed(2) : "—"],
          ["Fractional", fairDec ? decToFractional(fairDec) : "—"],
          ["American", fairDec ? decToAmerican(fairDec) : "—"],
        ]}
        highlight={{ label: "Implied probability", value: implied != null ? `${implied.toFixed(2)}%` : "—" }}
      />
    </div>
  );
}

// ---------- 2. Accumulator ----------
function Accumulator() {
  const [legs, setLegs] = useState(["1.80", "2.10", "1.50"]);
  const [stake, setStake] = useState("10.00");
  const setLeg = (i, v) => setLegs((l) => l.map((x, j) => (j === i ? v : x)));
  const product = legs.reduce((acc, l) => acc * (num(l) > 1 ? num(l) : 1), 1);
  const stakeN = num(stake);
  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        {legs.map((l, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field label={`Leg ${i + 1} — decimal odds`} value={l} onChange={(v) => setLeg(i, v)} />
            {legs.length > 2 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLegs((s) => s.filter((_, j) => j !== i))} aria-label={`Remove leg ${i + 1}`} style={{ marginBottom: 2 }}>✕</button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLegs((s) => [...s, "2.00"])}>+ Add leg</button>
        </div>
        <Field label="Stake (£)" value={stake} onChange={setStake} />
      </form>
      <Result
        rows={[
          ["Selections", String(legs.length)],
          ["Combined decimal odds", product.toFixed(2)],
          ["Combined fractional", decToFractional(product)],
          [`Returns on ${money(stakeN)}`, money(stakeN * product)],
        ]}
        highlight={{ label: "Profit", value: money(stakeN * (product - 1)) }}
      />
    </div>
  );
}

// ---------- 3. Each-Way ----------
function EachWay() {
  const [stake, setStake] = useState("10.00");
  const [odds, setOdds] = useState("9.00");
  const [placeFrac, setPlaceFrac] = useState("1/5");
  const unit = num(stake);
  const o = num(odds);
  const pf = parseFractionRaw(placeFrac);
  const placeOdds = 1 + (o - 1) * pf;
  const winReturn = unit * o + unit * placeOdds; // wins => both win & place parts pay
  const placeReturn = unit * placeOdds; // placed only => win part lost, place part pays
  const total = unit * 2;
  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <Field label="Unit stake (£)" hint="(staked on win AND place)" value={stake} onChange={setStake} />
        <Field label="Win odds (decimal)" value={odds} onChange={setOdds} />
        <Field label="Each-way place terms" hint="(e.g. 1/5)" value={placeFrac} onChange={setPlaceFrac} inputMode="text" />
        <p className="mute" style={{ fontSize: 11 }}>Total outlay is twice the unit stake (win + place).</p>
      </form>
      <Result
        rows={[
          ["Total stake", money(total)],
          ["Place-part odds", placeOdds.toFixed(2)],
          ["If it WINS — return", money(winReturn)],
          ["If it WINS — profit", money(winReturn - total)],
          ["If it PLACES — return", money(placeReturn)],
        ]}
        highlight={{ label: "If it PLACES — profit/loss", value: money(placeReturn - total), good: placeReturn - total >= 0 }}
      />
    </div>
  );
}

// ---------- 4. Arbitrage (2-way) ----------
function Arbitrage() {
  const [oddsA, setOddsA] = useState("2.10");
  const [oddsB, setOddsB] = useState("2.10");
  const [total, setTotal] = useState("100.00");
  const a = num(oddsA), b = num(oddsB), t = num(total);
  const arbPct = (a > 1 && b > 1) ? (1 / a + 1 / b) : 2; // <1 means a surebet
  const isArb = arbPct < 1 && arbPct > 0;
  const stakeA = isArb ? (t * (1 / a)) / arbPct : t * (1 / a) / (1 / a + 1 / b);
  const stakeB = t - stakeA;
  const payout = Math.min(stakeA * a, stakeB * b);
  const profit = payout - t;
  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <div className="field-row">
          <Field label="Outcome A — best odds" value={oddsA} onChange={setOddsA} />
          <Field label="Outcome B — best odds" value={oddsB} onChange={setOddsB} />
        </div>
        <Field label="Total stake (£)" value={total} onChange={setTotal} />
        <p className="mute" style={{ fontSize: 11 }}>Enter the best price for each side of a 2-way market (from different books).</p>
      </form>
      <Result
        rows={[
          ["Market %", `${(arbPct * 100).toFixed(2)}%`],
          ["Surebet?", isArb ? "Yes — guaranteed profit" : "No — would lose to margin"],
          ["Stake on A", money(stakeA)],
          ["Stake on B", money(stakeB)],
          ["Guaranteed return", money(payout)],
        ]}
        highlight={{ label: "Guaranteed profit", value: `${money(profit)} (${((profit / t) * 100).toFixed(2)}%)`, good: profit >= 0 }}
      />
    </div>
  );
}

// ---------- 5. Kelly stake ----------
function Kelly() {
  const [bankroll, setBankroll] = useState("1000.00");
  const [odds, setOdds] = useState("2.50");
  const [prob, setProb] = useState("45");
  const bk = num(bankroll), o = num(odds), p = num(prob) / 100;
  const b = o - 1, q = 1 - p;
  const f = b > 0 ? (b * p - q) / b : 0; // Kelly fraction
  const fClamped = Math.max(0, f);
  const fairOdds = p > 0 ? 1 / p : 0;
  const hasEdge = o > fairOdds && fClamped > 0;
  return (
    <div className="grid grid-2" style={{ gap: 28 }}>
      <form className="flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <Field label="Bankroll (£)" value={bankroll} onChange={setBankroll} />
        <Field label="Decimal odds" value={odds} onChange={setOdds} />
        <Field label="Your win probability (%)" hint="(your estimate)" value={prob} onChange={setProb} />
        <p className="mute" style={{ fontSize: 11 }}>Kelly maximises long-run bankroll growth for your stated edge. Many bettors use half-Kelly.</p>
      </form>
      <Result
        rows={[
          ["Your implied price", fairOdds ? fairOdds.toFixed(2) : "—"],
          ["Edge?", hasEdge ? "Yes — positive expected value" : "No edge at this price"],
          ["Kelly fraction", `${(fClamped * 100).toFixed(1)}%`],
          ["Full Kelly stake", money(bk * fClamped)],
          ["Half Kelly stake", money(bk * fClamped * 0.5)],
        ]}
        highlight={{ label: "Recommended (½ Kelly)", value: money(bk * fClamped * 0.5), good: hasEdge }}
      />
    </div>
  );
}

function parseFractionRaw(s) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/.exec(s);
  if (!m) return 0.2;
  const a = parseFloat(m[1]), b = parseFloat(m[2]);
  return b ? a / b : 0.2;
}

function BettingToolsInner() {
  const params = useSearchParams();
  const calc = params.get("calc");
  const [active, setActive] = useState("odds");

  // Preselect a calculator from ?calc=<id> (e.g. /tools?calc=ew). useSearchParams
  // is reactive, so this fires both on cross-page navigation (a homepage card)
  // and on same-page card clicks — then we scroll it into view.
  useEffect(() => {
    if (calc && TABS.some((t) => t.id === calc)) {
      setActive(calc);
      document.getElementById("calculators")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [calc]);

  return (
    <div id="calculators" className="card" style={{ padding: 0, overflow: "hidden", scrollMarginTop: 96 }}>
      <div className="tab-pills-scroll" style={{ padding: "14px 18px 0", gap: 6 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-pill${active === t.id ? " active" : ""}`}
            aria-pressed={active === t.id}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 22 }}>
        {active === "odds" && <OddsConverter />}
        {active === "implied" && <ImpliedProbability />}
        {active === "acca" && <Accumulator />}
        {active === "ew" && <EachWay />}
        {active === "arb" && <Arbitrage />}
        {active === "kelly" && <Kelly />}
      </div>
    </div>
  );
}

export default function BettingTools() {
  // useSearchParams must sit inside Suspense for the statically-rendered page.
  return (
    <Suspense fallback={<div className="card" style={{ padding: 22, minHeight: 320 }} />}>
      <BettingToolsInner />
    </Suspense>
  );
}
