# Theory Rendering — MDX + KaTeX Migration

**Date:** April 10, 2026 ~20:40 local
**Scope:** Replace the regex-based `TheoryContentRenderer` with a real MDX
pipeline. Unblocks math, GFM tables, autolinked headings, and real JSX
components (`<Callout>`, `<CodeBlock>`, …) across all 10 theory pages.

---

## Verified

All 10 `content/modules/*/theory.mdx` files compile cleanly through the
**exact same plugin pipeline** the runtime theory page now uses
(`remark-gfm` → `remark-math` → `rehype-slug` → `rehype-autolink-headings`
→ `rehype-katex`). See `scripts/mdx-parse-check.mjs`.

| Module | Compile | KaTeX nodes | Callouts |
|---|---|---:|---:|
| 01 intro-deep-learning | ok (240 ms) | 0 | 9 |
| 02 neural-network-fundamentals | ok (864 ms) | **930** | 12 |
| 03 cnns | ok (173 ms) | 214 | 6 |
| 04 advanced-training | ok (447 ms) | 282 | 4 |
| 05 semantic-segmentation | ok (114 ms) | 112 | 0 |
| 06 object-detection | ok (100 ms) | 85 | 0 |
| 07 gans | ok (314 ms) | 495 | 0 |
| 08 nlp | ok (677 ms) | 848 | 13 |
| 09 time-series | ok (133 ms) | 139 | 12 |
| 10 production-deployment | ok (300 ms) | 255 | 4 |
| **total** | **10/10 ✅** | **3,360** | **60** |

"KaTeX nodes" is the count of `katex` class occurrences in the compiled MDX
output, which is the best proxy for "how much real math got rendered". The
previous custom renderer had **zero**. Module 01 legitimately contains no
math, which matches the source.

---

## What changed

### 1. `src/app/modules/[moduleId]/theory/page.tsx` — full rewrite

- Imports `MDXRemote` from `next-mdx-remote/rsc` (server-component edition)
  and the plugin set: `remarkGfm`, `remarkMath`, `rehypeKatex`, `rehypeSlug`,
  `rehypeAutolinkHeadings`.
- Passes the existing `mdxComponents` map from
  `src/components/mdx/MDXComponents.tsx` so `<Callout>`, `<CodeBlock>`,
  `<ImageZoom>`, `<VideoEmbed>`, `<MathBlock>`, etc. all work inside theory
  content.
- Opts into static generation with `dynamic = "force-static"`,
  `dynamicParams = false`, and `generateStaticParams()` returning all 10
  module IDs from `getAllModuleIds()`. MDX compilation now happens at build
  time, not on every request, so theory pages serve from prerendered HTML.

### 2. `src/app/modules/[moduleId]/theory/TheoryContentRenderer.tsx` — stubbed

The old regex renderer is kept as a no-op stub (file delete is blocked by
virtiofs perms) with a big warning comment. Nothing imports it anymore; the
theory page now talks to `MDXRemote` directly. Safe to delete on Tiago's
host with `rm`.

### 3. `scripts/convert-theory.mjs` — modernized

- **Callouts** are now emitted as real `<Callout type="..." title="...">`
  MDX JSX blocks instead of HTML `<div class="callout ...">`. The types map
  (`note`, `tip`, `warning`, `pitfall`) is unchanged and matches the
  existing `Callout.tsx` component config.
- **Math wrapping removed.** `wrapDisplayMath` is gone — remark-math parses
  `$...$` and `$$...$$` directly. Wrapping math in HTML divs was actively
  harmful because it hid LaTeX from the math parser.
- **JSX-hazard escaping added.** MDX v3 is stricter than the old MDX about
  what counts as a JSX expression or tag open. The new
  `escapeBareJsxBraces` + `escapeLineSkippingProtectedSpans` pass walks the
  body line by line and escapes, in prose regions only:
  - `{` → `&#123;` (otherwise interpreted as `{expression}`)
  - `}` → `&#125;`
  - `<` followed by a non-letter (e.g. `<100ms`, `<=`, `<5`) → `&lt;`
  Inline code (``` `...` ```), fenced code blocks, inline math (`$…$`), and
  display math (`$$…$$`) are all skipped so LaTeX like `\begin{cases}` and
  `$x < 0$` survive untouched. Tag-only JSX lines (`<Callout ...>`) are
  also passed through verbatim.

### 4. `scripts/mdx-parse-check.mjs` — new

