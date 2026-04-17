"use client";

/**
 * ActivationFunctionViz
 *
 * Phase 6 — second interactive demo.
 *
 * Pure-SVG interactive plot of the common neural-network activation functions
 * (ReLU, Leaky ReLU, sigmoid, tanh, Swish/SiLU, GELU approx) together with
 * their derivatives. The user selects the activation from a button group and
 * drags a vertical input marker across the x-axis; a live readout panel shows
 * f(x), f'(x), the saturation regime, and an explicit "gradient health" label
 * (healthy / near-zero / dead) so learners can *see* the vanishing-gradient
 * problem without running any code.
 *
 * Zero external charting deps (no recharts, no d3) — everything is drawn with
 * <polyline>, <line>, <circle>, <text>. Consistent with GradientDescentViz
 * (the Phase 6 entry-point demo) and resilient in the offline/localhost-only
 * deployment target.
 *
 * Registered in MDX via `<ActivationFunctionViz />` — see MDXComponents.tsx.
 */

import { useMemo, useState } from "react";

type ActivationKey =
  | "relu"
  | "leaky_relu"
  | "sigmoid"
  | "tanh"
  | "swish"
  | "gelu";

type Activation = {
  key: ActivationKey;
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  // Used for the "gradient health" label at the chosen x.
  deadThreshold: number;
};

const LEAKY_ALPHA = 0.1;

// GELU approximation:  0.5 * x * (1 + tanh( sqrt(2/pi) * (x + 0.044715 * x^3) ))
// Derivative computed numerically via a tight central difference — this is
// what the torch/TF reference implementations do when compiling the backward
// pass for the "approximate" mode.
const GELU_K = Math.sqrt(2 / Math.PI);
function geluApprox(x: number): number {
  const inner = GELU_K * (x + 0.044715 * x ** 3);
  return 0.5 * x * (1 + Math.tanh(inner));
}
function geluDerivApprox(x: number): number {
  const eps = 1e-4;
  return (geluApprox(x + eps) - geluApprox(x - eps)) / (2 * eps);
}

const ACTIVATIONS: Record<ActivationKey, Activation> = {
  relu: {
    key: "relu",
    label: "ReLU",
    f: (x) => Math.max(0, x),
    df: (x) => (x > 0 ? 1 : 0),
    deadThreshold: 1e-6,
  },
  leaky_relu: {
    key: "leaky_relu",
    label: `LeakyReLU (α=${LEAKY_ALPHA})`,
    f: (x) => (x >= 0 ? x : LEAKY_ALPHA * x),
    df: (x) => (x >= 0 ? 1 : LEAKY_ALPHA),
    deadThreshold: 1e-6,
  },
  sigmoid: {
    key: "sigmoid",
    label: "Sigmoid",
    f: (x) => 1 / (1 + Math.exp(-x)),
    df: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
    // At |x|>6, sigmoid' is < 0.005 — effectively saturated.
    deadThreshold: 0.005,
  },
  tanh: {
    key: "tanh",
    label: "Tanh",
    f: (x) => Math.tanh(x),
    df: (x) => 1 - Math.tanh(x) ** 2,
    // At |x|>3, tanh' is < 0.02 — effectively saturated.
    deadThreshold: 0.02,
  },
  swish: {
    key: "swish",
    label: "Swish / SiLU",
    f: (x) => x / (1 + Math.exp(-x)),
    df: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s + x * s * (1 - s);
    },
    deadThreshold: 0.005,
  },
  gelu: {
    key: "gelu",
    label: "GELU (approx)",
    f: geluApprox,
    df: geluDerivApprox,
    deadThreshold: 0.005,
  },
};

// View window in data coordinates.
const VIEW = {
  xMin: -6,
  xMax: 6,
  yMin: -1.5,
  yMax: 3,
  width: 520,
  height: 360,
};

function toSvgX(x: number): number {
  return ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * VIEW.width;
}

