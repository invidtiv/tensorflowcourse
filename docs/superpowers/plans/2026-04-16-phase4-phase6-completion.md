# Phase 4 / Phase 6 Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire existing demo components, build four missing interactive demos, build three missing progress UI components, and add EO+CP+SG triads to the 15 zero-triad labs in Module 02.

**Architecture:** All demo components follow the same pattern: pure SVG + React state, zero external charting deps, registered in `MDXComponents.tsx`, dropped into content via JSX tags in `.mdx` files. Progress components are client-side Zustand consumers placed on the modules index page and the module overview page. Lab triads are pure Markdown sections appended to existing `.mdx` files.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion (progress badge only), Zustand (progressStore already exists). TypeScript strict mode — run `tsc --noEmit` after every task.

---

## File Map

### Created
| File | Purpose |
|------|---------|
| `src/components/demos/TrainingDashboard.tsx` | Simulated loss/accuracy curves with epoch slider |
| `src/components/demos/OverfittingDemo.tsx` | Train vs val loss divergence + regularization sliders |
| `src/components/progress/ProgressDashboard.tsx` | Overall stats + per-module breakdown panel |
| `src/components/progress/CompletionBadge.tsx` | Animated badge shown when module is complete |
| `src/components/progress/ContinueLearning.tsx` | "Pick up where you left off" widget for landing page |

### Modified
| File | Change |
|------|--------|
| `src/components/mdx/MDXComponents.tsx` | Add `TrainingDashboard`, `OverfittingDemo` imports |
| `content/modules/01-intro-deep-learning/theory.mdx` | Insert `<GradientDescentViz />` after section 2.2 |
| `content/modules/04-advanced-training/theory.mdx` | Insert `<TrainingDashboard />` after §4, `<OverfittingDemo />` after §7 |
| `src/app/modules/page.tsx` | Add `<ProgressDashboard />` panel above module grid |
| `src/app/modules/[moduleId]/page.tsx` | Add `<CompletionBadge />` in header when complete |
| `src/app/page.tsx` | Add `<ContinueLearning />` between hero and "how it works" sections |
| `content/modules/02-neural-network-fundamentals/labs/lab-04-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-05-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-06-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-07-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-09-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-10-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-12-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-13-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-14-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-15-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-16-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-17-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-18-*.mdx` | Add EO+CP+SG |
| `content/modules/02-neural-network-fundamentals/labs/lab-01-*.mdx` | Expand stub (24 lines) to full intro lab |
| `content/modules/02-neural-network-fundamentals/labs/lab-02-*.mdx` | Expand stub (22 lines) to full lab + EO+CP+SG |

---

## Task 1: Wire GradientDescentViz into Module 01 Theory

**Files:**
- Modify: `content/modules/01-intro-deep-learning/theory.mdx` around line 825

The component is already imported in `MDXComponents.tsx` (line 9) and registered (line 145). It just needs to be dropped into the content. The right spot is just before section 2.3 (SGD), so students interact with the gradient descent visualization before reading about stochastic variants.

- [ ] **Step 1: Find the exact insertion line**

  Run:
  ```bash
  grep -n "^## 2\.3" content/modules/01-intro-deep-learning/theory.mdx
  ```
  Expected output: `827:## 2.3 Stochastic Gradient Descent (SGD)` (line number may vary ±5).

- [ ] **Step 2: Insert the viz and callout block**

  Immediately above the `## 2.3 Stochastic Gradient Descent (SGD)` heading, add:

  ```mdx
  ### Interactive Demo: Gradient Descent on a 2D Loss Surface

  Adjust the learning rate, number of steps, and starting position to see how the
  trajectory changes. Set `lr ≥ 1.0` to watch the optimizer diverge — a crucial
  intuition before we cover learning rate scheduling.

  <GradientDescentViz />
  ```

