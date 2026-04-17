"use client";

/**
 * GradientDescentViz
 *
 * Phase 6 — entry-point interactive demo.
 *
 * Pure-SVG 2D visualization of gradient descent on a simple convex loss
 * surface f(x, y) = (x - 2)^2 + 0.5 * (y + 1)^2 + 0.3 * x * y. The user
 * controls the learning rate, the number of steps, and the starting point;
 * the component draws iso-loss contour lines and animates the descent
 * trajectory as the parameters are adjusted.
 *
 * Intentionally uses zero external charting deps (no recharts, no d3) so it
 * stays resilient in the offline/localhost-only deployment target and avoids
 * a package install step in the Cowork sandbox.
 *
 * Registered in MDX via `<GradientDescentViz />` — see MDXComponents.tsx.
 */

import { useMemo, useState } from "react";

type Point = { x: number; y: number };

// Loss surface: slight cross-term so iso-contours are elongated ellipses,
// which makes the learning-rate effect on the trajectory visually obvious.
function loss(x: number, y: number): number {
  return (x - 2) ** 2 + 0.5 * (y + 1) ** 2 + 0.3 * x * y;
}

function gradient(x: number, y: number): Point {
  return {
    x: 2 * (x - 2) + 0.3 * y,
    y: 1.0 * (y + 1) + 0.3 * x,
  };
}

// Map loss-space coordinates to SVG pixel space.
const VIEW = {
  xMin: -6,
  xMax: 6,
  yMin: -5,
  yMax: 5,
  width: 520,
  height: 420,
};

