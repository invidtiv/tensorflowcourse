import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { theme } from "../theme";

export const TitleScene: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const y = interpolate(enter, [0, 1], [40, 0]);
  const titleOpacity = interpolate(enter, [0, 1], [0, 1]);
  const subOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barWidth = interpolate(enter, [0, 1], [0, 220]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 160px",
        textAlign: "center",
      }}
    >
      <div style={{ transform: `translateY(${y}px)` }}>
        <h1
          style={{
            fontFamily: theme.fontFamily,
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            margin: 0,
            opacity: titleOpacity,
            background: `linear-gradient(135deg, ${theme.neonCyan}, ${theme.neonPurple})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            height: 5,
            width: barWidth,
            margin: "36px auto 0",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${theme.neonCyan}, ${theme.neonPurple})`,
            boxShadow: `0 0 24px ${theme.neonCyan}`,
          }}
        />
        {subtitle ? (
          <p
            style={{
              fontFamily: theme.monoFamily,
              fontSize: 34,
              color: theme.textMuted,
              marginTop: 34,
              opacity: subOpacity,
              letterSpacing: "0.01em",
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
