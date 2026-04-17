"use client";

/**
 * BackpropVisualizer
 *
 * Phase 6 — third interactive demo.
 *
 * Step-through visualization of the forward and backward passes on a tiny
 * 2 → 2 → 1 fully-connected network with sigmoid activations and MSE loss.
 *
 * Phases (navigated with ← / → buttons):
 *   idle → forward → loss → backward → updated
 *
 * In each phase the SVG canvas updates to show:
 *   - idle:     network topology + current edge weights (dim slate)
 *   - forward:  cyan-highlighted edges, node activation values filled in
 *   - loss:     target node appears with loss annotation
 *   - backward: pink-300 gradient annotations on every edge and node (δ)
 *   - updated:  green weight labels showing new values after Δw = −η·∂L/∂w
 *
 * User controls: x₁/x₂ sliders, target y slider, learning rate η slider.
 * Resetting inputs resets phase to idle so the full story plays again.
 *
 * Zero external charting deps (no recharts, no d3) — pure SVG + React state.
 * Consistent with GradientDescentViz and ActivationFunctionViz in style,
 * palette, and architecture. Resilient in the offline/localhost-only target.
 *
 * Registered in MDX via <BackpropVisualizer /> — see MDXComponents.tsx.
 */

import { useMemo, useState } from "react";

// ── Maths helpers ─────────────────────────────────────────────────────────────

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/** Derivative of sigmoid given the *output* value a = σ(z). */
function sigmoidDeriv(a: number): number {
  return a * (1 - a);
}

// ── Network weight types ──────────────────────────────────────────────────────

type Weights = {
  /** wh[i][j] = weight from input i to hidden neuron j (0-indexed). */
  wh: number[][];   // shape [2][2]
  bh: number[];     // shape [2]
  /** wo[i] = weight from hidden neuron i to output neuron. */
  wo: number[];     // shape [2]
  bo: number;
};

const INIT_WEIGHTS: Weights = {
  wh: [[0.5, -0.3], [0.2, 0.8]],
  bh: [0.0, -0.1],
  wo: [0.6, -0.4],
  bo: 0.1,
};

function cloneWeights(w: Weights): Weights {
  return {
    wh: w.wh.map(row => [...row]),
    bh: [...w.bh],
    wo: [...w.wo],
    bo: w.bo,
  };
}

// ── Forward / backward types ──────────────────────────────────────────────────

type ForwardState = {
  zh: number[];   // pre-activation hidden
  ah: number[];   // post-activation hidden
  zo: number;     // pre-activation output
  ao: number;     // post-activation output = ŷ
};

type GradState = {
  dL_dwo: number[];
  dL_dbo: number;
  dL_dwh: number[][];  // shape [2][2]
  dL_dbh: number[];
  dL_dah: number[];
  dL_dzh: number[];
  dL_dzo: number;
  dL_dao: number;
};

// ── Forward pass ──────────────────────────────────────────────────────────────

function forwardPass(x: number[], w: Weights): ForwardState {
  const zh = [
    w.wh[0][0] * x[0] + w.wh[1][0] * x[1] + w.bh[0],
    w.wh[0][1] * x[0] + w.wh[1][1] * x[1] + w.bh[1],
  ];
  const ah = zh.map(sigmoid);
  const zo = w.wo[0] * ah[0] + w.wo[1] * ah[1] + w.bo;
  const ao = sigmoid(zo);
  return { zh, ah, zo, ao };
}

// ── Backward pass ─────────────────────────────────────────────────────────────

