"use client";

/**
 * ConvolutionViz
 *
 * Phase 6 — interactive convolution operation demo.
 *
 * Visualises 2D convolution step-by-step on a small input grid:
 *   - A 6×6 input grid (editable pixel intensities 0–9)
 *   - A 3×3 kernel (editable weights, preset to common filters)
 *   - Animated step-by-step sliding of the kernel over the input
 *   - Real-time computation of the output feature map
 *   - Controls: stride (1–2), padding (valid / same), animation speed
 *   - Preset kernels: identity, sharpen, edge-detect, blur
 *
 * Pure SVG + React state — zero charting deps, works fully offline/localhost.
 * Registered in MDX via `<ConvolutionViz />` — see MDXComponents.tsx.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Grid = number[][];

interface ConvStep {
  row: number;  // top-left corner of kernel placement on (padded) input
  col: number;
  outRow: number;
  outCol: number;
  sum: number;
}

// ─── Preset Kernels ───────────────────────────────────────────────────────────

const PRESETS: Record<string, { label: string; kernel: Grid }> = {
  identity: {
    label: "Identity",
    kernel: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  },
  sharpen: {
    label: "Sharpen",
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  edge: {
    label: "Edge detect",
    kernel: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ],
  },
  blur: {
    label: "Box blur",
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  sobelX: {
    label: "Sobel X",
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
};

// ─── Default input (6×6 checkerboard with a small feature) ───────────────────

const DEFAULT_INPUT: Grid = [
  [8, 8, 8, 0, 0, 0],
  [8, 8, 8, 0, 0, 0],
  [8, 8, 8, 0, 0, 0],
  [0, 0, 0, 8, 8, 8],
  [0, 0, 0, 8, 8, 8],
  [0, 0, 0, 8, 8, 8],
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function padGrid(grid: Grid, pad: number): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  const pRows = rows + 2 * pad;
  const pCols = cols + 2 * pad;
  const padded: Grid = Array.from({ length: pRows }, () => Array(pCols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      padded[r + pad][c + pad] = grid[r][c];
    }
  }
  return padded;
}

function computeConvolution(
  input: Grid,
  kernel: Grid,
  stride: number,
  padding: number
): { output: Grid; steps: ConvStep[] } {
  const padded = padGrid(input, padding);
  const inH = padded.length;
  const inW = padded[0].length;
  const kH = kernel.length;
  const kW = kernel[0].length;
  const outH = Math.floor((inH - kH) / stride) + 1;
  const outW = Math.floor((inW - kW) / stride) + 1;
  const output: Grid = Array.from({ length: outH }, () => Array(outW).fill(0));
  const steps: ConvStep[] = [];

  for (let or = 0; or < outH; or++) {
    for (let oc = 0; oc < outW; oc++) {
      const ir = or * stride;
      const ic = oc * stride;
      let sum = 0;
      for (let kr = 0; kr < kH; kr++) {
        for (let kc = 0; kc < kW; kc++) {
          sum += padded[ir + kr][ic + kc] * kernel[kr][kc];
        }
      }
      output[or][oc] = sum;
      steps.push({ row: ir, col: ic, outRow: or, outCol: oc, sum });
    }
  }
  return { output, steps };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Map an output value to a 0–255 intensity for colour display.
function normaliseOutput(output: Grid): Grid {
  let min = Infinity;
  let max = -Infinity;
  for (const row of output) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const range = max - min || 1;
  return output.map((row) => row.map((v) => Math.round(((v - min) / range) * 255)));
}

function intensityToColor(v: number, normalised: number): string {
  // Blue-tinted for negative, green for positive, dark for zero.
  if (v < 0) {
    const t = clamp(normalised / 255, 0, 1);
    return `rgb(${Math.round(50 + t * 100)},${Math.round(50 + t * 50)},${Math.round(150 + t * 105)})`;
  }
  const t = clamp(normalised / 255, 0, 1);
  return `rgb(${Math.round(t * 0)},${Math.round(150 + t * 105)},${Math.round(100 + t * 55)})`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GridCell({
  value,
  x,
  y,
  size,
  highlighted = false,
  dimmed = false,
  editable = false,
  onChange,
}: {
  value: number;
  x: number;
  y: number;
  size: number;
  highlighted?: boolean;
  dimmed?: boolean;
  editable?: boolean;
  onChange?: (v: number) => void;
}) {
  const bg = highlighted
    ? "#00d4ff33"
    : dimmed
    ? "#0a0a1a"
    : `rgba(${Math.round(value * 28)},${Math.round(value * 28)},${Math.round(value * 28 + 20)},1)`;

  return (
    <g
      style={{ cursor: editable ? "pointer" : "default" }}
      onClick={
        editable && onChange
          ? () => onChange((value + 1) % 10)
          : undefined
      }
    >
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={bg}
        stroke={highlighted ? "#00d4ff" : "#1a1a3a"}
        strokeWidth={highlighted ? 1.5 : 0.5}
        rx={2}
      />
      <text
        x={x + size / 2}
        y={y + size / 2 + 4}
        textAnchor="middle"
        fontSize={size > 30 ? 11 : 9}
        fill={highlighted ? "#00d4ff" : dimmed ? "#333" : "#94a3b8"}
        style={{ userSelect: "none" }}
      >
        {value}
      </text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ConvolutionViz() {
  const [inputGrid, setInputGrid] = useState<Grid>(DEFAULT_INPUT);
  const [kernel, setKernel] = useState<Grid>(PRESETS.edge.kernel);
  const [selectedPreset, setSelectedPreset] = useState("edge");
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState<"valid" | "same">("valid");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400); // ms per step

  const paddingVal = padding === "same" ? 1 : 0;

  const { output, steps } = useMemo(
    () => computeConvolution(inputGrid, kernel, stride, paddingVal),
    [inputGrid, kernel, stride, paddingVal]
  );

  const normOutput = useMemo(() => normaliseOutput(output), [output]);
  const totalSteps = steps.length;

  // Clamp stepIndex when output size changes
  const safeStep = Math.min(stepIndex, totalSteps - 1);
  const currentStep = steps[safeStep] ?? null;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlaying = useCallback(() => {
    setPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          stopPlaying();
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, totalSteps, stopPlaying]);

  function handlePreset(key: string) {
    setSelectedPreset(key);
    setKernel(PRESETS[key].kernel.map((r) => [...r]));
    setStepIndex(0);
    stopPlaying();
  }

  function handleKernelChange(r: number, c: number, raw: string) {
    const v = parseInt(raw, 10);
    if (isNaN(v)) return;
    setKernel((prev) =>
      prev.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? v : val)))
    );
    setSelectedPreset("custom");
    setStepIndex(0);
    stopPlaying();
  }

  function handleInputChange(r: number, c: number, v: number) {
    setInputGrid((prev) =>
      prev.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? v : val)))
    );
    setStepIndex(0);
    stopPlaying();
  }

  function handleReset() {
    setStepIndex(0);
    stopPlaying();
  }

  function handlePlayPause() {
    if (playing) {
      stopPlaying();
    } else {
      if (safeStep >= totalSteps - 1) setStepIndex(0);
      setPlaying(true);
    }
  }

  // ── Layout constants ────────────────────────────────────────────────────────
  const CELL = 38;
  const GAP = 24;
  const inRows = inputGrid.length;
  const inCols = inputGrid[0].length;
  const outRows = output.length;
  const outCols = output[0].length;
  const kSize = 3;
  const kCellSize = 32;

  const inputW = inCols * CELL;
  const inputH = inRows * CELL;
  const outputW = outCols * CELL;
  const outputH = outRows * CELL;
  const kernelW = kSize * kCellSize;
  const kernelH = kSize * kCellSize;

  const SVG_W = inputW + GAP * 3 + kernelW + GAP + outputW + 16;
  const SVG_H = Math.max(inputH, kernelH, outputH) + 48;

  // Offsets
  const inputOffX = 8;
  const inputOffY = 40;
  const kernelOffX = inputOffX + inputW + GAP * 2;
  const kernelOffY = inputOffY + (inputH - kernelH) / 2;
  const outputOffX = kernelOffX + kernelW + GAP * 2;
  const outputOffY = inputOffY + (inputH - outputH) / 2;

  // Highlight which cells in the input are covered by current step
  const highlightSet = new Set<string>();
  if (currentStep) {
    for (let kr = 0; kr < kSize; kr++) {
      for (let kc = 0; kc < kSize; kc++) {
        const pr = currentStep.row + kr;
        const pc = currentStep.col + kc;
        // Convert padded coords back to original grid coords
        const origR = pr - paddingVal;
        const origC = pc - paddingVal;
        if (origR >= 0 && origR < inRows && origC >= 0 && origC < inCols) {
          highlightSet.add(`${origR},${origC}`);
        }
      }
    }
  }

  return (
    <div className="my-8 rounded-xl border border-surface-2 bg-surface-1 p-4 shadow-lg">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-base font-semibold text-neon-cyan">⚙️ Convolution Explorer</span>
        <span className="text-xs text-muted">
          Step {Math.min(safeStep + 1, totalSteps)} / {totalSteps}
        </span>
      </div>

      {/* Controls row */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        {/* Preset selector */}
        <div className="flex items-center gap-1">
          <span className="text-muted">Kernel:</span>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              className={`rounded px-2 py-0.5 transition-colors ${
                selectedPreset === key
                  ? "bg-neon-cyan text-black font-semibold"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stride */}
        <div className="flex items-center gap-1">
          <span className="text-muted">Stride:</span>
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => { setStride(s); setStepIndex(0); stopPlaying(); }}
              className={`rounded px-2 py-0.5 transition-colors ${
                stride === s
                  ? "bg-purple text-white font-semibold"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Padding */}
        <div className="flex items-center gap-1">
          <span className="text-muted">Padding:</span>
          {(["valid", "same"] as const).map((p) => (
            <button
              key={p}
              onClick={() => { setPadding(p); setStepIndex(0); stopPlaying(); }}
              className={`rounded px-2 py-0.5 transition-colors ${
                padding === p
                  ? "bg-purple text-white font-semibold"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1">
          <span className="text-muted">Speed:</span>
          {[{ label: "Slow", v: 800 }, { label: "Med", v: 400 }, { label: "Fast", v: 150 }].map(({ label, v }) => (
            <button
              key={v}
              onClick={() => setSpeed(v)}
              className={`rounded px-2 py-0.5 transition-colors ${
                speed === v
                  ? "bg-tf-orange text-black font-semibold"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG canvas */}
      <div className="overflow-x-auto">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ fontFamily: "JetBrains Mono, monospace", display: "block" }}
        >
          {/* Labels */}
          <text x={inputOffX + inputW / 2} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8">
            Input (6×6) — click to edit
          </text>
          <text x={kernelOffX + kernelW / 2} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8">
            Kernel (3×3)
          </text>
          <text x={outputOffX + outputW / 2} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8">
            Output ({outRows}×{outCols})
          </text>

          {/* Operator symbols */}
          <text
            x={inputOffX + inputW + GAP}
            y={inputOffY + inputH / 2 + 6}
            textAnchor="middle"
            fontSize={20}
            fill="#00d4ff"
          >
            ★
          </text>
          <text
            x={kernelOffX + kernelW + GAP}
            y={inputOffY + inputH / 2 + 6}
            textAnchor="middle"
            fontSize={20}
            fill="#00d4ff"
          >
            →
          </text>

          {/* Input grid */}
          {inputGrid.map((row, r) =>
            row.map((v, c) => (
              <GridCell
                key={`in-${r}-${c}`}
                value={v}
                x={inputOffX + c * CELL}
                y={inputOffY + r * CELL}
                size={CELL - 2}
                highlighted={highlightSet.has(`${r},${c}`)}
                editable
                onChange={(nv) => handleInputChange(r, c, nv)}
              />
            ))
          )}

          {/* Kernel grid (editable via number input rendered below SVG) */}
          {kernel.map((row, r) =>
            row.map((v, c) => (
              <g key={`k-${r}-${c}`}>
                <rect
                  x={kernelOffX + c * kCellSize}
                  y={kernelOffY + r * kCellSize}
                  width={kCellSize - 2}
                  height={kCellSize - 2}
                  fill={v > 0 ? "#0d2a1a" : v < 0 ? "#2a0d1a" : "#111827"}
                  stroke="#00d4ff"
                  strokeWidth={0.8}
                  rx={2}
                />
                <text
                  x={kernelOffX + c * kCellSize + kCellSize / 2 - 1}
                  y={kernelOffY + r * kCellSize + kCellSize / 2 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={v > 0 ? "#10b981" : v < 0 ? "#ef4444" : "#94a3b8"}
                  style={{ userSelect: "none" }}
                >
                  {v}
                </text>
              </g>
            ))
          )}

          {/* Output grid */}
          {output.map((row, r) =>
            row.map((v, c) => {
              const isActive = currentStep?.outRow === r && currentStep?.outCol === c;
              const isComputed =
                currentStep
                  ? r * outCols + c < safeStep ||
                    (r === currentStep.outRow && c === currentStep.outCol)
                  : false;
              const norm = normOutput[r][c];
              const fill = isComputed
                ? isActive
                  ? "#00d4ff44"
                  : intensityToColor(v, norm)
                : "#0a0a1a";
              return (
                <g key={`out-${r}-${c}`}>
                  <rect
                    x={outputOffX + c * CELL}
                    y={outputOffY + r * CELL}
                    width={CELL - 2}
                    height={CELL - 2}
                    fill={fill}
                    stroke={isActive ? "#00d4ff" : "#1a1a3a"}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    rx={2}
                  />
                  {isComputed && (
                    <text
                      x={outputOffX + c * CELL + (CELL - 2) / 2}
                      y={outputOffY + r * CELL + (CELL - 2) / 2 + 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill={isActive ? "#00d4ff" : "#94a3b8"}
                      style={{ userSelect: "none" }}
                    >
                      {v}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Kernel editor */}
      <div className="mt-3 flex items-center gap-4">
        <span className="text-xs text-muted">Edit kernel:</span>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(3, 3rem)` }}>
          {kernel.map((row, r) =>
            row.map((v, c) => (
              <input
                key={`ke-${r}-${c}`}
                type="number"
                value={v}
                onChange={(e) => handleKernelChange(r, c, e.target.value)}
                className="w-full rounded border border-surface-2 bg-surface-1 px-1 py-0.5 text-center text-xs text-text"
                style={{ appearance: "textfield" }}
              />
            ))
          )}
        </div>
        {currentStep && (
          <div className="ml-4 rounded bg-surface-2 px-3 py-1.5 text-xs font-mono">
            <span className="text-muted">out[{currentStep.outRow},{currentStep.outCol}]</span>
            <span className="text-neon-cyan"> = {currentStep.sum}</span>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          className="rounded-md bg-neon-cyan px-4 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-80"
        >
          {playing ? "⏸ Pause" : safeStep >= totalSteps - 1 ? "↩ Replay" : "▶ Play"}
        </button>
        <button
          onClick={() => { setStepIndex((p) => Math.max(0, p - 1)); stopPlaying(); }}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-xs text-muted hover:text-text"
          disabled={safeStep === 0}
        >
          ← Prev
        </button>
        <button
          onClick={() => { setStepIndex((p) => Math.min(totalSteps - 1, p + 1)); stopPlaying(); }}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-xs text-muted hover:text-text"
          disabled={safeStep >= totalSteps - 1}
        >
          Next →
        </button>
        <button
          onClick={handleReset}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-xs text-muted hover:text-text"
        >
          ⏮ Reset
        </button>
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={safeStep}
          onChange={(e) => { setStepIndex(Number(e.target.value)); stopPlaying(); }}
          className="flex-1"
          style={{ accentColor: "#00d4ff" }}
        />
      </div>

      {/* Info footer */}
      <p className="mt-3 text-xs text-muted">
        Output size: ({outRows}×{outCols}) — stride={stride}, padding={padding} (pad={paddingVal}).{" "}
        <span className="text-neon-cyan">Click input cells</span> to toggle values (0–9).{" "}
        <span className="text-neon-cyan">Edit kernel</span> inputs or pick a preset above.
      </p>
    </div>
  );
}
