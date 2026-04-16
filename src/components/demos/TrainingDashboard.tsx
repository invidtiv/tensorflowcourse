"use client";

/**
 * TrainingDashboard
 *
 * Phase 6 — interactive demo for Module 4 (Advanced Training).
 *
 * Simulates training curves (loss + accuracy) with a closed-form
 * exponential-convergence model. Users adjust learning rate, batch
 * size, and epoch count via sliders and see how those choices affect
 * convergence speed and final performance — without running real code.
 *
 * Zero external deps. Pure SVG + React state. Consistent style with
 * GradientDescentViz / ActivationFunctionViz.
 *
 * Registered in MDX via <TrainingDashboard /> — see MDXComponents.tsx.
 */

import { useMemo, useState } from "react";

// ── Simulation model ──────────────────────────────────────────────────────

/** Deterministic pseudo-random noise seeded by epoch + seed. */
function noise(epoch: number, seed: number, amplitude: number): number {
  const x = Math.sin(epoch * 127.1 + seed * 311.7) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * amplitude;
}

interface Curve {
  trainLoss: number[];
  valLoss: number[];
  trainAcc: number[];
  valAcc: number[];
}

/**
 * Simulate training curves.
 *
 * Model:
 *   trainLoss(t) = L0 * exp(-k * t) + noise
 *   valLoss(t)   = trainLoss(t) * (1 + overfit_gap)
 *   trainAcc(t)  = A_max * (1 - exp(-k * t)) + noise
 *   valAcc(t)    = trainAcc(t) - gap
 *
 * k (convergence speed) scales with lr and inversely with batchSize.
 * overfit_gap increases as lr rises and batchSize drops.
 */
function simulate(lr: number, batchSize: number, epochs: number): Curve {
  const k = 0.8 * lr * (64 / batchSize) ** 0.3;
  const overfitGap = 0.12 * lr * (64 / batchSize) ** 0.2;
  const accMax = 0.97 - overfitGap * 0.4;
  const L0 = 2.5;

  const trainLoss: number[] = [];
  const valLoss: number[] = [];
  const trainAcc: number[] = [];
  const valAcc: number[] = [];

  for (let e = 1; e <= epochs; e++) {
    const tl = L0 * Math.exp(-k * e * (50 / epochs)) + noise(e, 1, 0.03 * L0);
    const vl = tl * (1 + overfitGap) + noise(e, 2, 0.025 * L0);
    const ta = accMax * (1 - Math.exp(-k * e * (50 / epochs))) + noise(e, 3, 0.008);
    const va = ta - overfitGap * 0.6 + noise(e, 4, 0.006);

    trainLoss.push(Math.max(0.001, tl));
    valLoss.push(Math.max(0.001, vl));
    trainAcc.push(Math.min(1, Math.max(0, ta)));
    valAcc.push(Math.min(1, Math.max(0, va)));
  }
  return { trainLoss, valLoss, trainAcc, valAcc };
}

// ── SVG helpers ───────────────────────────────────────────────────────────

const W = 480;
const H = 160;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