A standalone compile-check using `@mdx-js/mdx` with the same plugins as the
runtime page. Runs in ~4 s against all 10 modules and reports per-module
byte sizes, compile time, katex node count, and callout count, or the exact
line/column of any MDX parse error. Use this after every converter run or
content change.

Run with `node scripts/mdx-parse-check.mjs`.

### 5. `src/app/globals.css`

Added `@import "katex/dist/katex.min.css";` so KaTeX's own CSS (fonts,
spacing, positioning) ships with every page. Without this import the math
parses correctly but renders as mis-aligned glyphs.

### 6. `package.json`

Added `remark-gfm@^4.0.1` and installed it. This is required for GitHub
flavored markdown tables, which module 01 alone uses 90+ times. No other
dep changes.

---

## Why the old renderer was shipping raw `$` signs

`TheoryContentRenderer.tsx` was a client-side `useMemo` that ran nine
regexes in sequence (`#` → headings, `` ``` `` → code, `*` → italic, `|` →
tables, etc.) against the raw MDX string and injected the result with
`dangerouslySetInnerHTML`. It had no concept of LaTeX, no concept of JSX,
and no concept of MDX components — the `next-mdx-remote`, `remark-math`,
`rehype-katex`, `rehype-slug`, and `rehype-autolink-headings` packages in
`package.json` were all dead weight in the bundle. That's why the previous
smoke test found **0** `katex` class names in the rendered HTML for
modules 02–10 despite thousands of `$…$` and `$$…$$` expressions in the
source.

---

## Gotchas encountered and fixed during the migration

1. **Module 01 heading `AI = {Systems that …}` etc.** Seven bare `{…}`
   pairs in module 01 prose (and a handful more in 02, 04, 06, 08)
   crashed the MDX parser with "Could not parse expression". Fixed by the
   new escape pass.
2. **Module 10 `<100ms`.** MDX v3 tries to parse `<100ms` as a JSX tag.
   Fixed by escaping `<` when it's not followed by an ASCII letter or
   `/`/`!`.
3. **LaTeX `\begin{cases}` inside math.** Would have been caught by a
   naive `{}` escape. Fixed by only escaping in non-math, non-code spans
   — math is detected by splitting on `$…$` / `$$…$$` before escaping.
4. **Callout bodies contained joined-line prose.** Continuation lines are
   joined with a space, which is a minor formatting regression for
   multi-point callouts but doesn't break rendering. A future pass could
   preserve list structure inside callouts.
5. **Five modules (05, 06, 07) have no callouts.** The source `theory.md`
   files use a different emphasis pattern that the callout regex doesn't
   match. Not a migration bug — those files simply don't have the
   `**Tip:**`/`**Note:**` cue, so they render without callout boxes. Can
   be revisited in Phase 5 polish by adding them to the source.

---

## What still needs to happen to see this in the browser

1. **Rebuild on the host.** The `.next/` directory in the workspace is
   still stale (from 19:20, this work was at 20:30+). Run
   `npm run build` on Tiago's side. Because theory pages are now
   `force-static`, build time will include the 10 MDX compilations —
   expect ~5 extra seconds of build wall time, per the parse-check
   numbers.
2. **Verify in the browser.** Load
   `http://<host>:6124/modules/02-neural-network-fundamentals/theory`
   and confirm you see rendered math (KaTeX glyphs, not `$x_i$`). Then
   `/modules/01-intro-deep-learning/theory` for tables and callouts.

---

## Files touched

```
M  src/app/modules/[moduleId]/theory/page.tsx           (full rewrite)
M  src/app/modules/[moduleId]/theory/TheoryContentRenderer.tsx  (stubbed)
M  src/app/globals.css                                  (+ katex css import)
M  scripts/convert-theory.mjs                           (callouts, math, escape)
A  scripts/mdx-parse-check.mjs                          (new)
M  package.json                                         (+ remark-gfm)
M  package-lock.json                                    (auto)
M  content/modules/01-intro-deep-learning/theory.mdx    (regenerated)
M  content/modules/02-neural-network-fundamentals/theory.mdx    (regenerated)
M  content/modules/03-cnns/theory.mdx                   (regenerated)
M  content/modules/04-advanced-training/theory.mdx      (regenerated)
M  content/modules/05-semantic-segmentation/theory.mdx  (regenerated)
M  content/modules/06-object-detection/theory.mdx       (regenerated)
M  content/modules/07-gans/theory.mdx                   (regenerated)
M  content/modules/08-nlp/theory.mdx                    (regenerated)
M  content/modules/09-time-series/theory.mdx            (regenerated)
M  content/modules/10-production-deployment/theory.mdx  (regenerated)
```
