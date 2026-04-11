# Smoke Test Report — Theory + Quiz Runtime

**Date:** April 10, 2026 ~20:25 local (automated hourly check-in)
**Scope:** `/modules/01-intro-deep-learning/theory` and `/modules/01-intro-deep-learning/quiz`
**Method:** Launched the existing `.next/standalone/` server from a copy in
`/tmp/standalone` on port 6125, issued HTTP requests, inspected returned HTML
and bundle/source on disk.

---

## TL;DR

| Target | HTTP | Verdict |
|---|---|---|
| `/` (home) | 200 | ✅ renders |
| `/modules/01.../theory` | 200 | 🟡 renders, but **no KaTeX**, no Callouts |
| `/modules/02.../theory` | 200 | 🔴 renders, all math shows as raw `$...$` |
| `/modules/01.../quiz` | 200 | 🔴 shows **"Quiz Coming Soon"** placeholder |

Two real bugs, one stale-build artifact. Details below.

---

## 1. Theory route — renders, but math and callouts are broken

**What works**

- Route responds 200 (648 KB for module 01, 239 KB for module 02).
- Frontmatter is stripped correctly by `gray-matter` in `src/lib/content.ts`.
- Module 01 returns 33 `<h2>` headings and 124 rendered `<pre>` code blocks.
  "Chapter 1" and all prose render cleanly.
- Loader correctly prefers `theory.mdx` over `theory.md` fallback.

**What's broken**

The renderer at `src/app/modules/[moduleId]/theory/TheoryContentRenderer.tsx`
is **not using MDX, `next-mdx-remote`, `remark-math`, or `rehype-katex` at all**
— despite all four being listed in `package.json`. It is a hand-rolled,
client-side regex markdown → HTML pass with an explicit comment:

> `// In production, this would use MDX compilation`

Consequences:

1. **No KaTeX.** `grep -c katex` on the rendered HTML returns **0**. Module 01
   is fine because it has zero math blocks, but every other module is not:

   | Module | inline `$…$` | block `$$…$$` |
   |---|---|---|
   | 02 neural-network-fundamentals | 483 | 100 |
   | 03 cnns | 255 | 64 |
   | 04 advanced-training | 94 | 94 |
   | 05 semantic-segmentation | 199 | 61 |
   | 06 object-detection | 260 | 66 |
   | 07 gans | 268 | 52 |
   | 08 nlp | 448 | 90 |
   | 09 time-series | 505 | 124 |
   | 10 production-deployment | 125 | 33 |

   Confirmed at runtime against module 02: HTML contains literal
   `$x_i$`, `$w_i$`, `$b$`, `$\theta$` next to an opening
   `<p>` — the `*italic*` replacement in the same regex pass will also eat
   single `$…$` segments that straddle asterisks. This will look awful on
   every module from 02 onward.

2. **No `<Callout>` support.** The `convert-theory.mjs` script emitted zero
   `<Callout>` JSX tags across all 10 files, and the renderer has no handler
   for them anyway. Any `> **Note**` style admonitions will fall through to a
   plain blockquote. Not blocking, but worth noting for Phase 5 polish.

3. **MDX packages are installed but unused.** `next-mdx-remote@6`,
   `remark-math@6`, `rehype-katex@7`, `rehype-slug`,
   `rehype-autolink-headings` are all dead weight in the bundle right now.

**Recommended fix**

Replace `TheoryContentRenderer.tsx` with an actual
`<MDXRemote />` (or compiled MDX via `@next/mdx`) using the already-installed
`remark-math` + `rehype-katex` plugin chain, plus a Callout component mapping.
This is a single-file change and unblocks modules 02–10 all at once.

---

## 2. Quiz route — "Quiz Coming Soon" placeholder is being served

**Symptom**

The live HTML for `/modules/01-intro-deep-learning/quiz` (and `/02.../quiz`)
contains:

```html
<h2 ...>Quiz Coming Soon</h2>
<p ...>Quiz questions are being…
```

`hasQuestions` is evaluating to `false` at request time, and the page renders
the placeholder branch instead of the `<Quiz>` component.

**Root cause: stale `.next/` build**

Timestamps tell the whole story:

