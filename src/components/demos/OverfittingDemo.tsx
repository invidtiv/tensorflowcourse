"use client";

/**
 * OverfittingDemo
 *
 * Phase 6 — interactive demo for Module 4 §7 (Regularization).
 *
 * Visualizes the train/validation loss gap (overfitting) and how L2
 * weight decay + dropout tighten it. Deterministic simulation — no real
 * model training.
 *
 * Zero external deps. Pure SVG + React state.
 * Registered in MDX via <OverfittingDemo /> — see MDXComponents.tsx.
 */

import { useMemo, useState } from "react";

function noise(e: number, seed: number, amp: number): number {
  const x = Math.sin(e * 127.1 + seed * 311.7) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * amp;
}

/**
 * Simulate a 100-epoch run.
 * - baseOverfit = gap between train and val loss without regularization.
 * - l2 and dropout both reduce baseOverfit multiplicatively.
 * - Dropout also slows convergence (higher train loss) — a cost.
 */
function simulate(
  l2: number,
  dropout: number,
  epochs: number,
): { train: number[]; val: number[] } {
  const regularizationEffect = 1 - Math.min(0.9, l2 * 80 + dropout * 1.5);
  const baseOverfit = 0.6; // val - train gap without regularization
  const overfitGap = baseOverfit * regularizationEffect;
  const trainingSlowdown = 1 + dropout * 0.8 + l2 * 10;
  const k = 0.6 / trainingSlowdown;

  const train: number[] = [];
  const val: number[] = [];

  for (let e = 1; e <= epochs; e++) {
    const decay = Math.exp(-k * e * (60 / epochs));
    const tl = 0.12 + 1.8 * decay + noise(e, 1, 0.015);
    const vl = tl + overfitGap * (1 - 0.3 * decay) + noise(e, 2, 0.012);
    train.push(Math.max(0.01, tl));
    val.push(Math.max(0.01, vl));
  }
  return { train, val };
}

// ── SVG helpers ───────────────────────────────────────────────────────────

const W = 480;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

function polyPoints(
  values: number[],
  yMin: number,
  yMax: number,
): string {
  const n = values.length;
  if (n <= 1) return "";
  return values
    .map((v, i) => {
      const x = PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
      const y =
        PAD.top +
        (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function GapShading({
  train,
  val,
  yMin,
  yMax,
}: {
  train: number[];
  val: number[];
  yMin: number;
  yMax: number;
}) {
  const n = train.length;
  if (n <= 1) return null;
  const top = val.map((v, i) => {
    const x = PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
    const y =
      PAD.top +
      (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const bottom = [...train]
    .reverse()
    .map((v, i) => {
      const ri = train.length - 1 - i;
      const x = PAD.left + (ri / (n - 1)) * (W - PAD.left - PAD.right);
      const y =
        PAD.top +
        (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  return (
    <polygon
      points={[...top, ...bottom].join(" ")}
      fill="rgba(239,68,68,0.08)"
      stroke="none"
    />
  );
}

export default function OverfittingDemo() {
  const [l2, setL2] = useState(0);
  const [dropout, setDropout] = useState(0);
  const epochs = 100;

  const { train, val } = useMemo(
    () => simulate(l2, dropout, epochs),
    [l2, dropout],
  );

  const yMin = 0;
  const yMax = Math.max(...train, ...val) * 1.08;
  const finalGap = val[val.length - 1] - train[train.length - 1];
  const gapStatus =
    finalGap > 0.35
      ? { label: "High overfitting", color: "text-red-400" }
      : finalGap > 0.12
        ? { label: "Mild overfitting", color: "text-yellow-400" }
        : { label: "Well-regularized", color: "text-emerald-400" };

  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  return (
    <div className="my-8 rounded-xl border border-white/10 bg-surface-1 p-4 shadow-lg">
      <h3 className="mb-1 text-sm font-semibold text-neon-cyan uppercase tracking-widest">
        Interactive Demo — Overfitting &amp; Regularization
      </h3>
      <p className="mb-4 text-xs text-text-secondary">
        Adjust L2 weight decay and dropout rate to see how they reduce the
        train/val gap.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded bg-[#050510] mb-4"
        style={{ maxHeight: H }}
        role="img"
        aria-label="Train and validation loss curves"
      >
        {/* Y-axis labels */}
        {yTicks.map((t) => {
          const y =
            PAD.top +
            (1 - (t - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
          return (
            <text
              key={t}
              x={PAD.left - 4}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#475569"
            >
              {t.toFixed(2)}
            </text>
          );
        })}

        {/* X-axis labels */}
        {[1, 50, 100].map((t) => {
          const x =
            PAD.left +
            ((t - 1) / (epochs - 1)) * (W - PAD.left - PAD.right);
          return (
            <text
              key={t}
              x={x}
              y={H - 4}
              textAnchor="middle"
              fontSize={9}
              fill="#475569"
            >
              {t}
            </text>
          );
        })}

        {/* Gap shading */}
        <GapShading train={train} val={val} yMin={yMin} yMax={yMax} />

        {/* Curves */}
        <polyline
          points={polyPoints(train, yMin, yMax)}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
        />
        <polyline
          points={polyPoints(val, yMin, yMax)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="5 3"
        />

        {/* Legend */}
        <circle cx={PAD.left + 8} cy={PAD.top + 8} r={4} fill="#22d3ee" />
        <text
          x={PAD.left + 16}
          y={PAD.top + 12}
          fontSize={9}
          fill="#22d3ee"
        >
          train loss
        </text>
        <line
          x1={PAD.left + 76}
          y1={PAD.top + 8}
          x2={PAD.left + 88}
          y2={PAD.top + 8}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        <text
          x={PAD.left + 92}
          y={PAD.top + 12}
          fontSize={9}
          fill="#ef4444"
        >
          val loss
        </text>
      </svg>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs text-text-secondary">
        <label className="flex flex-col gap-1">
          <span>
            L2 weight decay:{" "}
            <span className="font-mono text-neon-cyan">{l2.toFixed(4)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={0.05}
            step={0.0005}
            value={l2}
            onChange={(e) => setL2(parseFloat(e.target.value))}
            className="accent-cyan-400"
            aria-label="L2 weight decay"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>
            Dropout rate:{" "}
            <span className="font-mono text-neon-cyan">
              {dropout.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={0.7}
            step={0.05}
            value={dropout}
            onChange={(e) => setDropout(parseFloat(e.target.value))}
            className="accent-cyan-400"
            aria-label="Dropout rate"
          />
        </label>
      </div>

      {/* Readout */}
      <div className="rounded-lg border border-white/[0.07] bg-[#050510] p-3 font-mono text-xs grid grid-cols-3 gap-x-6 text-text-secondary">
        <span>
          final train:{" "}
          <span className="text-neon-cyan">
            {train[train.length - 1].toFixed(4)}
          </span>
        </span>
        <span>
          final val:{" "}
          <span className="text-red-400">
            {val[val.length - 1].toFixed(4)}
          </span>
        </span>
        <span className={gapStatus.color}>
          gap: {finalGap.toFixed(3)} — {gapStatus.label}
        </span>
      </div>

      <p className="mt-3 text-xs text-white/40">
        Start at <code>l2 = 0, dropout = 0</code> to see pure overfitting,
        then increase regularization to close the gap.
      </p>
    </div>
  );
}
