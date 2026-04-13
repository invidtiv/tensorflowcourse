# TensorFlow Course Website — Status Report

---

## April 12, 2026 — Automated hourly check-in (Run 2)
**Previous report:** April 12, 2026 (Run 1)

### TL;DR

Project continues strong. Video Delivery (Point 5) has jumped from partial to **near-complete**: all 10/10 modules now have `videoId` in `_meta.json` and `<VideoEmbed>` in theory.mdx (was 6/10 last run — modules 07–10 were populated between runs, likely by Tiago or a prior session). Content audit of **Module 02 (NN Fundamentals)** found excellent 1427-line theory and a solid 8-question quiz. Fixed 4 labs with generic "Lab NN" titles from the split-script artifact and added a "Common Misconceptions for Beginners" callout to theory §2.1.4. Disk at 69% (/sessions) and 83% (/tmp) — no immediate space issue.

### Changes landed this run

| File | Edit |
|------|------|
| `content/modules/02-neural-network-fundamentals/labs/lab-10-lab-10.mdx` | Fixed frontmatter title: "Lab 10" → "Custom Loss Functions and Metrics" |
| `content/modules/02-neural-network-fundamentals/labs/lab-12-lab-12.mdx` | Fixed frontmatter title: "Lab 12" → "Backpropagation Visualization" |
| `content/modules/02-neural-network-fundamentals/labs/lab-14-lab-14.mdx` | Fixed frontmatter title: "Lab 14" → "Auto-MPG Regression with Preprocessing" |
| `content/modules/02-neural-network-fundamentals/labs/lab-17-lab-17.mdx` | Fixed frontmatter title: "Lab 17" → "Visualizing Gradients During Training" |
| `content/modules/02-neural-network-fundamentals/theory.mdx` | Added "Common Misconceptions for Beginners" callout (3 items: more neurons ≠ better, backprop vs learning algorithm, ReLU not always best) after §2.1.4 |

### Content audit: module 02

**Theory (theory.mdx, 1427 lines → ~1440 after edit):** Comprehensive coverage of biological inspiration, perceptron (with convergence theorem proof), XOR impossibility proof, feature representation, activation functions, backpropagation (full derivation including vectorized), weight initialization (Xavier/He), loss functions, Keras Sequential/Functional/Subclassing APIs. Has proper `<Callout>`, `<VideoEmbed>`, KaTeX math, tables, and code blocks. Now includes a "Common Misconceptions" callout. Strong — no further theory edits needed this pass.

**Weakness noted (not fixed — propose for future):** Theory stops at Keras 2.x API style (`keras.layers.Dense`). Could benefit from a short note about the Keras 3 multi-backend future (TF, JAX, PyTorch) and `import keras` vs `from tensorflow import keras` distinction. Low priority.

**Quiz (quiz.json, 8 questions):** Meets ≥8 target. Difficulty mix: 3 easy, 3 medium, 2 hard. Topics: activation functions, universal approximation, backpropagation chain rule, loss functions, gradient stabilization, softmax, weight initialization, batch normalization. Explanations are substantive and address *why* the wrong answers are wrong. Quality: excellent — no changes needed.

**Labs (18 files):** Good volume (exceeds 16 target). Content is substantive: covers preprocessing, normalization, Sequential/Functional API, custom losses, backprop visualization, regression workflows, gradient visualization. **Issues fixed:** 4 labs had generic "Lab NN" titles from the split script — replaced with descriptive names derived from their actual content. **Remaining weaknesses:** (a) No labs have "stretch goals" / bonus challenges for advanced learners, (b) no explicit `requirements.txt` or TF version pins, (c) lab filenames still include the generic slug (e.g., `lab-10-lab-10.mdx`) — renaming files is riskier (could break route resolution) so flagged but not changed.

**Next rotation slot:** module 03

### Video Delivery status (Point 5) — light check

| Aspect | State |
|--------|-------|
| `VideoEmbed.tsx` component | **Complete** |
| MDX registration | **Complete** |
| `ModuleMeta` type (videoId, videoUrl) | **Complete** |
| Module _meta.json coverage | **Complete** — 10/10 modules now have `videoId` (was 6/10 in Run 1) |
| Theory MDX `<VideoEmbed>` usage | **Complete** — all 10 theory.mdx files include the component |
| MP4 / self-hosted | No `videoUrl` set anywhere; `/public/videos/` not created yet |
| Progress tracking (videoWatched) | **Complete** — `markVideoWatched`, `updateVideoProgress`, `markVideoFinished` all in store |
| This was NOT a video focus run | Next focus run: **Run 3** |

