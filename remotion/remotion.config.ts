import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Public dir is passed per-render via --public-dir so we reuse the Next.js
// app's existing /public/videos assets (narration audio, etc).