function toSvg(p: Point): Point {
  const sx = ((p.x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * VIEW.width;
  // Flip Y so +y is up in loss space.
  const sy = VIEW.height - ((p.y - VIEW.yMin) / (VIEW.yMax - VIEW.yMin)) * VIEW.height;
  return { x: sx, y: sy };
}

function runDescent(start: Point, lr: number, steps: number): Point[] {
  const path: Point[] = [{ ...start }];
  let cur = { ...start };
  for (let i = 0; i < steps; i++) {
    const g = gradient(cur.x, cur.y);
    cur = { x: cur.x - lr * g.x, y: cur.y - lr * g.y };
    // Guard against divergence visually exploding the viewBox.
    if (Math.abs(cur.x) > 100 || Math.abs(cur.y) > 100) break;
    path.push({ ...cur });
  }
  return path;
}

// Pre-sampled loss grid for contour approximation. We don't draw real
// marching-squares contours — we draw ellipse-shaped level sets analytically
// using the known quadratic form, which is fast and crisp.
const CONTOUR_LEVELS = [0.5, 2, 5, 10, 20, 35, 55];

export default function GradientDescentViz() {
  const [lr, setLr] = useState(0.15);
  const [steps, setSteps] = useState(25);
  const [startX, setStartX] = useState(-4);
  const [startY, setStartY] = useState(3);

  const path = useMemo(
    () => runDescent({ x: startX, y: startY }, lr, steps),
    [lr, steps, startX, startY],
  );
  const finalLoss = loss(path[path.length - 1].x, path[path.length - 1].y);
  const diverged =
    Math.abs(path[path.length - 1].x) > 50 ||
    Math.abs(path[path.length - 1].y) > 50;

  const minimum = toSvg({ x: 2.15, y: -1.32 }); // approximate analytic min
  const start = toSvg({ x: startX, y: startY });

  const polyline = path
    .map((p) => {
      const s = toSvg(p);
      return `${s.x.toFixed(1)},${s.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="my-6 rounded-lg border border-white/[0.08] bg-surface-1/40 p-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          className="w-full max-w-[560px] rounded bg-surface-0"
          role="img"
          aria-label="Gradient descent trajectory on a 2D convex loss surface"
        >
          {/* Iso-loss contours (approximated as ellipses of the quadratic form) */}
          {CONTOUR_LEVELS.map((level, i) => {
            // Sample the level set by walking theta and solving for radius.
            const pts: string[] = [];
            const N = 80;
            for (let k = 0; k <= N; k++) {
              const theta = (k / N) * 2 * Math.PI;
              // Coarse radial search — good enough for visual display.
              let lo = 0;
              let hi = 10;
              for (let it = 0; it < 20; it++) {
                const mid = (lo + hi) / 2;
                const px = 2.15 + mid * Math.cos(theta);
                const py = -1.32 + mid * Math.sin(theta);
                if (loss(px, py) - level > 0) hi = mid;
                else lo = mid;
              }
              const r = (lo + hi) / 2;
              const s = toSvg({
                x: 2.15 + r * Math.cos(theta),
                y: -1.32 + r * Math.sin(theta),
              });
              pts.push(`${s.x.toFixed(1)},${s.y.toFixed(1)}`);
            }
            const opacity = 0.15 + i * 0.07;
            return (
              <polyline
                key={level}
                points={pts.join(" ")}
                fill="none"
                stroke="rgb(34 211 238)"
                strokeOpacity={opacity}
                strokeWidth={1}
              />
            );
          })}

          {/* Minimum marker */}
          <circle cx={minimum.x} cy={minimum.y} r={5} fill="rgb(250 204 21)" />
          <text
            x={minimum.x + 8}
            y={minimum.y - 6}
            fill="rgb(250 204 21)"
            fontSize="11"
            fontFamily="monospace"
          >
            min
          </text>

          {/* Trajectory */}
          <polyline
            points={polyline}
            fill="none"
            stroke={diverged ? "rgb(248 113 113)" : "rgb(236 72 153)"}
            strokeWidth={2}
          />
          {path.map((p, i) => {
            const s = toSvg(p);
            if (i % Math.max(1, Math.floor(path.length / 30)) !== 0) return null;
            return (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={i === 0 ? 5 : 2.5}
                fill={i === 0 ? "rgb(74 222 128)" : "rgb(236 72 153)"}
              />
            );
          })}

          {/* Start label */}
          <text
            x={start.x + 8}
            y={start.y + 4}
            fill="rgb(74 222 128)"
            fontSize="11"
            fontFamily="monospace"
          >
            start
          </text>
        </svg>

        <div className="flex flex-1 flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-white/70">
              Learning rate:{" "}
              <span className="font-mono text-neon-cyan">{lr.toFixed(3)}</span>
            </span>
            <input
              type="range"
              min={0.01}
              max={1.2}
              step={0.01}
              value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))}
              aria-label="Learning rate"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-white/70">
              Steps: <span className="font-mono text-neon-cyan">{steps}</span>
            </span>
            <input
              type="range"
              min={1}
              max={80}
              step={1}
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value, 10))}
              aria-label="Number of steps"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-white/70">
              Start x:{" "}
              <span className="font-mono text-neon-cyan">{startX.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.5}
              value={startX}
              onChange={(e) => setStartX(parseFloat(e.target.value))}
              aria-label="Start x"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-white/70">
              Start y:{" "}
              <span className="font-mono text-neon-cyan">{startY.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.5}
              value={startY}
              onChange={(e) => setStartY(parseFloat(e.target.value))}
              aria-label="Start y"
            />
          </label>

          <div className="mt-2 rounded border border-white/[0.08] bg-surface-0 p-2 font-mono text-xs">
            <div>final loss: {diverged ? "∞ (diverged)" : finalLoss.toFixed(4)}</div>
            <div>
              final θ: ({path[path.length - 1].x.toFixed(2)},{" "}
              {path[path.length - 1].y.toFixed(2)})
            </div>
            <div>path length: {path.length}</div>
          </div>

          <p className="text-xs text-white/50">
            Try <code>lr ≥ 1.0</code> to see divergence — the trajectory overshoots
            and explodes.
          </p>
        </div>
      </div>
    </div>
  );
}
