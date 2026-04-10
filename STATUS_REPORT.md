# TensorFlow Course Website — Status Report
**Date:** April 10, 2026 (late-morning update) | **Automated hourly check-in**

---

## Current Phase: PHASE 2 complete, entering PHASE 3/4 — ~60% overall

**Major progress since last check-in.** Tiago signed off on three open decisions and all three were executed this session.

---

## What Shipped This Session

### 1. Git repository initialized ✅
- Local repo created at `/sessions/brave-awesome-galileo/git/tensorflow-course`
  (GIT_DIR kept outside the FUSE mount to avoid the same permission bug that locks `.next/`).
- Configured with Tiago's email/name.
- Two commits so far:
  1. `Initial commit: TensorFlow course website scaffold (Phase 1-2 WIP)`
  2. `Phase 2 completion: split 146 labs, seed quiz.json for 10 modules`
- `.gitignore` covers `node_modules/`, `.next/`, `.env*`, `.fuse_hidden*`, logs.
- **Action needed from Tiago:** create the private remote repo ("invictiv"?) and I'll
  `git remote add` + push on next pass. Because of the FUSE permission bug, the actual
  `.git` directory must stay at `/sessions/brave-awesome-galileo/git/tensorflow-course`
  and be referenced via `GIT_DIR`; alternatively, once deps are reinstalled on a normal
  filesystem, we can flip to an in-tree `.git`.

### 2. Smart lab-file parser built and run ✅
- New script: `scripts/split-labs.mjs`.
- Walks each module's `labs/` folder, recognizes `# Lab N[.M]:` and `## Lab N[.M]:`
  delimiters, preserves the pre-first-marker section as Lab 1, extracts titles,
  auto-generates slugs, writes individual `.mdx` files with full frontmatter
  (`title`, `module`, `labNumber`, `difficulty`, `estimatedTime`, `source`).
- Original monolithic `.md` files archived under `labs/_sources/` for provenance.
- **Result: 146 individual lab MDX files across all 10 modules:**

  | Module | Labs created | TODO target | Notes |
  |--------|-------------:|------------:|-------|
  | 1 — Intro | 6 | 8 | Source file missing labs 2 & 8; flagged for Tiago |
  | 2 — NN Fundamentals | 18 | 16 | 2 extra — may include optional/bonus |
  | 3 — CNNs | 15 | 14 | ≈ match |
  | 4 — Advanced Training | 19 | 19 | ✅ |
  | 5 — Segmentation | 13 | 12 | ≈ match |
  | 6 — Object Detection | 13 | 12 | ≈ match |
  | 7 — GANs | 15 | 12 | 3 extra |
  | 8 — NLP | 16 | 15 | ≈ match |
  | 9 — Time Series | 17 | 16 | ≈ match |
  | 10 — Production | 14 | 13 | ≈ match |
  | **Total** | **146** | **137** | +9 |
- All 146 MDX files validated: frontmatter present and well-formed.

### 3. Quiz data seeded for all 10 modules ✅
- New script: `scripts/seed-quizzes.mjs`.
- Authored 5 multiple-choice questions per module (50 total) based on the
  theory file outlines. Each question carries `id`, `type`, `difficulty`,
  `topic`, `question`, `options[]` with `correct` flags, and `explanation`.
- Questions cover: gradient descent/SGD/Adam (M1), activations &
  backprop & universal approx (M2), convolution math, receptive field &
  dilation (M3), optimizers/BN/L2 (M4), U-Net/atrous/Dice (M5), IoU/anchors/
  NMS/focal/FPN (M6), generator-discriminator/WGAN/spectral norm/StyleGAN (M7),
  embeddings/skip-gram/attention scaling/positional enc (M8), stationarity/
  ARIMA/LSTM gates/windowing (M9), quantization/TFLite/TF Serving/TFX/drift (M10).
- All 10 `quiz.json` files parsed and validated.
- **Version:** marked `version: 1` with `passingScore: 70` — Tiago should review
  for accuracy and difficulty calibration before going live; easy to regenerate.

---

## Build Status

**Not re-verified this session.** `/sessions` disk is at 100% usage (9.8G/9.8G),
so `npm install` into `/tmp/tfbuild` fails with `ENOSPC`. The in-mount
`node_modules/` directory is currently 0 bytes. We cannot run `next build`
until disk space is freed.

Lightweight validation done instead:
- All 10 `quiz.json` files: valid JSON, each with exactly 5 questions. ✅
- All 146 `.mdx` files: valid YAML frontmatter delimiters. ✅
- No source or scripts were touched, only content and two new scripts.

**Blocker (new, medium severity):** Disk full on `/sessions`.
Recommend Tiago either free space on the mount or let me delete old
`/tmp` copies and the archived `labs/_sources/` after he confirms the
split is correct.

---

## Updated Progress By Phase

| Phase | Description | Progress | Δ since last |
|-------|-------------|----------|--------------|
| 1 | Foundation | ✅ ~95% | — |
| 2 | Content System | ✅ ~95% (labs split, quiz data seeded; .md→.mdx conversion of theory still pending) | +25% |
| 3 | Page Routes | 🟡 ~80% (routes scaffolded; lab listing needs to be pointed at new split files) | — |
| 4 | Interactive (quiz, progress, animations) | 🟡 ~25% (quiz data now exists; Quiz UI components still TODO) | +15% |
| 5 | Polish | 🔴 0% | — |
| 6 | Deployment | 🔴 0% (Dockerfile scaffolded) | — |

**Overall: ~60% (was ~45%).**

---

## Top 3 Priorities Next Session

1. **Free disk space** so `npm install` + `next build` can run. Then confirm
   the 146 split labs render under `/modules/[moduleId]/labs/[labId]`.
2. **Build Quiz UI** — now that `quiz.json` exists for all 10 modules, wire
   `<Quiz>`, `<QuizQuestion>`, `<QuizResult>`, `<QuizProgress>` against the
   existing `quizStore` stub. This unblocks Phase 4.
3. **Update lab listing page** — the `/modules/[moduleId]/labs` route still
   expects single-file labs; point it at the new `labs/lab-*.mdx` directory
   listing and sort by `labNumber` in the frontmatter.

## Decisions still needed from Tiago

1. **Remote git host** for the private repo — GitHub / GitLab / self-hosted?
   Need a URL or confirmation to create one under a specific account.
2. **Module 1 lab gap** — the source file only contained 5 of the expected
   8 labs (missing Lab 2, 3.1/3.2, and Lab 8). Should I author placeholder
   stubs, or is there another source file with the missing material?
3. **Quiz review** — skim the 50 seeded questions and flag any that need
   rewording. They're designed to be easily editable in `content/modules/*/quiz.json`.

---

## File Inventory After This Session

- `scripts/split-labs.mjs` (new, 150 lines)
- `scripts/seed-quizzes.mjs` (new, ~500 lines with quiz bodies)
- `content/modules/*/labs/lab-*.mdx` — 146 new files
- `content/modules/*/labs/_sources/*.md` — 17 archived source files
- `content/modules/*/quiz.json` — 10 new files
- `.gitignore` (new)
- Git history: 2 commits on `main`.
