import React from "react";
import { Composition } from "remotion";
import { ModuleVideo, totalFrames, Storyboard } from "./ModuleVideo";

import m01 from "../../public/videos/scripts/01-intro-deep-learning.synced.json";
import m02 from "../../public/videos/scripts/02-neural-network-fundamentals.synced.json";
import m03 from "../../public/videos/scripts/03-cnns.synced.json";
import m04 from "../../public/videos/scripts/04-advanced-training.synced.json";
import m05 from "../../public/videos/scripts/05-semantic-segmentation.synced.json";
import m06 from "../../public/videos/scripts/06-object-detection.synced.json";
import m07 from "../../public/videos/scripts/07-gans.synced.json";
import m08 from "../../public/videos/scripts/08-nlp.synced.json";
import m09 from "../../public/videos/scripts/09-time-series.synced.json";
import m10 from "../../public/videos/scripts/10-production-deployment.synced.json";

const modules: { id: string; sb: Storyboard }[] = [
  { id: "module-01", sb: m01 as unknown as Storyboard },
  { id: "module-02", sb: m02 as unknown as Storyboard },
  { id: "module-03", sb: m03 as unknown as Storyboard },
  { id: "module-04", sb: m04 as unknown as Storyboard },
  { id: "module-05", sb: m05 as unknown as Storyboard },
  { id: "module-06", sb: m06 as unknown as Storyboard },
  { id: "module-07", sb: m07 as unknown as Storyboard },
  { id: "module-08", sb: m08 as unknown as Storyboard },
  { id: "module-09", sb: m09 as unknown as Storyboard },
  { id: "module-10", sb: m10 as unknown as Storyboard },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {modules.map(({ id, sb }) => (
        <Composition
          key={id}
          id={id}
          component={ModuleVideo}
          durationInFrames={totalFrames(sb)}
          fps={sb.fps}
          width={sb.width}
          height={sb.height}
          defaultProps={{ storyboard: sb }}
        />
      ))}
    </>
  );
};