function backwardPass(
  x: number[],
  y: number,
  fw: ForwardState,
  w: Weights,
  lr: number,
): { grads: GradState; updated: Weights } {
  const { ah, ao } = fw;

  // Output gradient (MSE: L = ½(y−ŷ)²)
  const dL_dao = -(y - ao);                           // ∂L/∂ŷ
  const dL_dzo = dL_dao * sigmoidDeriv(ao);           // ∂L/∂z_out (chain rule)
  const dL_dwo = ah.map(a => dL_dzo * a);             // ∂L/∂w_o_i
  const dL_dbo = dL_dzo;

  // Hidden layer gradient
  const dL_dah = w.wo.map(wo_i => dL_dzo * wo_i);                // ∂L/∂a_h_i
  const dL_dzh = dL_dah.map((d, i) => d * sigmoidDeriv(ah[i])); // ∂L/∂z_h_i (δ)

  // Hidden weight gradients: ∂L/∂w_h_{ij} = δ_j · x_i
  const dL_dwh = x.map(xi => dL_dzh.map(dj => dj * xi));
  const dL_dbh = [...dL_dzh];

  const grads: GradState = {
    dL_dwo, dL_dbo, dL_dwh, dL_dbh,
    dL_dah, dL_dzh, dL_dzo, dL_dao,
  };

  // Weight update: w ← w − η · ∂L/∂w
  const up = cloneWeights(w);
  up.wo = up.wo.map((v, i) => v - lr * dL_dwo[i]);
  up.bo = up.bo - lr * dL_dbo;
  up.wh = up.wh.map((row, i) => row.map((v, j) => v - lr * dL_dwh[i][j]));
  up.bh = up.bh.map((v, i) => v - lr * dL_dbh[i]);

  return { grads, updated: up };
}

// ── SVG layout constants ──────────────────────────────────────────────────────

const SVG_W = 520;
const SVG_H = 300;
const R = 27; // node radius in SVG units

const NODES = {
  input:  [{ x: 65,  y: 95  }, { x: 65,  y: 205 }],
  hidden: [{ x: 260, y: 110 }, { x: 260, y: 190 }],
  output: [{ x: 455, y: 150 }],
};

// ── Colour helpers ────────────────────────────────────────────────────────────

/** Gradient-magnitude → warm pink tint. zero → dim, large → pink-300. */
function gradColor(g: number, maxG: number): string {
  const t = Math.min(Math.abs(g) / (maxG || 1), 1);
  const r = Math.round(110 + 139 * t);
  const gr = Math.round(80  -  48 * t);
  const b  = Math.round(140 +  72 * t);
  return `rgb(${r},${gr},${b})`;
}

function fmt(v: number): string {
  return v.toFixed(3);
}

// ── Phase definitions ─────────────────────────────────────────────────────────

type Phase = "idle" | "forward" | "loss" | "backward" | "updated";
const PHASES: Phase[] = ["idle", "forward", "loss", "backward", "updated"];

