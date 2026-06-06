import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { theme } from "../theme";

export const BulletsScene: React.FC<{ items: string[]; title?: string }> = ({
  items,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stagger each bullet so they reveal in time with the narration.
  const perItem = 14; // frames between reveals

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 200px",
      }}
    >
      {title ? (
        <h2
          style={{
            fontFamily: theme.fontFamily,
            fontSize: 52,
            fontWeight: 700,
            color: theme.neonCyan,
            margin: "0 0 50px 0",
          }}
        >
          {title}
        </h2>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 38 }}>
        {items.map((item, i) => {
          const start = 6 + i * perItem;
          const enter = spring({
            frame: frame - start,
            fps,
            config: { damping: 200 },
          });
          const x = interpolate(enter, [0, 1], [-60, 0]);
          const opacity = interpolate(enter, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                transform: `translateX(${x}px)`,
                opacity,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  transform: "rotate(45deg)",
                  background: `linear-gradient(135deg, ${theme.neonCyan}, ${theme.neonPurple})`,
                  boxShadow: `0 0 18px ${theme.neonCyan}`,
                }}
              />
              <span
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: 46,
                  fontWeight: 500,
                  color: theme.textPrimary,
                  lineHeight: 1.25,
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