```
19:20:57  .next/BUILD_ID                           ← the build
19:28:36  src/lib/content.ts                       ← +8m
19:30:51  src/components/quiz/Quiz.tsx             ← +10m
19:31:22  src/app/modules/[moduleId]/quiz/page.tsx ← +11m
```

The current source tree has the new `getModuleQuiz()` loader, the four Quiz
components, and the page rewrite that wires them up — but the `.next/` build
in the workspace is from **before** any of that landed. The server bundle
(`.next/server/app/modules/[moduleId]/quiz/page.js`) still contains the old
"Coming Soon" literal and no reference to `quiz.json` or `getModuleQuiz`.

I verified `quiz.json` is readable from the standalone runtime's cwd and
parses to 5 questions with `passingScore: 80`, so the data layer itself is
fine. Once the project is rebuilt against current source, this page should
render the full quiz flow.

**Unrelated minor concern in the Quiz component**

`src/components/quiz/Quiz.tsx` is a client component that renders only a
`"Loading quiz…"` placeholder until the `useEffect` that seeds `useQuizStore`
has run on the client. That means:

- The initial server HTML for the quiz page will always show "Loading quiz…"
  first, even on a correct build — the real questions appear only after JS
  hydration.
- SSR-only clients (curl, crawlers, OG scrapers) will never see the question
  content. Probably acceptable for a learning route, but worth a note.

---

## 3. Rebuild attempt (unsuccessful, non-blocking)

I tried to produce a fresh build from a copy of the project under `/tmp` to
re-smoke-test the quiz route:

1. Turbopack path (`next build`) rejected the `node_modules` symlink:
   *"Symlink [project]/node_modules is invalid, it points out of the
   filesystem root."*
2. Webpack path (`next build --webpack`) failed with
   *"SyntaxError: Unexpected end of input"* with no file pointer — likely
   an issue in one of the newer client components (e.g. `NeuralNetworkHero`,
   `ParticleBackground`, or one of the Quiz files), but I could not localize
   it in the sandbox without more time and disk space (sandbox `/` is at 95%).
3. A physical `cp` of `node_modules` (414 MB) into `/tmp` filled the sandbox
   disk and was rolled back.

**Net:** runtime verification of the post-fix quiz flow still depends on a
rebuild run on Tiago's host. Nothing Tiago needs to unblock from this session.

---

## Top 3 Priorities (updated)

1. **Rebuild on the host.** `npm run build` on Tiago's side (he already has a
   working `.next/` pipeline there) — the build should pick up the
   `theory.mdx` files and the new Quiz wiring, and the "Coming Soon"
   placeholder should disappear for all 10 quiz routes. If the webpack
   `SyntaxError` reproduces there, look at the most recently touched files
   under `src/components/quiz/`, `src/components/animations/`, and
   `src/app/modules/[moduleId]/quiz/page.tsx`.
2. **Fix theory rendering to actually use MDX + KaTeX.** Replace
   `TheoryContentRenderer.tsx` with `<MDXRemote />` + `remark-math` +
   `rehype-katex` + a `<Callout>` component map. Without this, modules 02–10
   ship with thousands of raw `$…$` strings on-screen. This is the single
   highest-impact content fix remaining.
3. **Initial push to `github.com/invidtiv/tensorflowcourse`.** Still
   outstanding from the previous check-in. Unblocks incremental commits and
   lets future sessions inspect history via `gh`.

---

## Evidence / commands used

- `curl` to `127.0.0.1:6125` for `/`, `/modules/01…/theory`,
  `/modules/02…/theory`, `/modules/01…/quiz`, `/modules/02…/quiz`
  → all 200.
- `grep -c katex` on rendered theory HTML → 0 for both modules tested.
- `grep` on rendered quiz HTML → finds `Quiz Coming Soon`, does **not** find
  `5 questions ·` (the `hasQuestions` branch subtitle) or any `m1-q1…` id.
- `node -e "JSON.parse(fs.readFileSync('content/modules/01.../quiz.json'))"`
  from the standalone cwd → 5 questions, passingScore 80.
- `stat` on `.next/BUILD_ID` vs source files → build predates current source
  by 8–11 minutes.