const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  idle:     "Initial state — adjust inputs and target, then step through →",
  forward:  "Forward pass: inputs multiply weights, activations fill left → right",
  loss:     "Loss computed: L = ½ (y − ŷ)²  — how wrong is the prediction?",
  backward: "Backward pass: chain rule propagates ∂L/∂w right → left (pink = gradient)",
  updated:  "Weights updated: w ← w − η · ∂L/∂w  (green = new values)",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function BackpropVisualizer() {
  const [phase,   setPhase]   = useState<Phase>("idle");
  const [x1,      setX1]      = useState(0.8);
  const [x2,      setX2]      = useState(0.3);
  const [target,  setTarget]  = useState(1.0);
  const [lr,      setLr]      = useState(0.5);
  const [weights, setWeights] = useState<Weights>(INIT_WEIGHTS);

  const x  = [x1, x2];

  const fw = useMemo(() => forwardPass(x, weights), [x1, x2, weights]); // eslint-disable-line react-hooks/exhaustive-deps

  const lossVal = useMemo(() => 0.5 * (target - fw.ao) ** 2, [target, fw.ao]);

  const { grads, updated } = useMemo(
    () => backwardPass(x, target, fw, weights, lr),
    [x1, x2, target, lr, fw, weights], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const maxGrad = useMemo(() => {
    const all = [...grads.dL_dwo, grads.dL_dbo, ...grads.dL_dwh.flat(), ...grads.dL_dbh];
    return Math.max(...all.map(Math.abs), 1e-6);
  }, [grads]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  function advance(dir: 1 | -1) {
    const idx      = PHASES.indexOf(phase);
    const nextIdx  = Math.max(0, Math.min(PHASES.length - 1, idx + dir));
    const nextPh   = PHASES[nextIdx];
    // Commit weight update when entering "updated"
    if (nextPh === "updated" && phase === "backward") {
      setWeights(cloneWeights(updated));
    }
    setPhase(nextPh);
  }

  function reset() {
    setWeights(cloneWeights(INIT_WEIGHTS));
    setPhase("idle");
  }

  // ── Edge colour / width ─────────────────────────────────────────────────────

  function ihEdgeColor(fromInput: number, toHidden: number): string {
    if (phase === "backward") return gradColor(grads.dL_dwh[fromInput][toHidden], maxGrad);
    if (phase === "forward" || phase === "loss" || phase === "updated") return "#22d3ee";
    return "#1e293b";
  }

  function hoEdgeColor(fromHidden: number): string {
    if (phase === "backward") return gradColor(grads.dL_dwo[fromHidden], maxGrad);
    if (phase === "forward" || phase === "loss" || phase === "updated") return "#22d3ee";
    return "#1e293b";
  }

  function edgeWidth(g: number): number {
    return 1.5 + 2.5 * Math.min(Math.abs(g) / maxGrad, 1);
  }

  // ── Node stroke ─────────────────────────────────────────────────────────────

  function inputNodeStroke(): string {
    if (phase === "forward" || phase === "updated") return "#22d3ee";
    return "#475569";
  }

  function hiddenNodeStroke(i: number): string {
    if (phase === "backward") return gradColor(grads.dL_dah[i], maxGrad);
    if (phase === "forward" || phase === "loss" || phase === "updated") return "#22d3ee";
    return "#475569";
  }

  function outputNodeStroke(): string {
    if (phase === "backward") return "#f9a8d4";
    if (phase === "forward" || phase === "loss" || phase === "updated") return "#22d3ee";
    return "#475569";
  }

  // ── Node labels ──────────────────────────────────────────────────────────────

  function hiddenLabel(i: number): string {
    return (phase === "idle") ? `h${i + 1}` : fmt(fw.ah[i]);
  }

  function outputLabel(): string {
    return (phase === "idle") ? "ŷ" : fmt(fw.ao);
  }

  // ── Weight label colour ──────────────────────────────────────────────────────

  const wLabelColor = phase === "updated" ? "#86efac" : "#475569";

  // ── Render ───────────────────────────────────────────────────────────────────

  const showValues   = phase !== "idle";
  const showGrads    = phase === "backward";
  const showUpdated  = phase === "updated";
  const showLossNode = phase === "loss" || phase === "backward";

  return (
    <div className="my-8 rounded-xl border border-white/10 bg-surface-1 p-4 shadow-lg">
      {/* Header */}
      <h3 className="mb-1 text-sm font-semibold text-neon-cyan uppercase tracking-widest">
        Interactive Demo — Backpropagation Step-Through
      </h3>
      <p className="mb-4 text-xs text-text-secondary">
        2-input → 2-hidden (sigmoid) → 1-output (sigmoid) · MSE loss
      </p>

      {/* Phase banner */}
      <div className="mb-4 rounded-lg border border-white/10 bg-surface-2/50 px-4 py-2 text-sm text-text-primary">
        <span className="mr-2 font-semibold text-neon-cyan capitalize">{phase}:</span>
        {PHASE_DESCRIPTIONS[phase]}
      </div>

      {/* SVG canvas */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg bg-[#050510] mb-4"
        style={{ maxHeight: 300 }}
      >
        {/* Layer labels */}
        <text x={65}  y={20} textAnchor="middle" fontSize={11} fill="#475569">Input</text>
        <text x={260} y={20} textAnchor="middle" fontSize={11} fill="#475569">Hidden (σ)</text>
        <text x={455} y={20} textAnchor="middle" fontSize={11} fill="#475569">Output (σ)</text>

        {/* ── Input → Hidden edges ── */}
        {NODES.input.map((inp, i) =>
          NODES.hidden.map((hid, j) => {
            const gVal = grads.dL_dwh[i][j];
            const mx = (inp.x + R + hid.x - R) / 2;
            const my = (inp.y + hid.y) / 2;
            const slope = (hid.y - inp.y) / (hid.x - inp.x - 2 * R);
            const labelDy = slope > 0 ? -10 : 10;
            return (
              <g key={`ih-${i}-${j}`}>
                <line
                  x1={inp.x + R} y1={inp.y}
                  x2={hid.x - R} y2={hid.y}
                  stroke={ihEdgeColor(i, j)}
                  strokeWidth={showGrads ? edgeWidth(gVal) : 1.5}
                  strokeOpacity={0.8}
                />
                {/* Weight label (idle + updated) */}
                {(phase === "idle" || showUpdated) && (
                  <text x={mx} y={my + labelDy} textAnchor="middle"
                    fontSize={8} fill={wLabelColor}>
                    {fmt(weights.wh[i][j])}
                  </text>
                )}
                {/* Gradient label (backward) */}
                {showGrads && (
                  <text x={mx} y={my + labelDy} textAnchor="middle"
                    fontSize={8} fill="#f9a8d4">
                    ∂={fmt(gVal)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* ── Hidden → Output edges ── */}
        {NODES.hidden.map((hid, i) => {
          const out = NODES.output[0];
          const gVal = grads.dL_dwo[i];
          const mx = (hid.x + R + out.x - R) / 2;
          const my = (hid.y + out.y) / 2;
          const labelDy = hid.y < out.y ? 10 : -10;
          return (
            <g key={`ho-${i}`}>
              <line
                x1={hid.x + R} y1={hid.y}
                x2={out.x - R}  y2={out.y}
                stroke={hoEdgeColor(i)}
                strokeWidth={showGrads ? edgeWidth(gVal) : 1.5}
                strokeOpacity={0.8}
              />
              {(phase === "idle" || showUpdated) && (
                <text x={mx} y={my + labelDy} textAnchor="middle"
                  fontSize={8} fill={wLabelColor}>
                  {fmt(weights.wo[i])}
                </text>
              )}
              {showGrads && (
                <text x={mx} y={my + labelDy} textAnchor="middle"
                  fontSize={8} fill="#f9a8d4">
                  ∂={fmt(gVal)}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Input nodes ── */}
        {NODES.input.map((n, i) => (
          <g key={`inp-${i}`}>
            <circle cx={n.x} cy={n.y} r={R}
              fill="#0a0a1a" stroke={inputNodeStroke()} strokeWidth={2} />
            <text x={n.x} y={n.y - 7} textAnchor="middle" fontSize={9} fill="#64748b">
              x{i + 1}
            </text>
            <text x={n.x} y={n.y + 8} textAnchor="middle"
              fontSize={11} fill="#e2e8f0" fontWeight="bold">
              {fmt(x[i])}
            </text>
          </g>
        ))}

        {/* ── Hidden nodes ── */}
        {NODES.hidden.map((n, i) => (
          <g key={`hid-${i}`}>
            <circle cx={n.x} cy={n.y} r={R}
              fill="#0a0a1a" stroke={hiddenNodeStroke(i)} strokeWidth={2} />
            <text x={n.x} y={n.y - 7} textAnchor="middle" fontSize={9} fill="#64748b">
              h{i + 1}
            </text>
            <text x={n.x} y={n.y + 8} textAnchor="middle"
              fontSize={11} fill="#e2e8f0" fontWeight="bold">
              {hiddenLabel(i)}
            </text>
            {/* Delta annotation */}
            {showGrads && (
              <text x={n.x} y={n.y + R + 14} textAnchor="middle"
                fontSize={8} fill="#f9a8d4">
                δ={fmt(grads.dL_dzh[i])}
              </text>
            )}
          </g>
        ))}

        {/* ── Output node ── */}
        <g>
          <circle cx={NODES.output[0].x} cy={NODES.output[0].y} r={R}
            fill="#0a0a1a" stroke={outputNodeStroke()} strokeWidth={2} />
          <text x={NODES.output[0].x} y={NODES.output[0].y - 7}
            textAnchor="middle" fontSize={9} fill="#64748b">ŷ</text>
          <text x={NODES.output[0].x} y={NODES.output[0].y + 8}
            textAnchor="middle" fontSize={11} fill="#e2e8f0" fontWeight="bold">
            {outputLabel()}
          </text>
          {showGrads && (
            <text x={NODES.output[0].x} y={NODES.output[0].y + R + 14}
              textAnchor="middle" fontSize={8} fill="#f9a8d4">
              δ={fmt(grads.dL_dzo)}
            </text>
          )}
        </g>

        {/* ── Target node (loss + backward phases) ── */}
        {showLossNode && (
          <g>
            <circle cx={NODES.output[0].x + 75} cy={NODES.output[0].y} r={22}
              fill="#0a0a1a" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 3" />
            <text x={NODES.output[0].x + 75} y={NODES.output[0].y - 6}
              textAnchor="middle" fontSize={9} fill="#fbbf24">y</text>
            <text x={NODES.output[0].x + 75} y={NODES.output[0].y + 9}
              textAnchor="middle" fontSize={11} fill="#fbbf24" fontWeight="bold">
              {fmt(target)}
            </text>
            {/* Loss value label */}
            <text x={NODES.output[0].x + 38} y={NODES.output[0].y - 34}
              textAnchor="middle" fontSize={10} fill="#ef4444">
              L = {fmt(lossVal)}
            </text>
          </g>
        )}
      </svg>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4 text-xs text-text-secondary">
        <div>
          <div className="mb-1">
            x₁ = <span className="text-neon-cyan font-mono">{fmt(x1)}</span>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={x1}
            onChange={e => { setX1(Number(e.target.value)); setPhase("idle"); }}
            className="w-full accent-cyan-400" />
        </div>
        <div>
          <div className="mb-1">
            x₂ = <span className="text-neon-cyan font-mono">{fmt(x2)}</span>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={x2}
            onChange={e => { setX2(Number(e.target.value)); setPhase("idle"); }}
            className="w-full accent-cyan-400" />
        </div>
        <div>
          <div className="mb-1">
            target y = <span className="text-yellow-400 font-mono">{fmt(target)}</span>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={target}
            onChange={e => { setTarget(Number(e.target.value)); setPhase("idle"); }}
            className="w-full accent-yellow-400" />
        </div>
        <div>
          <div className="mb-1">
            η (lr) = <span className="text-purple-400 font-mono">{fmt(lr)}</span>
          </div>
          <input type="range" min={0.01} max={2.0} step={0.01} value={lr}
            onChange={e => setLr(Number(e.target.value))}
            className="w-full accent-purple-400" />
        </div>
      </div>

      {/* Navigation + phase pips */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => advance(-1)}
          disabled={phase === "idle"}
          className="rounded-lg border border-white/10 bg-surface-2 px-4 py-2 text-xs font-semibold text-text-primary hover:border-neon-cyan/40 disabled:opacity-30 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => advance(1)}
          disabled={phase === "updated"}
          className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-30 transition-colors"
        >
          {phase === "backward" ? "Update Weights →" : "Next →"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-white/10 bg-surface-2 px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          ↺ Reset
        </button>
        {/* Phase progress pips */}
        <div className="flex items-center gap-1.5 ml-auto">
          {PHASES.map((p, idx) => (
            <div
              key={p}
              title={p}
              className={`rounded-full transition-all duration-200 ${
                p === phase
                  ? "w-2.5 h-2.5 bg-neon-cyan"
                  : PHASES.indexOf(phase) > idx
                  ? "w-2 h-2 bg-neon-cyan/30 border border-neon-cyan/20"
                  : "w-2 h-2 bg-surface-2 border border-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Readout panel — shown once forward pass is done */}
      {showValues && (
        <div className="mt-4 rounded-lg border border-white/[0.07] bg-[#050510] p-3 font-mono text-xs grid grid-cols-2 gap-x-6 gap-y-1 text-text-secondary">
          <span>ŷ (output)  = <span className="text-neon-cyan">{fmt(fw.ao)}</span></span>
          <span>Loss L      = <span className="text-red-400">{fmt(lossVal)}</span></span>
          {(showGrads || showUpdated) && (
            <>
              <span>∂L/∂ŷ     = <span className="text-pink-300">{fmt(grads.dL_dao)}</span></span>
              <span>δ_out      = <span className="text-pink-300">{fmt(grads.dL_dzo)}</span></span>
              <span>∂L/∂w_o1  = <span className="text-pink-300">{fmt(grads.dL_dwo[0])}</span></span>
              <span>∂L/∂w_o2  = <span className="text-pink-300">{fmt(grads.dL_dwo[1])}</span></span>
              <span>δ_h1       = <span className="text-pink-300">{fmt(grads.dL_dzh[0])}</span></span>
              <span>δ_h2       = <span className="text-pink-300">{fmt(grads.dL_dzh[1])}</span></span>
            </>
          )}
          {showUpdated && (
            <>
              <span className="col-span-2 text-green-400 mt-1">
                — weights updated by η·∂L/∂w —
              </span>
              <span>w_h[0][0]  = <span className="text-green-400">{fmt(weights.wh[0][0])}</span></span>
              <span>w_h[0][1]  = <span className="text-green-400">{fmt(weights.wh[0][1])}</span></span>
              <span>w_o1       = <span className="text-green-400">{fmt(weights.wo[0])}</span></span>
              <span>w_o2       = <span className="text-green-400">{fmt(weights.wo[1])}</span></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