**Key delta:** Modules 07 (GANs), 08 (NLP), 09 (Time Series), 10 (Production) all got `videoId` populated since Run 1. Video delivery metadata is now 100% populated for the YouTube facade path.

**Remaining for Run 3 (video focus):** Scaffold `/public/videos/` with a README, verify the `<VideoEmbed>` renders correctly in browser (if build is possible), add "watched" tick to module cards (TODO item still open), check `prefers-reduced-motion` compliance.

### Phase rollup

| Phase | Description | Progress | Δ since Run 1 |
|-------|-------------|----------|----------------|
| 1 | Foundation | ✅ ~95% | — |
| 2 | Content System | ✅ ~95% | — |
| 3 | Page Routes | ✅ ~85% | — |
| 4 | Interactive (quiz, progress) | 🟡 ~70% | — (ProgressDashboard, CompletionBadge, ContinueLearning still open) |
| 5 | Polish (animations, responsive) | 🟡 ~40% | — |
| 6 | Deployment | 🟡 ~40% | — |
| 7 | Video Delivery (Point 5) | 🟢 ~55% | +20% (10/10 videoId coverage, progress tracking complete) |

**Overall: ~77% (was ~75% in Run 1).** Video delivery jump accounts for most of the gain.

### Top 3 priorities for next run (Run 3 — VIDEO FOCUS)

1. **Video focus run:** Scaffold `/public/videos/` directory with README, verify `<VideoEmbed>` renders in browser if build is feasible, wire "watched" tick on module cards.
2. **Content audit module 03 (lighter — video focus run):** Quick check on CNNs theory depth, quiz count, lab quality.
3. **Phase 4 gap:** `ProgressDashboard`, `CompletionBadge`, `ContinueLearning` components are still unchecked — scope and prioritize.

### Blockers / input needed from Tiago

1. **Lab filenames:** 4 labs in module 02 (and likely others across modules) have generic slugs like `lab-10-lab-10.mdx` from the split script. Renaming the files could break route resolution. Tiago: should we batch-rename these, or is the title frontmatter fix sufficient?
2. **Keras 3 note:** Module 02 theory uses `from tensorflow import keras` style. Worth adding a forward-looking note about Keras 3 multi-backend? Low priority but would future-proof the content.
3. **Stretch goals policy:** Should labs include bonus challenge sections for advanced learners, or keep them focused on the core exercise?

---

## April 12, 2026 — Automated hourly check-in (Run 1)
**Previous report:** April 10, 2026 (late-morning update)

### TL;DR

Project is significantly more advanced than the last report captured — git log shows Phase 5 polish work already landed (metadataBase, quiz flow verification, smoke-test report). Video infrastructure (Point 5) is in **partial** state: `VideoEmbed.tsx` is fully built and registered, 6/10 modules have YouTube placeholder IDs, but modules 07–10 are missing video references. Content audit of **Module 01** found the theory is excellent (2713 lines, comprehensive) but lab-01 was truncated by the split script (missing intro/imports). Fixed this run. Added a "Common Misconceptions for Beginners" callout to theory §1.2. Disk space recovered to 69% (3 GB free). TODO.md and IMPLEMENTATION_PLAN.md located at workspace root (outside `tensorflow-course/`). Phase 5b (Video Delivery) section already present in TODO.md with several items checked off from Apr 11–12 runs.

### Changes landed this run

| File | Edit |
|------|------|
| `content/modules/01-intro-deep-learning/labs/lab-01-vanilla-gd-on-rosenbrock.mdx` | Added missing intro section, learning objectives callout, prerequisites, and Rosenbrock function definition that were cut off by the split script |
| `content/modules/01-intro-deep-learning/theory.mdx` | Added "Common Misconceptions for Beginners" callout (3 items) between §1.2.3 and §1.2.4 |

### Content audit: module 01

