import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Background } from "./scenes/Background";
import { TitleScene } from "./scenes/TitleScene";
import { BulletsScene } from "./scenes/BulletsScene";
import { CtaScene } from "./scenes/CtaScene";

export type Scene =
  | {
      kind: "title";
      durationFrames: number;
      props: { title: string; subtitle?: string };
    }
  | {
      kind: "bullets";
      durationFrames: number;
      props: { items: string[]; title?: string };
    }
  | { kind: "cta"; durationFrames: number; props: { text: string } };

export type Storyboard = {
  title: string;
  width: number;
  height: number;
  fps: number;
  audio?: { src: string };
  scenes: Scene[];
};

export const ModuleVideo: React.FC<{ storyboard: Storyboard }> = ({
  storyboard,
}) => {
  const audioSrc = storyboard.audio?.src;
  return (
    <AbsoluteFill>
      <Background />
      {audioSrc ? <Audio src={staticFile(`videos/${audioSrc}`)} /> : null}
      <Series>
        {storyboard.scenes.map((scene, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={Math.max(1, Math.round(scene.durationFrames))}
          >
            {scene.kind === "title" ? (
              <TitleScene {...scene.props} />
            ) : scene.kind === "bullets" ? (
              <BulletsScene {...scene.props} />
            ) : (
              <CtaScene {...scene.props} />
            )}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

export const totalFrames = (sb: Storyboard): number =>
  sb.scenes.reduce((n, s) => n + Math.max(1, Math.round(s.durationFrames)), 0);
