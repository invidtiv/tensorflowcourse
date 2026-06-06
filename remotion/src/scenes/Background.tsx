import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";

// Animated dark gradient + subtle moving grid + drifting radial glows,
// echoing the site's grid-pattern hero background.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame % 1800) / 1800; // slow loop
  const gridShift = (frame * 0.25) % 60;
  const glowX = 50 + Math.sin(drift * Math.PI * 2) * 12;
  const glowY = 45 + Math.cos(drift * Math.PI * 2) * 10;
  const pulse = interpolate(Math.sin(frame / 30), [-1, 1], [0.18, 0.32]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bgPrimary }}>
      {/* radial brand glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0,212,255,${pulse}) 0%, rgba(139,92,246,0.10) 35%, rgba(5,5,16,0) 70%)`,
        }}
      />
      {/* moving grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${gridShift}px ${gridShift}px`,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 85%)",
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 400px rgba(0,0,0,0.85)",
        }}
      />
    </AbsoluteFill>
  );
};