**Theory (theory.mdx, 2713 lines):** Excellent quality. Covers AI history (1950s–2023), taxonomy (AI/ML/DL), math foundations (linear algebra, calculus, probability), NumPy deep dive, TensorFlow intro, and gradient descent. Has proper `<Callout>`, `<VideoEmbed>`, tables, and ASCII diagrams. Now includes a "Common Misconceptions" callout. Minor weakness: milestones table stops at 2023 — could add 2024–2025 entries (Claude, Gemini, open-weight models).

**Quiz (quiz.json, 8 questions):** Meets ≥8 target. Difficulty mix: 3 easy, 3 medium, 2 hard. Explanations are substantive (not mere answer restatements). Distractors target real student mistakes (e.g., broadcasting shape confusion, tf.constant vs tf.Variable gotcha). Quality: good — no changes needed this run.

**Labs (12 files):** More than the original 8 target. Lab-01 was truncated (started mid-function after frontmatter) — fixed with proper intro, learning objectives, prerequisites, and function definition. Other labs appear intact. Weakness: no labs have "stretch goals" sections for advanced learners; no explicit `requirements.txt` or dependency pins.

**Next rotation slot:** module 02

### Video Delivery status (Point 5) — light check

| Aspect | State |
|--------|-------|
| `VideoEmbed.tsx` component | **Complete** — YouTube facade (click-to-load, rel=0, modestbranding=1, cc_load_policy=1) + native MP4 `<video>` support |
| MDX registration | **Complete** — registered in `MDXComponents.tsx` |
| `ModuleMeta` type | **Complete** — has `videoId?` and `videoUrl?` fields |
| Module _meta.json coverage | **Partial** — 6/10 modules have `videoId` (01–06). Modules 07 (GANs), 08 (NLP), 09 (Time Series), 10 (Production) are missing |
| Theory MDX usage | Module 01 has `<VideoEmbed>` in theory.mdx with 3Blue1Brown placeholder. Other modules not checked this run |
| MP4 / self-hosted | No `videoUrl` set anywhere; `/public/videos/` directory not created yet |
| This was NOT a video focus run | Next focus run: Run 3 |

**Action items for next video focus run (Run 3):** Add placeholder `videoId` for modules 07–10, verify all 10 theory.mdx files include a `<VideoEmbed>` tag, scaffold `/public/videos/` with a README, add "Phase 5b — Video Delivery" to TODO.md.

### Phase rollup

| Phase | Description | Progress | Δ since Apr 10 |
|-------|-------------|----------|-----------------|
| 1 | Foundation | ✅ ~95% | — |
| 2 | Content System | ✅ ~95% | — |
| 3 | Page Routes | ✅ ~85% | +5% (inferred from git) |
| 4 | Interactive (quiz, progress) | 🟡 ~70% | +45% (quiz flow verified per git) |
| 5 | Polish | 🟡 ~40% | +40% (metadataBase, smoke test per git) |
| 6 | Deployment | 🟡 ~40% | +40% (Dockerfile + localhost config) |
| 7 | Video Delivery (Point 5) | 🟡 ~35% | new (component + 6/10 videoIds exist) |

**Overall: ~75% (was ~60% on Apr 10).** The task description says ~93% as of Apr 11 from a host-shell execution — the delta may be work not yet reflected in the git log visible from this sandbox.

### Top 3 priorities for next run

1. **Content audit module 02** — check theory depth, quiz count (target ≥8), lab quality, and add stretch goals where missing.
2. **Locate/recreate TODO.md** — the project needs a living task tracker; without it, phases 6–7 priorities are unclear.
3. **Video focus prep** — Run 3 will be a video focus run; pre-identify appropriate placeholder YouTube IDs for modules 07–10 (GANs, NLP, Time Series, Production).

### Blockers / input needed from Tiago

1. **TODO.md and IMPLEMENTATION_PLAN.md are at workspace root** (outside `tensorflow-course/`). Found and reviewed — Phase 5b Video Delivery section already present with progress from Apr 11–12.
2. **Modules 07–10 missing videoId** — Tiago, do you have preferred YouTube lecture references for GANs, NLP/Transformers, Time Series, and Production/Deployment? Otherwise I'll use well-known public lectures (e.g., Lex Fridman, Andrej Karpathy, etc.) as placeholders.
3. **Lab stretch goals** — should I add "bonus challenge" sections to existing labs, or is that out of scope for now?

---

## April 10, 2026 (late-morning update) | **Automated hourly check-in**

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
