# Video Assets Directory

This directory holds self-hosted video files for the TensorFlow Course Website.

## Structure

```
public/videos/
  captions/          # WebVTT caption files (.vtt) per module
    01-intro-en.vtt
    02-neural-network-fundamentals-en.vtt
    ...
  module-01/         # (future) Self-hosted MP4 files per module
  module-02/
  ...
```

## Current State

- **Captions:** Placeholder `.vtt` stubs exist for all 10 modules under `captions/`. Replace with real captions generated from recorded lectures.
- **Videos:** No self-hosted MP4 files yet. The course currently uses YouTube facade embeds (lazy-loaded, no network until clicked) via the `<VideoEmbed>` component.

## Adding Self-Hosted Videos

1. Record the lecture following the production guidelines (see below).
2. Encode as H.264 + AAC in `.mp4` container.
3. Place under `public/videos/module-NN/lecture.mp4` (keep under 200 MB per clip).
4. Update the module's `_meta.json` to set `videoUrl` instead of (or alongside) `videoId`.
5. Generate captions with Whisper: `whisper lecture.mp4 --language en --output_format vtt`
6. Place the `.vtt` file under `captions/NN-<slug>-en.vtt`.

## Production Guidelines (from Plan Section 5.2)

- Resolution: >= 1080p
- Frame rate: 30 fps
- Audio: 44.1 kHz sample rate, de-noised, consistent loudness (-16 LUFS)
- Lecture structure: 30-60s hook, 3-5 min concept with visual aids, 5-10 min live demo
- Post-processing: audio enhancement, visual optimization, cognitive load management

## Important

- Do NOT commit large binary video files to git. Use git-lfs or host them out-of-band.
- The `.vtt` stub files are safe to commit (small text files).
- For localhost deployment, files in `public/` are served at `/videos/...` by Next.js.