function toSvgY(y: number): number {
  // Flip Y so +y is up.
  return (
    VIEW.height - ((y - VIEW.yMin) / (VIEW.yMax - VIEW.yMin)) * VIEW.height
  );
}

function fromSvgX(sx: number): number {
  return VIEW.xMin + (sx / VIEW.width) * (VIEW.xMax - VIEW.xMin);
}

function sampleCurve(f: (x: number) => number, n = 240): string {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = VIEW.xMin + (i / n) * (VIEW.xMax - VIEW.xMin);
    const y = f(x);
    // Clamp huge swings so we never draw outside the viewBox.
    const yClamped = Math.max(VIEW.yMin - 1, Math.min(VIEW.yMax + 1, y));
    pts.push(`${toSvgX(x).toFixed(1)},${toSvgY(yClamped).toFixed(1)}`);
  }
  return pts.join(" ");
}

function healthLabel(dfVal: number, threshold: number): {
  text: string;
  tone: "ok" | "warn" | "bad";
} {
  const abs = Math.abs(dfVal);
  if (abs < threshold) return { text: "saturated / dead gradient", tone: "bad" };
  if (abs < 0.1) return { text: "near-zero gradient", tone: "warn" };
  return { text: "healthy gradient", tone: "ok" };
}

export default function ActivationFunctionViz() {
  const [activeKey, setActiveKey] = useState<ActivationKey>("relu");
  const [marker, setMarker] = useState(1.5);

  const act = ACTIVATIONS[activeKey];

  const fCurve = useMemo(() => sampleCurve(act.f), [act]);
  const dfCurve = useMemo(() => sampleCurve(act.df), [act]);

  const fAtMarker = act.f(marker);
  const dfAtMarker = act.df(marker);
  const health = healthLabel(dfAtMarker, act.deadThreshold);

  // Map marker point to SVG for overlay dots on both curves.
  const mx = toSvgX(marker);
  const fDot = { x: mx, y: toSvgY(Math.max(VIEW.yMin, Math.min(VIEW.yMax, fAtMarker))) };
  const dfDot = { x: mx, y: toSvgY(Math.max(VIEW.yMin, Math.min(VIEW.yMax, dfAtMarker))) };

  // Drag handling on the SVG: clicking or dragging sets the marker x.
  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons === 0 && e.type !== "pointerdown") return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW.width;
    const dataX = fromSvgX(svgX);
    const clamped = Math.max(VIEW.xMin + 0.1, Math.min(VIEW.xMax - 0.1, dataX));
    setMarker(clamped);
  };

  return (
    <div className="my-6 rounded-lg border border-white/[0.08] bg-surface-1/40 p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(ACTIVATIONS) as ActivationKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveKey(k)}
            className={`rounded border px-3 py-1 text-xs transition-colors ${
              k === activeKey
                ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                : "border-white/10 bg-surface-0 text-white/70 hover:border-white/30"
            }`}
          >
            {ACTIVATIONS[k].label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          className="w-full max-w-[560px] cursor-crosshair touch-none rounded bg-surface-0 select-none"
          role="img"
          aria-label={`Plot of ${act.label} and its derivative. Drag to move the input marker.`}
          onPointerDown={handlePointer}
          onPointerMove={handlePointer}
        >
          {/* Grid lines */}
          {[-5, -3, -1, 1, 3, 5].map((gx) => (
            <line
              key={`gx-${gx}`}
              x1={toSvgX(gx)}
              y1={0}
              x2={toSvgX(gx)}
              y2={VIEW.height}
              stroke="rgba(255,255,255,0.04)"
            />
          ))}
          {[-1, 0, 1, 2].map((gy) => (
            <line
              key={`gy-${gy}`}
              x1={0}
              y1={toSvgY(gy)}
              x2={VIEW.width}
              y2={toSvgY(gy)}
              stroke="rgba(255,255,255,0.04)"
            />
          ))}

          {/* Axes */}
          <line
            x1={0}
            y1={toSvgY(0)}
            x2={VIEW.width}
            y2={toSvgY(0)}
            stroke="rgba(255,255,255,0.25)"
          />
          <line
            x1={toSvgX(0)}
            y1={0}
            x2={toSvgX(0)}
            y2={VIEW.height}
            stroke="rgba(255,255,255,0.25)"
          />

          {/* Activation f(x) */}
          <polyline
            points={fCurve}
            fill="none"
            stroke="rgb(125,211,252)"
            strokeWidth="2.5"
          />
          {/* Derivative f'(x) */}
          <polyline
            points={dfCurve}
            fill="none"
            stroke="rgb(244,114,182)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Marker vertical line */}
          <line
            x1={mx}
            y1={0}
            x2={mx}
            y2={VIEW.height}
            stroke="rgba(255,255,255,0.4)"
            strokeDasharray="2 4"
          />
          {/* Marker dots on both curves */}
          <circle cx={fDot.x} cy={fDot.y} r={5} fill="rgb(125,211,252)" />
          <circle cx={dfDot.x} cy={dfDot.y} r={4} fill="rgb(244,114,182)" />

          {/* Legend */}
          <g transform={`translate(${VIEW.width - 170}, 14)`}>
            <rect
              x={0}
              y={0}
              width={160}
              height={44}
              rx={4}
              fill="rgba(0,0,0,0.35)"
              stroke="rgba(255,255,255,0.08)"
            />
            <line x1={10} y1={16} x2={30} y2={16} stroke="rgb(125,211,252)" strokeWidth="2.5" />
            <text x={36} y={20} fill="rgb(226,232,240)" fontSize="11">
              f(x)
            </text>
            <line
              x1={10}
              y1={34}
              x2={30}
              y2={34}
              stroke="rgb(244,114,182)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text x={36} y={38} fill="rgb(226,232,240)" fontSize="11">
              f&apos;(x)
            </text>
          </g>

          {/* Axis labels */}
          <text x={VIEW.width - 12} y={toSvgY(0) - 6} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="end">
            x
          </text>
          <text x={toSvgX(0) + 6} y={12} fill="rgba(255,255,255,0.4)" fontSize="10">
            y
          </text>
        </svg>

        <div className="flex min-w-[220px] flex-col gap-3 text-sm">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-white/50">
              Input x = {marker.toFixed(2)}
            </label>
            <input
              type="range"
              min={VIEW.xMin + 0.1}
              max={VIEW.xMax - 0.1}
              step={0.01}
              value={marker}
              onChange={(e) => setMarker(parseFloat(e.target.value))}
              className="w-full accent-neon-cyan"
            />
            <p className="mt-1 text-xs text-white/40">
              Tip: you can also click/drag on the plot itself.
            </p>
          </div>

          <div className="rounded border border-white/10 bg-surface-0/70 p-3">
            <div className="mb-1 text-xs uppercase tracking-wide text-white/40">
              Live readout — {act.label}
            </div>
            <dl className="space-y-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-white/60">f(x)</dt>
                <dd className="font-mono text-cyan-300">{fAtMarker.toFixed(4)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">f&apos;(x)</dt>
                <dd className="font-mono text-pink-300">{dfAtMarker.toFixed(4)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Regime</dt>
                <dd
                  className={
                    health.tone === "bad"
                      ? "text-red-400"
                      : health.tone === "warn"
                        ? "text-amber-300"
                        : "text-emerald-300"
                  }
                >
                  {health.text}
                </dd>
              </div>
            </dl>
          </div>

          <p className="text-xs text-white/50">
            Move the marker into the saturated tails of sigmoid/tanh to see the
            gradient collapse to near zero — the vanishing-gradient problem
            that motivated ReLU and its smooth successors.
          </p>
        </div>
      </div>
    </div>
  );
}