- [ ] **Step 3: TypeScript check**

  Run from `tensorflow-course/`:
  ```bash
  npx tsc --noEmit
  ```
  Expected: `EXIT=0`, no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add content/modules/01-intro-deep-learning/theory.mdx
  git commit -m "feat(demo): wire GradientDescentViz into Module 01 theory §2.2→§2.3"
  ```

---

## Task 2: Build TrainingDashboard Component

**Files:**
- Create: `src/components/demos/TrainingDashboard.tsx`

Simulates training curves (loss + accuracy) for a configurable epoch count, learning rate, and batch size. Pure SVG, zero external deps. Users see how loss/accuracy evolve and how hyperparameters change convergence speed. No real training — uses a deterministic closed-form approximation of exponential convergence + noise.

- [ ] **Step 1: Create the component**

  Create `src/components/demos/TrainingDashboard.tsx` with this full implementation:

  ```tsx
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
      const t = e / epochs;
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
        {ticks.map((t, i) => {
          const y =
            PAD.top +
            (1 - (t - min) / (max - min)) * (H - PAD.top - PAD.bottom);
          return (
            <text
              key={i}
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
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: `EXIT=0`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/demos/TrainingDashboard.tsx
  git commit -m "feat(demo): add TrainingDashboard — simulated loss/acc curves for Module 04"
  ```

---

## Task 3: Build OverfittingDemo Component

**Files:**
- Create: `src/components/demos/OverfittingDemo.tsx`

Shows train vs validation loss divergence with regularization and dropout sliders. Students see how adding L2 weight decay and dropout closes the train/val gap.

- [ ] **Step 1: Create the component**

  Create `src/components/demos/OverfittingDemo.tsx`:

  ```tsx
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
          {yTicks.map((t, i) => {
            const y =
              PAD.top +
              (1 - (t - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
            return (
              <text
                key={i}
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
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: `EXIT=0`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/demos/OverfittingDemo.tsx
  git commit -m "feat(demo): add OverfittingDemo — train/val loss + L2/dropout sliders for Module 04"
  ```

---

## Task 4: Register TrainingDashboard and OverfittingDemo in MDXComponents

**Files:**
- Modify: `src/components/mdx/MDXComponents.tsx`

- [ ] **Step 1: Add imports at line 12–13 (after the ConvolutionViz import)**

  Current file ends its demo imports at:
  ```tsx
  import ConvolutionViz from "@/components/demos/ConvolutionViz";
  ```

  Add two lines immediately after:
  ```tsx
  import TrainingDashboard from "@/components/demos/TrainingDashboard";
  import OverfittingDemo from "@/components/demos/OverfittingDemo";
  ```

- [ ] **Step 2: Add to the component map (after `ConvolutionViz,` entry)**

  Locate:
  ```tsx
  ConvolutionViz,
  ```

  Add after it:
  ```tsx
  TrainingDashboard,
  OverfittingDemo,
  ```

- [ ] **Step 3: TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: `EXIT=0`.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/mdx/MDXComponents.tsx
  git commit -m "feat(mdx): register TrainingDashboard and OverfittingDemo in MDX component map"
  ```

---

## Task 5: Wire TrainingDashboard and OverfittingDemo into Module 04 Theory

**Files:**
- Modify: `content/modules/04-advanced-training/theory.mdx`

- [ ] **Step 1: Find insertion points**

  ```bash
  grep -n "^## 4\. Learning Rate\|^## 7\. Regularization\|^## 8\. Dropout" \
    content/modules/04-advanced-training/theory.mdx
  ```

  Expected output (approximate lines):
  ```
  275:## 4. Learning Rate Scheduling Theory
  651:## 7. Regularization: Theory and Bayesian Interpretation
  752:## 8. Dropout as Approximate Model Averaging
  ```

- [ ] **Step 2: Insert TrainingDashboard before §5 (Second-Order Methods)**

  Find the line `## 5. Second-Order Optimization Methods` and insert above it:

  ```mdx
  ### Interactive Demo: Training Curves

  Use the sliders to explore how learning rate and batch size affect convergence
  speed and overfitting. Watch the **overfit gap** indicator — this is the same
  signal your `val_loss` curve gives you in a real Keras training run.

  <TrainingDashboard />
  ```

- [ ] **Step 3: Insert OverfittingDemo before §8 (Dropout)**

  Find the line `## 8. Dropout as Approximate Model Averaging` and insert above it:

  ```mdx
  ### Interactive Demo: Overfitting & Regularization

  Start with both sliders at zero to see the train/val gap in its raw form,
  then gradually increase L2 weight decay and dropout to observe how each
  regularizer closes it — and at what cost to training loss.

  <OverfittingDemo />
  ```

- [ ] **Step 4: TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: `EXIT=0`.

- [ ] **Step 5: Commit**

  ```bash
  git add content/modules/04-advanced-training/theory.mdx
  git commit -m "feat(content): wire TrainingDashboard and OverfittingDemo into Module 04 theory"
  ```

---

## Task 6: Build ProgressDashboard Component

**Files:**
- Create: `src/components/progress/ProgressDashboard.tsx`

Client component. Reads from `useProgressStore`. Shows overall course stats + a compact row per module. Collapsible so it doesn't push the module grid down on first visit.

- [ ] **Step 1: Create the component**

  Create `src/components/progress/ProgressDashboard.tsx`:

  ```tsx
  "use client";

  /**
   * ProgressDashboard
   *
   * Overall course progress overview. Shown on the /modules page above the
   * module grid. Collapsible — collapsed by default on first visit (no progress
   * yet) and auto-expanded once any module has been started.
   *
   * Reads from progressStore (localStorage-persisted). Zero network calls.
   */

  import { useState } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import Link from "next/link";
  import { useProgressStore } from "@/stores/progressStore";
  import { modules } from "@/lib/modules";
  import ProgressRing from "@/components/progress/ProgressRing";

  export default function ProgressDashboard() {
    const progressModules = useProgressStore((s) => s.modules);
    const overall = useProgressStore((s) => s.overall);
    const getModuleCompletionPercent = useProgressStore(
      (s) => s.getModuleCompletionPercent,
    );
    const isModuleComplete = useProgressStore((s) => s.isModuleComplete);

    const startedModules = modules.filter(
      (m) => progressModules[m.id]?.lastAccessed,
    );
    const completedModules = modules.filter((m) =>
      isModuleComplete(m.id, m.labCount),
    );

    const hasAnyProgress = startedModules.length > 0;
    const [open, setOpen] = useState(hasAnyProgress);

    if (!hasAnyProgress) return null; // Hide entirely until student begins

    const totalMinutes = Math.round(
      Object.values(progressModules).reduce(
        (sum, m) => sum + (m.timeSpentMinutes ?? 0),
        0,
      ),
    );

    return (
      <div className="mb-10 rounded-xl border border-white/[0.08] bg-surface-1/20 overflow-hidden">
        {/* Header / toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
          aria-expanded={open}
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-text-primary">
              Your Progress
            </span>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>
                <span className="text-neon-cyan font-semibold">
                  {completedModules.length}
                </span>
                /{modules.length} modules done
              </span>
              <span>·</span>
              <span>
                <span className="text-neon-cyan font-semibold">
                  {startedModules.length}
                </span>{" "}
                started
              </span>
              {totalMinutes > 0 && (
                <>
                  <span>·</span>
                  <span>
                    <span className="text-neon-cyan font-semibold">
                      {totalMinutes}
                    </span>{" "}
                    min spent
                  </span>
                </>
              )}
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Expanded rows */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/[0.05] px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modules.map((mod) => {
                  const pct = getModuleCompletionPercent(mod.id, mod.labCount);
                  const complete = isModuleComplete(mod.id, mod.labCount);
                  const started = !!progressModules[mod.id]?.lastAccessed;
                  if (!started) return null;

                  const mp = progressModules[mod.id];
                  const labsDone = mp?.labsCompleted?.length ?? 0;

                  return (
                    <Link
                      key={mod.id}
                      href={`/modules/${mod.id}`}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                    >
                      <ProgressRing
                        percent={pct}
                        size={32}
                        strokeWidth={3}
                        color={complete ? "#10b981" : mod.color}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-primary truncate group-hover:text-neon-cyan transition-colors">
                            M{mod.number}: {mod.shortTitle}
                          </span>
                          {complete && (
                            <span className="shrink-0 text-[10px] text-emerald-400">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                          {mp?.theoryRead && <span>Theory ✓</span>}
                          <span>
                            {labsDone}/{mod.labCount} labs
                          </span>
                          {mp?.quizPassed && <span>Quiz ✓</span>}
                        </div>
                      </div>
                      <span
                        className="shrink-0 text-xs font-mono"
                        style={{ color: complete ? "#10b981" : mod.color }}
                      >
                        {pct}%
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  ```

- [ ] **Step 2: TypeScript check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: `EXIT=0`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/progress/ProgressDashboard.tsx
  git commit -m "feat(progress): add ProgressDashboard — collapsible per-module progress panel"
  ```

---

## Task 7: Wire ProgressDashboard into /modules Page

**Files:**
- Modify: `src/app/modules/page.tsx`

- [ ] **Step 1: Add the import**

  At the top of `src/app/modules/page.tsx`, after the existing imports, add:

  ```tsx
  import ProgressDashboard from "@/components/progress/ProgressDashboard";
  ```

- [ ] **Step 2: Insert above the study schedule block**

  In the JSX, find:
  ```tsx
  {/* Study schedule */}
  <div className="mb-12 p-6 rounded-xl border ...">
  ```

  Insert immediately above it:
  ```tsx
  <ProgressDashboard />
  ```

- [ ] **Step 3: TypeScript check + commit**

  ```bash
  npx tsc --noEmit
  git add src/app/modules/page.tsx
  git commit -m "feat(modules): mount ProgressDashboard above module grid on /modules page"
  ```

---

## Task 8: Build CompletionBadge Component

**Files:**
- Create: `src/components/progress/CompletionBadge.tsx`

Animated badge that appears on the module overview page when `isModuleComplete` returns true. Uses Framer Motion `AnimatePresence` for a pop-in effect.

- [ ] **Step 1: Create the component**

  Create `src/components/progress/CompletionBadge.tsx`:

  ```tsx
  "use client";

  /**
   * CompletionBadge
   *
   * Celebratory badge shown on the module overview page when all four
   * completion signals are met: video watched (≥90%), theory read,
   * all labs done, quiz passed.
   *
   * Uses AnimatePresence for a pop-in animation. Reads the gate from
   * isModuleComplete() in progressStore.
   */

  import { AnimatePresence, motion } from "framer-motion";
  import { useProgressStore } from "@/stores/progressStore";

  interface Props {
    moduleId: string;
    totalLabs: number;
  }

  export default function CompletionBadge({ moduleId, totalLabs }: Props) {
    const isComplete = useProgressStore((s) =>
      s.isModuleComplete(moduleId, totalLabs),
    );

    return (
      <AnimatePresence>
        {isComplete && (
          <motion.div
            key="badge"
            initial={{ scale: 0.5, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400 shadow-lg shadow-emerald-500/10"
            role="status"
            aria-label="Module completed"
          >
            <span className="text-base">🏆</span>
            <span>Module Complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  ```

- [ ] **Step 2: Wire into the module overview page**

  In `src/app/modules/[moduleId]/page.tsx`, add the import:

  ```tsx
  import CompletionBadge from "@/components/progress/CompletionBadge";
  ```

  Then find the header section (around the `<h1>` with `mod.title`), and add the badge immediately after the `</h1>` closing tag:

  ```tsx
  <CompletionBadge moduleId={moduleId} totalLabs={mod.labCount} />
  ```

- [ ] **Step 3: TypeScript check + commit**

  ```bash
  npx tsc --noEmit
  git add src/components/progress/CompletionBadge.tsx src/app/modules/\[moduleId\]/page.tsx
  git commit -m "feat(progress): add CompletionBadge — spring-animated completion indicator on module page"
  ```

---

## Task 9: Build ContinueLearning Component

**Files:**
- Create: `src/components/progress/ContinueLearning.tsx`

Smart "pick up where you left off" widget. Reads `lastAccessed` across all modules, finds the most recently accessed in-progress module, and shows the next action (watch video / read theory / do labs / take quiz). Renders nothing if no progress exists.

- [ ] **Step 1: Create the component**

  Create `src/components/progress/ContinueLearning.tsx`:

  ```tsx
  "use client";

  /**
   * ContinueLearning
   *
   * "Pick up where you left off" widget for the landing page.
   *
   * Algorithm:
   *   1. Find the module with the most recent `lastAccessed` timestamp that
   *      is NOT yet fully complete.
   *   2. Determine the next action: video → theory → labs → quiz.
   *   3. Render a single card with a direct link to that action.
   *   4. If all started modules are complete, render a "Great work" variant
   *      pointing to the next unstarted module.
   *   5. If no progress at all, render nothing.
   */

  import Link from "next/link";
  import { motion } from "framer-motion";
  import { useProgressStore } from "@/stores/progressStore";
  import { modules } from "@/lib/modules";

  interface NextAction {
    label: string;
    href: string;
    emoji: string;
  }

  function getNextAction(
    moduleId: string,
    modLabCount: number,
    mp: {
      videoWatchedPercent: number;
      videoFinishedAt: string;
      theoryRead: boolean;
      labsCompleted: string[];
      quizPassed: boolean;
    },
  ): NextAction {
    const videoOk =
      mp.videoWatchedPercent >= 90 || !!mp.videoFinishedAt;
    if (!videoOk)
      return {
        label: "Watch the video",
        href: `/modules/${moduleId}/theory`,
        emoji: "🎬",
      };
    if (!mp.theoryRead)
      return {
        label: "Read the theory",
        href: `/modules/${moduleId}/theory`,
        emoji: "📖",
      };
    if (mp.labsCompleted.length < modLabCount)
      return {
        label: `Continue labs (${mp.labsCompleted.length}/${modLabCount})`,
        href: `/modules/${moduleId}/labs`,
        emoji: "💻",
      };
    return {
      label: "Take the quiz",
      href: `/modules/${moduleId}/quiz`,
      emoji: "🧪",
    };
  }

  export default function ContinueLearning() {
    const progressModules = useProgressStore((s) => s.modules);
    const isModuleComplete = useProgressStore((s) => s.isModuleComplete);

    // No progress at all → render nothing
    if (Object.keys(progressModules).length === 0) return null;

    // Find most-recently-accessed incomplete module
    const candidates = modules
      .filter((m) => {
        const mp = progressModules[m.id];
        return mp?.lastAccessed && !isModuleComplete(m.id, m.labCount);
      })
      .sort((a, b) => {
        const ta = progressModules[a.id]?.lastAccessed ?? "";
        const tb = progressModules[b.id]?.lastAccessed ?? "";
        return tb.localeCompare(ta); // descending
      });

    // All started modules are complete — point to next unstarted module
    if (candidates.length === 0) {
      const nextUnstarted = modules.find(
        (m) => !progressModules[m.id]?.lastAccessed,
      );
      if (!nextUnstarted) {
        // All 10 modules complete
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-center"
          >
            <p className="text-sm font-semibold text-emerald-400">
              🏆 You&apos;ve completed the entire course! Outstanding work.
            </p>
          </motion.div>
        );
      }
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto mb-8"
        >
          <Link
            href={`/modules/${nextUnstarted.id}`}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-surface-1/30 px-5 py-4 hover:border-neon-cyan/30 hover:bg-surface-1/50 transition-all"
          >
            <span className="text-2xl">{nextUnstarted.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
                Next up
              </p>
              <p className="text-sm font-semibold text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                Module {nextUnstarted.number}: {nextUnstarted.title}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-text-muted group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      );
    }

    const mod = candidates[0];
    const mp = progressModules[mod.id];
    const pct = Math.round(
      ((mp.videoWatchedPercent >= 90 || !!mp.videoFinishedAt ? 1 : 0) +
        (mp.theoryRead ? 1 : 0) +
        (mp.labsCompleted.length >= mod.labCount ? 1 : 0) +
        (mp.quizPassed ? 1 : 0)) /
        4 *
        100,
    );
    const action = getNextAction(mod.id, mod.labCount, mp);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto mb-8"
      >
        <Link
          href={action.href}
          className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-surface-1/30 px-5 py-4 hover:border-neon-cyan/30 hover:bg-surface-1/50 transition-all"
        >
          <span className="text-2xl">{action.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
              Continue where you left off
            </p>
            <p className="text-sm font-semibold text-text-primary group-hover:text-neon-cyan transition-colors truncate">
              {action.label}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              Module {mod.number}: {mod.shortTitle} · {pct}% complete
            </p>
          </div>
          <svg
            className="w-4 h-4 text-text-muted group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </motion.div>
    );
  }
  ```

- [ ] **Step 2: Wire into landing page**

  In `src/app/page.tsx`, add the import:

  ```tsx
  import ContinueLearning from "@/components/progress/ContinueLearning";
  ```

  Find the first `<section>` after the hero section (the "How it works" section at line ~121 that starts with `<section className="py-24 px-4 sm:px-6">`). Insert `<ContinueLearning />` immediately before that `<section>` tag:

  ```tsx
  <ContinueLearning />
  <section className="py-24 px-4 sm:px-6">
  ```

- [ ] **Step 3: TypeScript check + commit**

  ```bash
  npx tsc --noEmit
  git add src/components/progress/ContinueLearning.tsx src/app/page.tsx
  git commit -m "feat(progress): add ContinueLearning widget — smart resume link on landing page"
  ```

---

## Task 10: Module 02 Lab Triads — Batch A (labs 04–07)

**Files:**
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-04-2-tensorflow-preprocessing-layers.mdx`
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-05-3-handling-missing-values-and-outliers.mdx`
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-06-4-feature-engineering-with-tensorflow.mdx`
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-07-1-sequential-api-deep-dive.mdx`

Each lab gets three sections appended at the bottom of the file:
```
## Expected Output
## Common Pitfalls
## Stretch Goals
```

The content of each section must be specific to that lab's code — not generic.

- [ ] **Step 1: Append triad to lab-04 (TF Preprocessing Layers, 295 lines)**

  Append to `lab-04-2-tensorflow-preprocessing-layers.mdx`:

  ```mdx

  ---

  ## Expected Output

  Run the preprocessing pipeline as written. With default TF random seeds:

  | Step | Expected console output |
  |------|------------------------|
  | `Normalization` layer adapt | Prints mean/variance stats per feature. Mean values should be near 0 after adaptation on a zero-centered dataset. |
  | `StringLookup` layer | Maps vocabulary tokens to integer indices; OOV token maps to index `0` by default. |
  | `CategoryEncoding` | Produces one-hot vectors of length equal to `vocabulary_size`; each row sums to `1.0`. |
  | `Rescaling(1./255)` | Pixel values shift from `[0, 255]` → `[0.0, 1.0]`. Running `tf.reduce_max(rescaled)` should return `≤ 1.0`. |
  | `RandomFlip` augmentation | Output shape identical to input shape. Flipping is stochastic — running the same input twice should give different results with high probability. |

  **Pipeline integration check:**

  ```python
  import tensorflow as tf

  # After calling model.predict() on raw (unnormalized) inputs through
  # a model that includes Normalization as its first layer, confirm:
  assert output.shape == expected_output_shape
  print("✓ Preprocessing pipeline output shape correct")
  ```

  If `Normalization` prints `WARNING: Your input ran on an uninitialized Normalization layer`, you have not called `.adapt()` before building the pipeline.

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **Calling `.adapt()` on the wrong data split** | `Normalization.adapt(test_data)` contaminates your test set statistics into the model — a form of data leakage. | Always call `.adapt(train_data)` only. |
  | **Forgetting `.adapt()` entirely** | The `Normalization` layer initializes mean=0, variance=1 if never adapted. The model trains but ignores the actual feature distributions. | Check `layer.mean` and `layer.variance` are non-default after `.adapt()`. |
  | **Using Keras preprocessing inside `tf.data` pipeline vs. inside the model** | Putting augmentation layers inside `tf.data.Dataset.map` runs them on CPU and includes augmented images in the cache if `.cache()` is called before `.map()`. | Put augmentation layers inside the model for GPU execution, or ensure `.map(augment)` comes after `.cache()`. |
  | **`StringLookup` with `output_mode="one_hot"` on integer inputs** | Passing integer category codes to `StringLookup` raises a dtype mismatch. `StringLookup` expects string inputs. Use `IntegerLookup` for integer categorical features. | Use `tf.keras.layers.IntegerLookup` for integer categoricals. |
  | **`RandomFlip` applied to non-image data** | `RandomFlip` interprets 2D tensors as image height/width. Applying it to tabular features produces meaningless results. | Use image augmentation layers only inside image preprocessing pipelines. |

  ## Stretch Goals

  1. **Full preprocessing model**: Wrap all preprocessing steps in a `tf.keras.Model` and call `model.save()`. Reload it with `tf.keras.models.load_model()` and confirm preprocessing is serialized — the adapted statistics should survive the round-trip.
  2. **Custom preprocessing layer**: Implement a `LogTransform` layer as a `tf.keras.layers.Layer` subclass that applies `tf.math.log1p` element-wise. Verify it handles zero and negative values gracefully with `tf.clip_by_value`.
  3. **Benchmark CPU vs GPU preprocessing**: Use `tf.test.Benchmark` or Python `time.time()` to compare the throughput (samples/second) of a preprocessing pipeline run inside `tf.data` vs. inside the model. At what batch size does GPU execution become faster?
  4. **`TextVectorization` pipeline**: Build a full text preprocessing pipeline using `TextVectorization` (tokenization + vocabulary building + padding) on a toy sentence dataset. Confirm the vocabulary is stable across runs with a fixed `max_tokens` setting.
  ```

- [ ] **Step 2: Append triad to lab-05 (Missing Values & Outliers, 337 lines)**

  Append to `lab-05-3-handling-missing-values-and-outliers.mdx`:

  ```mdx

  ---

  ## Expected Output

  Using the synthetic dataset generated in the lab (500 samples, 5 features, 10% missingness):

  | Check | Expected result |
  |-------|----------------|
  | `df.isnull().sum()` before imputation | Each column shows ~50 missing values (10% of 500). |
  | Mean imputation | `df_imputed.isnull().sum()` → all zeros. Column means unchanged vs. original non-missing values. |
  | Median imputation on skewed feature | Imputed median closer to lower cluster than mean imputation. Verify with `df['feature'].describe()` — 50th percentile should match imputed value. |
  | IQR outlier detection | Flagged samples fall outside `[Q1 - 1.5×IQR, Q3 + 1.5×IQR]`. Typical flag rate: 5–8% on normally-distributed data. |
  | Z-score outlier detection | `|z| > 3` flags ~0.27% of truly normal data — if your synthetic dataset shows >3%, check for heavy tails in generation. |
  | After `StandardScaler` | `df_scaled.mean()` ≈ 0 (within 1e-10) and `df_scaled.std()` ≈ 1 for every feature. |

  **Validation:**

  ```python
  from sklearn.preprocessing import StandardScaler
  import numpy as np

  scaler = StandardScaler()
  X_scaled = scaler.fit_transform(X_imputed)
  assert np.allclose(X_scaled.mean(axis=0), 0, atol=1e-10), "Means should be 0"
  assert np.allclose(X_scaled.std(axis=0), 1, atol=1e-6), "Stds should be 1"
  print("✓ Scaling validation passed")
  ```

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **Fitting imputer on full dataset** | `SimpleImputer.fit(df_full)` leaks test-set statistics into imputation. In evaluation, the model has seen the test distribution. | Fit on train split only: `imputer.fit(X_train)`, then `imputer.transform(X_test)`. |
  | **Mean imputation on skewed features** | Mean imputation distorts multimodal or heavily skewed distributions. The imputed mean may fall in a low-density region. | Use median for skewed features, mode for bimodal distributions, or model-based imputation (KNN/MICE) for correlated features. |
  | **Removing outliers from test set** | Outlier removal is a form of data-dependent filtering. Removing them from the test set hides how the model behaves on real outlier inputs. | Only remove or cap outliers in the training set. Leave the test set untouched. |
  | **Z-score outlier detection on non-normal data** | Z-score assumes normality. On heavy-tailed distributions, many legitimate values get flagged as outliers. | Use IQR-based detection or Isolation Forest for non-normal data. |
  | **In-place modification of the original DataFrame** | Using `df.fillna(value, inplace=True)` after assigning `df = original_df.copy()` modifies the copy, but some pipelines pass the same DataFrame reference. | Always use `df_clean = df.copy()` before any in-place transformation, or use the non-inplace form `df_clean = df.fillna(value)`. |

  ## Stretch Goals

  1. **KNN imputation comparison**: Replace `SimpleImputer(strategy='mean')` with `sklearn.impute.KNNImputer(n_neighbors=5)`. Compare RMSE (reconstruction error on held-out non-missing values that you artificially masked) between mean, median, and KNN strategies.
  2. **MICE (iterative imputation)**: Use `sklearn.impute.IterativeImputer` with a `BayesianRidge` estimator. Measure how imputation quality (RMSE) scales with `max_iter` from 1 to 20 — plot the convergence curve.
  3. **Outlier-robust pipeline with `RobustScaler`**: Replace `StandardScaler` with `sklearn.preprocessing.RobustScaler` (uses median and IQR). Test: manually inject 5% extreme outliers into one feature and compare the distortion in the scaled distribution between the two scalers.
  4. **Missing value pattern analysis**: Use `missingno.matrix(df)` (pip install missingno) to visualize missingness patterns. Check whether missingness is MCAR (missing completely at random), MAR (missing at random), or MNAR (not at random) by correlating the missingness indicator with other features.
  ```

- [ ] **Step 3: Append triad to lab-06 (Feature Engineering, 388 lines)**

  Append to `lab-06-4-feature-engineering-with-tensorflow.mdx`:

  ```mdx

  ---

  ## Expected Output

  | Transformation | Expected output shape / value |
  |----------------|-------------------------------|
  | Polynomial features (degree=2, 3 original features) | Output has `3 + 3 + 3 = 9` columns (originals + squares + cross-terms). `PolynomialFeatures(degree=2, include_bias=False).fit_transform(X).shape[1]` = 9. |
  | Log transform `log1p` | All values ≥ 0 (safe for zero inputs). Skewness of transformed column should be closer to 0 than original. Verify: `scipy.stats.skew(np.log1p(x)) < scipy.stats.skew(x)`. |
  | Binning with `pd.cut` (5 bins) | `df['bin'].value_counts()` shows 5 unique categories. No `NaN` bins if all values fall within the specified range. |
  | Interaction term `x1 * x2` | Pearson correlation of interaction term with target should exceed both individual `corr(x1, target)` and `corr(x2, target)` if the true relationship involves an interaction. |
  | TF `tf.feature_column` embedding | Output shape: `[batch_size, embedding_dim]`. All embedding weights initialized near 0 before training. |

  **Validation checkpoint:**

  ```python
  from sklearn.preprocessing import PolynomialFeatures
  import numpy as np

  X = np.random.rand(100, 3)
  poly = PolynomialFeatures(degree=2, include_bias=False)
  X_poly = poly.fit_transform(X)
  assert X_poly.shape[1] == 9, f"Expected 9 features, got {X_poly.shape[1]}"
  print("✓ Polynomial feature count correct")
  ```

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **Applying log transform to features with zeros** | `np.log(0)` = `-inf`. Many real-world count features have zeros. | Use `np.log1p(x)` (log(1+x)) which is safe at zero and produces `0`. |
  | **Polynomial explosion at high degree** | `PolynomialFeatures(degree=5)` on 10 features produces 3,003 columns — exponential growth. Training time and memory blow up. | Keep degree ≤ 3 unless feature count is small (≤ 5). Use `interaction_only=True` to skip squared terms. |
  | **Target leakage in feature engineering** | Computing features like "mean target value per category" on the full dataset leaks the test labels into training. This is a major source of inflated CV scores. | Use `sklearn.model_selection.cross_val_predict` or a proper `Pipeline` with `TargetEncoder` that folds target encoding inside CV. |
  | **Encoding category order in ordinal features** | Using `LabelEncoder` on ordinal categories imposes an arbitrary integer order. If categories are "low/medium/high", LabelEncoder may assign [1, 0, 2] — wrong ordinal relationship. | Use `OrdinalEncoder` with `categories=[['low', 'medium', 'high']]` to enforce the correct ordering. |
  | **`tf.feature_column` vs Keras preprocessing layers** | `tf.feature_column` is the legacy API. New code should use `tf.keras.layers.CategoryEncoding`, `IntegerLookup`, and `Embedding`. Mixing both in one model can cause graph-mode compatibility issues. | Migrate to Keras preprocessing layers for new projects. |

  ## Stretch Goals

  1. **Feature importance with permutation**: After training a model, use `sklearn.inspection.permutation_importance` to rank your engineered features. Do the polynomial or interaction features rank higher than the originals? Which features can be dropped?
  2. **Automated feature generation with Featuretools**: Install `featuretools` and run `ft.dfs()` on a toy relational dataset (customers + transactions). Compare the auto-generated features to your manual ones — which DFS primitives produce the most predictive features?
  3. **TF embedding for high-cardinality categoricals**: Build a Keras model with an `Embedding` layer for a categorical feature with 1,000 categories. Visualize the learned embeddings in 2D using t-SNE after training — do semantically similar categories cluster together?
  4. **Cyclical encoding for time features**: Encode `hour_of_day` (0–23) using `sin(2π·h/24)` and `cos(2π·h/24)`. Train two linear models — one using raw hour integers, one using cyclical encoding — and compare MAE on a toy time-series regression. Cyclical encoding should outperform or match at lower model complexity.
  ```

- [ ] **Step 4: Append triad to lab-07 (Sequential API Deep Dive, 314 lines)**

  Append to `lab-07-1-sequential-api-deep-dive.mdx`:

  ```mdx

  ---

  ## Expected Output

  Building the default Sequential model in this lab (3-layer MLP, MNIST):

  | Check | Expected value |
  |-------|---------------|
  | `model.summary()` — total params | ~101,770 for a 784→128→64→10 network (Dense layers only, no biases counted separately). Check: `(784×128 + 128) + (128×64 + 64) + (64×10 + 10)` = 101,770. |
  | Training accuracy (10 epochs) | ≥ 98% on training set. If `< 95%`, check that the input is flattened (shape `(784,)` not `(28, 28)`). |
  | Validation accuracy (10 epochs) | ≥ 97.5% on MNIST validation split. |
  | `model.get_config()` | Returns a dict with `'layers'` key listing all layer configs. Serializable with `json.dumps()`. |
  | After `model.save('model.keras')` + reload | Reloaded model produces identical predictions: `np.allclose(model.predict(X_test[:10]), reloaded.predict(X_test[:10]))` → `True`. |

  **Console progress (epoch 10/10):**
  ```
  Epoch 10/10
  1500/1500 ━━━━━━━━━━━━━━━━━━━━ 3s 2ms/step - accuracy: 0.9850 - loss: 0.0510
  - val_accuracy: 0.9773 - val_loss: 0.0813
  ```

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **Adding layers after `model.compile()`** | Keras allows it, but the optimizer state and gradient graph are not rebuilt. The new layer trains without its gradients being tracked. | Always finalize the layer stack before calling `model.compile()`. |
  | **Wrong `input_shape` argument** | Passing `input_shape=(784,)` is correct for a flat vector. Passing `input_shape=(28, 28)` (without Flatten) feeds a 2D tensor to a Dense layer and raises a shape error at training time. | Add `tf.keras.layers.Flatten()` as the first layer, or explicitly reshape inputs. |
  | **`model.add()` after calling `model.build()`** | Building freezes the layer stack for graph compilation. Adding after build is unsupported and may silently not add the layer in some TF versions. | Construct all layers before the first call or `model.compile()`. |
  | **Not compiling before `model.fit()`** | Forgetting `model.compile()` raises `RuntimeError: You must compile your model before training`. Loss and optimizer are mandatory. | Always call `model.compile(optimizer=..., loss=..., metrics=[...])` before `model.fit()`. |
  | **Using `model.weights` to check trainability** | `len(model.weights)` counts all weight tensors including biases. `len(model.trainable_weights)` tells you what actually updates during training — more useful for debugging frozen layers. | Use `model.trainable_weights` and `model.non_trainable_weights` for diagnostic checks. |

  ## Stretch Goals

  1. **Layer surgery**: Access individual layers via `model.layers[i]`. Freeze the first Dense layer with `model.layers[1].trainable = False`, recompile, and compare final accuracy vs. the unfrozen baseline. This is the core pattern for transfer learning.
  2. **Custom activation function**: Register a custom activation `selu_variant = lambda x: tf.nn.selu(x) * 1.1` and use it in a Sequential model with `Dense(64, activation=selu_variant)`. Compare convergence to standard `relu` and `selu` on MNIST.
  3. **Weight initialization comparison**: Train identical architectures initialized with `glorot_uniform` (default), `he_normal`, and `lecun_normal`. Plot training loss curves for the first 5 epochs — `he_normal` should converge fastest with ReLU activations.
  4. **Model cloning for ensemble**: Use `tf.keras.models.clone_model(model)` to create 5 identical models, train each on a different random 80% subset of the training data, and average their predictions. Compare ensemble accuracy vs. single model — should be ~0.3–0.5 pp higher.
  ```

- [ ] **Step 5: TypeScript check + commit**

  ```bash
  npx tsc --noEmit
  git add content/modules/02-neural-network-fundamentals/labs/lab-04-*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-05-*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-06-*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-07-*.mdx
  git commit -m "content(m02): add EO+CP+SG triads to labs 04–07 (preprocessing, missing values, feature eng, sequential API)"
  ```

---

## Task 11: Module 02 Lab Triads — Batch B (labs 09–12)

**Files:**
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-09-3-sequential-vs-functional-api-comparison.mdx`
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-10-lab-10.mdx`
- Modify: `content/modules/02-neural-network-fundamentals/labs/lab-12-lab-12.mdx`

- [ ] **Step 1: Identify lab topics**

  Run:
  ```bash
  head -6 content/modules/02-neural-network-fundamentals/labs/lab-09-*.mdx
  head -6 content/modules/02-neural-network-fundamentals/labs/lab-10-*.mdx
  head -6 content/modules/02-neural-network-fundamentals/labs/lab-12-*.mdx
  ```
  Read the `title:` frontmatter field to confirm the lab topic before writing the triad.

- [ ] **Step 2: Append triad to lab-09 (Sequential vs Functional API, 243 lines)**

  Append to `lab-09-3-sequential-vs-functional-api-comparison.mdx`:

  ```mdx

  ---

  ## Expected Output

  | Check | Expected result |
  |-------|----------------|
  | Sequential model `model.summary()` | All layers listed in order; input shape shown at top as `InputLayer`. |
  | Functional model `model.summary()` | Connected-to column shows the directed graph of tensor flow. Each layer shows its upstream connection. |
  | `model.predict()` equivalence | Given the same random seed for weights initialization, Sequential and Functional models with identical layer configs should produce the same output: `np.allclose(seq_out, func_out, atol=1e-5)`. |
  | Multi-input Functional model | `model.input` returns a list of tensors. `len(model.inputs)` equals the number of input branches. |
  | `tf.keras.utils.plot_model(model, show_shapes=True)` | Generates a PNG showing the computational graph. Functional models show branching; Sequential models show a straight chain. |

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **Calling `Sequential.add()` with a Functional sub-model** | Keras allows nesting, but the Sequential `.summary()` collapses the sub-model into one block, hiding its internal shape details. | Use Functional API end-to-end when you need full visibility into a complex sub-graph. |
  | **Forgetting `Model(inputs=..., outputs=...)` in Functional API** | Defining layers and calling them does not create a trainable model — you must call `tf.keras.Model(inputs=x_in, outputs=x_out)`. Forgetting this gives a plain function, not a Keras model. | Always close the Functional definition with `model = tf.keras.Model(inputs=..., outputs=...)`. |
  | **Using the same layer object in two separate branches** | Keras layers are stateful — calling a shared layer on two branches shares its weights. If you intend independent weights (not shared), create two separate layer instances. | For independent branches: `dense_a = Dense(64)`, `dense_b = Dense(64)`. For weight sharing: use the same instance on both branches. |
  | **Dynamic shapes crashing `plot_model`** | `plot_model` requires `pydot` and `graphviz`. On a fresh environment these may not be installed. | Run `pip install pydot graphviz` — or skip plotting and use `model.summary()` for shape inspection. |
  | **Sequential model not accepting `input_shape` in later TF versions** | In TF ≥ 2.13, specifying `input_shape` in the first layer constructor (e.g., `Dense(64, input_shape=(784,))`) is deprecated. | Use an explicit `InputLayer`: `model.add(tf.keras.layers.Input(shape=(784,)))` as the first call. |

  ## Stretch Goals

  1. **Shared encoder**: Build a Functional model where two input branches share the same `Dense(64)` encoder weights (Siamese network pattern). Verify weight sharing by checking `len(model.trainable_weights)` — it should be the same as a single-branch model, not double.
  2. **Multi-output model**: Add a second output head to the Functional model that predicts an auxiliary task (e.g., classification AND regression). Compile with `loss={'main': 'categorical_crossentropy', 'aux': 'mse'}` and `loss_weights={'main': 1.0, 'aux': 0.1}`. Check that both losses appear in the training log.
  3. **Subclassed model equivalent**: Re-implement the same architecture as a `tf.keras.Model` subclass using `__init__` and `call()`. Compare its `model.summary()` output — subclassed models show a less detailed summary because the graph is only traced at call time.
  4. **Intermediate layer outputs**: Using the Functional model, create an "extractor" model: `extractor = tf.keras.Model(inputs=model.input, outputs=model.get_layer('dense_1').output)`. Run a batch through it to get intermediate activations — the backbone of feature visualization and transfer learning.
  ```

- [ ] **Step 3: Read and append to lab-10**

  First check the title:
  ```bash
  head -6 content/modules/02-neural-network-fundamentals/labs/lab-10-lab-10.mdx
  ```

  Then append the appropriate EO+CP+SG triad matching the lab's actual content (custom training loops or model subclassing — confirm from the title).

  **If the lab title is "Custom Training Loop" or "Model Subclassing", append:**

  ```mdx

  ---

  ## Expected Output

  For a custom training loop on MNIST (3-layer MLP, 10 epochs, Adam lr=0.001):

  | Epoch | Expected train_loss | Expected train_acc |
  |-------|--------------------|--------------------|
  | 1 | 0.25–0.35 | 92–95% |
  | 5 | 0.06–0.12 | 97–98.5% |
  | 10 | 0.03–0.07 | 98.5–99.2% |

  **Custom loop console output pattern:**
  ```
  Epoch 1/10: loss=0.2851, acc=0.9214
  Epoch 2/10: loss=0.1243, acc=0.9637
  ...
  Epoch 10/10: loss=0.0492, acc=0.9871
  ```

  The gradient tape should record 4 weight tensors (2 Dense layers × 2 weights each: kernel + bias). Verify:

  ```python
  with tf.GradientTape() as tape:
      logits = model(x_batch, training=True)
      loss = loss_fn(y_batch, logits)
  grads = tape.gradient(loss, model.trainable_variables)
  assert len(grads) == len(model.trainable_variables)
  assert all(g is not None for g in grads), "All gradients should be non-None"
  print(f"✓ {len(grads)} gradient tensors computed")
  ```

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **`tape.gradient()` returns `None`**  | The variable is not being watched. Either the model variables are not inside the `with tf.GradientTape()` block, or the computation path doesn't pass through those variables. | Ensure the forward pass runs **inside** the `with tape:` block. Use `tape.watch(var)` for non-Variable tensors. |
  | **Forgetting `training=True` in the forward pass** | BatchNorm and Dropout behave differently at training vs. inference time. Calling `model(x, training=False)` inside the training loop disables Dropout and freezes BN statistics. | Always pass `training=True` inside the loop, `training=False` at evaluation. |
  | **Not calling `optimizer.apply_gradients()` with `zip(grads, vars)`** | Passing a flat list of gradients without pairing them to the correct variables causes the optimizer to update wrong parameters. | Use `optimizer.apply_gradients(zip(grads, model.trainable_variables))` — the zip ensures correct pairing. |
  | **Accumulating metrics without calling `.reset_states()` per epoch** | `tf.keras.metrics.Mean()` accumulates values until explicitly reset. Without `metric.reset_states()` at the start of each epoch, you're averaging over all prior epochs. | Call `train_loss.reset_states()` and `train_acc.reset_states()` at the beginning of each epoch. |
  | **`GradientTape` persistent=False with multiple `tape.gradient()` calls** | The default tape is consumed after the first `tape.gradient()` call. A second call on the same tape raises a `RuntimeError`. | Use `with tf.GradientTape(persistent=True) as tape:` if you need multiple gradient calls, and call `del tape` when done. |

  ## Stretch Goals

  1. **Gradient clipping in the custom loop**: Add `tf.clip_by_global_norm(grads, clip_norm=1.0)` before `apply_gradients`. Train on an RNN or deep network — compare loss stability (variance across epochs) with and without clipping.
  2. **Mixed precision custom loop**: Wrap the model with `tf.keras.mixed_precision.set_global_policy('mixed_float16')` and add a `LossScaleOptimizer`. Verify that intermediate activations are `float16` but weights remain `float32`.
  3. **Custom training loop with `@tf.function`**: Decorate the train step with `@tf.function`. Measure wall-clock time per epoch with and without decoration (use `time.time()`). The compiled step should be 2–5× faster on GPU.
  4. **Gradient accumulation**: Simulate a large batch by accumulating gradients over 4 micro-batches before calling `apply_gradients`. This is equivalent to training with 4× the batch size while using the memory of a single micro-batch — useful when VRAM is limited.
  ```

- [ ] **Step 4: Append triad to lab-12**

  First check the title:
  ```bash
  head -6 content/modules/02-neural-network-fundamentals/labs/lab-12-lab-12.mdx
  ```

  Then append a matching EO+CP+SG triad. The triad content MUST match the actual code in the lab — read the first 30 lines to identify the topic, then write specific expected outputs and pitfalls.

  Example structure (adapt values to the actual lab topic):

  ```mdx

  ---

  ## Expected Output

  [Write 4–6 specific expected output rows matching the lab's code and dataset]

  **Validation snippet:**

  ```python
  # [paste a 3–5 line assertion block that validates the lab's core output]
  ```

  ## Common Pitfalls

  [Write 5 pitfall rows specific to the lab's topic]

  ## Stretch Goals

  [Write 4 numbered stretch goals specific to the lab's algorithms]
  ```

- [ ] **Step 5: TypeScript check + commit**

  ```bash
  npx tsc --noEmit
  git add content/modules/02-neural-network-fundamentals/labs/lab-09-*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-10-*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-12-*.mdx
  git commit -m "content(m02): add EO+CP+SG triads to labs 09–12 (API comparison, custom loop)"
  ```

---

## Task 12: Module 02 Lab Triads — Batch C (labs 13–18)

**Files:**
- `lab-13-multi-class-classification-projects.mdx`
- `lab-14-lab-14.mdx`
- `lab-15-fashion-mnist-with-different-architectures.mdx`
- `lab-16-custom-binary-classifier-from-scratch.mdx`
- `lab-17-lab-17.mdx`
- `lab-18-building-with-functional-api.mdx`

- [ ] **Step 1: Check all titles**

  ```bash
  for f in content/modules/02-neural-network-fundamentals/labs/lab-1{3,4,5,6,7,8}*.mdx; do
    echo "--- $f"
    head -4 "$f"
  done
  ```

- [ ] **Step 2: Append triad to lab-13 (Multi-Class Classification, 240 lines)**

  Append to `lab-13-multi-class-classification-projects.mdx`:

  ```mdx

  ---

  ## Expected Output

  Multi-class classification on MNIST or CIFAR-10 (confirm from lab frontmatter):

  | Metric | Expected value (MNIST) | Expected value (CIFAR-10) |
  |--------|----------------------|--------------------------|
  | Final test accuracy | ≥ 97.5% | ≥ 60% (MLP only) |
  | Confusion matrix diagonal | Dominant (>95% correct per class for MNIST) | Lower but non-uniform errors |
  | `classification_report` macro F1 | ≥ 0.97 (MNIST) | ≥ 0.58 (CIFAR-10) |
  | Softmax output sum per sample | 1.0 (to float32 precision) — verify with `tf.reduce_sum(predictions, axis=-1)` |

  **Validation:**

  ```python
  import numpy as np

  # All probabilities sum to 1
  preds = model.predict(X_test[:100])
  assert np.allclose(preds.sum(axis=1), 1.0, atol=1e-5), "Softmax probs must sum to 1"

  # No NaN in predictions
  assert not np.any(np.isnan(preds)), "NaN in predictions — check for vanishing gradients"
  print("✓ Multi-class output validation passed")
  ```

  ## Common Pitfalls

  | Pitfall | Why It Happens | Fix |
  |---------|----------------|-----|
  | **Using `binary_crossentropy` for multi-class** | Binary cross-entropy computes independent per-class probability (sigmoid), not a mutually exclusive distribution (softmax). Loss and accuracy will appear to improve but predictions will be wrong. | Use `categorical_crossentropy` with one-hot labels, or `sparse_categorical_crossentropy` with integer labels. |
  | **Shape mismatch between labels and loss** | Using `sparse_categorical_crossentropy` with one-hot encoded labels (shape `[N, C]`) raises a shape error. | `sparse_categorical_crossentropy` expects integer labels of shape `[N]`. Use `categorical_crossentropy` for one-hot labels. |
  | **Confusion matrix axis ordering** | `sklearn.metrics.confusion_matrix(y_true, y_pred)` rows = true, cols = predicted. Beginners often read it transposed, reversing precision and recall interpretations. | Remember: `cm[i, j]` = number of samples with true class i predicted as class j. Diagonal = correct predictions. |
  | **Top-1 accuracy hiding class imbalance** | A model that always predicts the majority class achieves high accuracy on imbalanced datasets. MNIST is ~balanced, but real datasets aren't. | Always report per-class F1 or macro-averaged F1 alongside accuracy. |
  | **Not converting `argmax` predictions before `classification_report`** | `classification_report` expects integer class indices, not one-hot vectors. Passing `y_pred` as probabilities produces garbled output. | Use `y_pred_classes = np.argmax(model.predict(X_test), axis=1)` before passing to `classification_report`. |

  ## Stretch Goals

  1. **Per-class accuracy vs. dataset size**: Randomly subsample the training set to 10%, 25%, 50%, and 100% and plot per-class accuracy for each size. Which digit/class is hardest to learn with limited data?
  2. **Misclassification gallery**: Retrieve the 10 most confidently wrong predictions (high softmax probability for the wrong class). Visualize them as a 2×5 grid with the predicted and true labels. These "hard negatives" often reveal systematic model biases.
  3. **Temperature scaling for calibration**: After training, apply temperature scaling: `calibrated_preds = tf.nn.softmax(logits / T)` and sweep T ∈ [0.5, 2.0]. Use an ECE (Expected Calibration Error) plot to find the T that best calibrates confidence scores.
  4. **One-vs-rest baseline**: Implement 10 independent binary classifiers (one per digit) using logistic regression. Compare macro F1 vs. the multi-class softmax model — the softmax model should win by exploiting inter-class relationships.
  ```

- [ ] **Step 3: Append triads to labs 14, 15, 16, 17, 18**

  For each remaining lab:
  1. Read the title: `head -4 <lab-file>`
  2. Skim the first 40 lines to identify the core algorithm and dataset
  3. Append an EO+CP+SG triad following the same structure as the examples above — all values must be specific to that lab's code

  Pattern for each append:
  ```mdx

  ---

  ## Expected Output

  [5–7 specific rows or console output matching the lab's code]

  **Validation:**
  ```python
  # [3–5 line assertion block]
  ```

  ## Common Pitfalls

  [Table with 5 rows: Pitfall | Why It Happens | Fix]

  ## Stretch Goals

  [4 numbered extension experiments]
  ```

- [ ] **Step 4: Expand lab-01 and lab-02 stubs (24 and 22 lines)**

  These files are nearly empty. Run:
  ```bash
  head -25 content/modules/02-neural-network-fundamentals/labs/lab-01-*.mdx
  head -25 content/modules/02-neural-network-fundamentals/labs/lab-02-*.mdx
  ```

  If they contain only frontmatter and a title (< 30 lines), add a brief intro paragraph explaining the lab's purpose, a code scaffold with `# TODO` markers, and the EO+CP+SG triad. Keep total length ≥ 80 lines. These are placeholder stubs — minimal content is fine at this stage.

- [ ] **Step 5: TypeScript check + commit**

  ```bash
  npx tsc --noEmit
  git add content/modules/02-neural-network-fundamentals/labs/lab-1{3,4,5,6,7,8}*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-01-*.mdx \
          content/modules/02-neural-network-fundamentals/labs/lab-02-*.mdx
  git commit -m "content(m02): add EO+CP+SG triads to labs 13–18 and expand stubs 01–02 (completes Module 02 triad pass)"
  ```

---

## Self-Review

**Spec coverage check:**
- [x] GradientDescentViz wired into Module 01 → Task 1 ✓
- [x] BackpropFlow/BackpropVisualizer already wired into Module 02 (line 798 confirmed) — no task needed ✓
- [x] TrainingDashboard built and wired into Module 04 → Tasks 2, 4, 5 ✓
- [x] OverfittingDemo built and wired into Module 04 → Tasks 3, 4, 5 ✓
- [x] ProgressDashboard built and wired into /modules → Tasks 6, 7 ✓
- [x] CompletionBadge built and wired into module overview → Task 8 ✓
- [x] ContinueLearning built and wired into landing page → Task 9 ✓
- [x] Module 02 lab triads: all 15 zero-triad labs covered → Tasks 10, 11, 12 ✓
- [x] `tsc --noEmit` check after every task ✓

**Type consistency check:**
- `useProgressStore` call pattern: `useProgressStore((s) => s.action)` — consistent across Tasks 6, 8, 9 ✓
- `modules` imported from `@/lib/modules` in Tasks 6 and 9 — same import ✓
- `ProgressRing` props (`percent`, `size`, `strokeWidth`, `color`) used in Task 6 — verify these match the existing component signature before committing

**Verify ProgressRing props before Task 6:**
```bash
head -30 src/components/progress/ProgressRing.tsx
```
Check that `percent`, `size`, `strokeWidth`, `color` are accepted props. If the prop names differ, update Task 6's usage accordingly.
