import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { theme } from "../theme";

export const CtaScene: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const glow = interpolate(Math.sin(frame / 12), [-1, 1], [18, 42]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          padding: "40px 80px",
          borderRadius: 24,
          border: `2px solid ${theme.neonCyan}`,
          background: "rgba(26,26,46,0.55)",
          boxShadow: `0 0 ${glow}px rgba(0,212,255,0.6)`,
          fontFamily: theme.fontFamily,
          fontSize: 64,
          fontWeight: 700,
          color: theme.textPrimary,
        }}
      >
        {text}
      </div>
      <p
        style={{
          marginTop: 48,
          fontFamily: theme.monoFamily,
          fontSize: 30,
          color: theme.textMuted,
          opacity,
        }}
      >
        TensorFlow Course · 10 modules · 152 labs
      </p>
    </AbsoluteFill>
  );
};
