# Module Intro Videos (Remotion)

Programmatic renderer for the TensorFlow Course module intro videos. It reads each module's
**synced storyboard JSON** (slide timings frame-aligned to the narration) and its **Gemini TTS
narration WAV**, and renders an MP4 that matches the site's dark / neon-cyan brand.

## Render (Windows / macOS / Linux)

```bash
cd remotion
npm install          # first time only
npm run render       # renders ALL 10 modules -> remotion/out/module-01.mp4 ... module-10.mp4
```

Render a single module (or a few):

```bash
npm run render:01    # just module 01
node render.mjs 1 5 10   # modules 01, 05, 10
```

`render.mjs` is a plain Node script, so it works the same on every OS. It:
1. ensures the headless browser exists (the **first** render downloads Chrome Headless Shell —
   this needs internet and can take a minute),
2. bundles the project once,
3. renders each requested module composition to `out/module-NN.mp4`, printing % progress.

> Earlier the render scripts used a bash `for` loop, which silently does nothing on Windows
> (npm runs scripts via cmd/PowerShell there). That's why `npm run render:all` appeared to do
> nothing. It now routes through `render.mjs` instead.

## Preview / fine-tune interactively

```bash
npm run studio       # opens Remotion Studio; scrub each module against its audio
```

## Troubleshooting

- **Nothing happens / "Missing script":** make sure you're inside the `remotion/` folder, not the
  repo root. The render scripts live in `remotion/package.json`.
- **Stuck at "Ensuring headless browser":** the first run downloads Chrome Headless Shell. If your
  network blocks it, run `npx remotion browser ensure` once on a normal connection.
- **`out/` is empty:** check the console — render errors print there. Send the error text.

## How it fits together

```
public/videos/scripts/NN-*.synced.json     storyboard (scene text + frame timings)
public/videos/module-NN/narration.wav      Gemini TTS voiceover
remotion/render.mjs                         cross-platform render driver
remotion/src/Root.tsx                       registers all 10 compositions (module-01 ... module-10)
remotion/src/ModuleVideo.tsx                maps scenes -> components, plays the audio track
remotion/src/scenes/*                       Title / Bullets / Cta / animated Background
remotion/src/theme.ts                       palette mirrored from src/app/globals.css
```

## Output spec

1920×1080 · 30 fps · H.264 MP4 with the narration audio muxed in.