function toPoints(values: number[], minV: number, maxV: number): string {
  const n = values.length;
  if (n <= 1) return "";
  return values
    .map((v, i) => {
      const x = PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
      const y =
        PAD.top +
        (1 - (v - minV) / (maxV - minV)) * (H - PAD.top - PAD.bottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function YAxisLabels({
  min,
  max,
  fmt,
}: {
  min: number;
  max: number;
  fmt: (v: number) => string;
}) {
  const ticks = [max, (max + min) / 2, min];
  return (
    <>
      {ticks.map((t) => {
        const y =
          PAD.top +
          (1 - (t - min) / (max - min)) * (H - PAD.top - PAD.bottom);
        return (
          <text
            key={t}
            x={PAD.left - 4}
            y={y + 4}
            textAnchor="end"
            fontSize={9}
            fill="#475569"
          >
            {fmt(t)}
          </text>
        );
      })}
    </>
  );
}

function XAxisLabels({ epochs }: { epochs: number }) {
  const ticks = [1, Math.round(epochs / 2), epochs];
  return (
    <>
      {ticks.map((t) => {
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
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export default function TrainingDashboard() {
  const [lr, setLr] = useState(0.01);
  const [batchSize, setBatchSize] = useState(64);
  const [epochs, setEpochs] = useState(50);

  const curve = useMemo(
    () => simulate(lr, batchSize, epochs),
    [lr, batchSize, epochs],
  );

  const lossMin = 0;
  const lossMax = Math.max(...curve.trainLoss, ...curve.valLoss) * 1.05;
  const accMin = Math.min(...curve.trainAcc, ...curve.valAcc) * 0.97;
  const accMax = 1.01;

  const finalTrainLoss = curve.trainLoss[curve.trainLoss.length - 1];
  const finalValLoss = curve.valLoss[curve.valLoss.length - 1];
  const finalTrainAcc = curve.trainAcc[curve.trainAcc.length - 1];
  const finalValAcc = curve.valAcc[curve.valAcc.length - 1];
  const overfitGap = ((finalValLoss - finalTrainLoss) / finalTrainLoss) * 100;

  return (
    <div className="my-8 rounded-xl border border-white/10 bg-surface-1 p-4 shadow-lg">
      <h3 className="mb-1 text-sm font-semibold text-neon-cyan uppercase tracking-widest">
        Interactive Demo — Training Dashboard
      </h3>
      <p className="mb-4 text-xs text-text-secondary">
        Simulated training curves · adjust hyperparameters to see their effect
      </p>

      {/* Loss chart */}
      <div className="mb-1">
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 ml-10">
          Loss
        </p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded bg-[#050510]"
          style={{ maxHeight: H }}
        >
          <YAxisLabels
            min={lossMin}
            max={lossMax}
            fmt={(v) => v.toFixed(2)}
          />
          <XAxisLabels epochs={epochs} />
          <polyline
            points={toPoints(curve.trainLoss, lossMin, lossMax)}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
          />
          <polyline
            points={toPoints(curve.valLoss, lossMin, lossMax)}
            fill="none"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          {/* Legend */}
          <circle cx={PAD.left + 8} cy={PAD.top + 8} r={4} fill="#22d3ee" />
          <text x={PAD.left + 16} y={PAD.top + 12} fontSize={9} fill="#22d3ee">
            train
          </text>
          <line
            x1={PAD.left + 48}
            y1={PAD.top + 8}
            x2={PAD.left + 60}
            y2={PAD.top + 8}
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <text x={PAD.left + 64} y={PAD.top + 12} fontSize={9} fill="#f97316">
            val
          </text>
        </svg>
      </div>

      {/* Accuracy chart */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1 ml-10">
          Accuracy
        </p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded bg-[#050510]"
          style={{ maxHeight: H }}
        >
          <YAxisLabels
            min={accMin}
            max={accMax}
            fmt={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <XAxisLabels epochs={epochs} />
          <polyline
            points={toPoints(curve.trainAcc, accMin, accMax)}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
          />
          <polyline
            points={toPoints(curve.valAcc, accMin, accMax)}
            fill="none"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          {/* Legend */}
          <circle cx={PAD.left + 8} cy={PAD.top + 8} r={4} fill="#22d3ee" />
          <text x={PAD.left + 16} y={PAD.top + 12} fontSize={9} fill="#22d3ee">
            train
          </text>
          <line
            x1={PAD.left + 48}
            y1={PAD.top + 8}
            x2={PAD.left + 60}
            y2={PAD.top + 8}
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <text x={PAD.left + 64} y={PAD.top + 12} fontSize={9} fill="#f97316">
            val
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-xs text-text-secondary">
        <label className="flex flex-col gap-1">
          <span>
            Learning rate:{" "}
            <span className="font-mono text-neon-cyan">{lr.toFixed(4)}</span>
          </span>
          <input
            type="range"
            min={0.0001}
            max={0.1}
            step={0.0001}
            value={lr}
            onChange={(e) => setLr(parseFloat(e.target.value))}
            className="accent-cyan-400"
            aria-label="Learning rate"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>
            Batch size:{" "}
            <span className="font-mono text-neon-cyan">{batchSize}</span>
          </span>
          <input
            type="range"
            min={8}
            max={512}
            step={8}
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
            className="accent-cyan-400"
            aria-label="Batch size"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>
            Epochs:{" "}
            <span className="font-mono text-neon-cyan">{epochs}</span>
          </span>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value, 10))}
            className="accent-cyan-400"
            aria-label="Epochs"
          />
        </label>
      </div>

      {/* Readout */}
      <div className="rounded-lg border border-white/[0.07] bg-[#050510] p-3 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-text-secondary">
        <span>
          train loss:{" "}
          <span className="text-neon-cyan">{finalTrainLoss.toFixed(4)}</span>
        </span>
        <span>
          val loss:{" "}
          <span className="text-tf-orange">{finalValLoss.toFixed(4)}</span>
        </span>
        <span>
          train acc:{" "}
          <span className="text-neon-cyan">
            {(finalTrainAcc * 100).toFixed(1)}%
          </span>
        </span>
        <span>
          val acc:{" "}
          <span className="text-tf-orange">
            {(finalValAcc * 100).toFixed(1)}%
          </span>
        </span>
        <span
          className={`col-span-2 mt-1 ${overfitGap > 20 ? "text-red-400" : overfitGap > 8 ? "text-yellow-400" : "text-emerald-400"}`}
        >
          overfit gap: {overfitGap.toFixed(1)}%{" "}
          {overfitGap > 20
            ? "⚠ significant — add regularization"
            : overfitGap > 8
              ? "~ mild"
              : "✓ healthy"}
        </span>
      </div>

      <p className="mt-3 text-xs text-white/40">
        Try <code>lr = 0.05, batch = 8</code> to see aggressive overfitting.
        Drop lr or raise batch size to reduce the gap.
      </p>
    </div>
  );
}
