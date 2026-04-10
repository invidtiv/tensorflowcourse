#!/usr/bin/env node
/**
 * Theory converter.
 *
 * Walks content/modules/*\/theory.md and produces a sibling theory.mdx with:
 *
 *   1. Enriched frontmatter pulled from the module's _meta.json
 *      (title, module, description, duration, difficulty, color, icon,
 *       prerequisites, objectives)
 *   2. Normalized fenced code blocks — any ``` without a language tag is
 *      promoted to the best guess (python by default, pseudocode when it
 *      looks like weight-update math)
 *   3. Callout conversion — lines that start with **Note:** / **Warning:** /
 *      **Tip:** / **Important:** / **Pitfall:** / **Example:** / **Key ...:**
 *      are wrapped in HTML <div class="callout callout-..."> blocks that the
 *      current TheoryContentRenderer passes through verbatim. The same
 *      classes render as real <Callout /> components once MDX compilation
 *      lands in Phase 4.
 *   4. KaTeX-ready math — $$ ... $$ blocks are wrapped in
 *      <div class="math-block"> so the existing renderer doesn't mangle them
 *      and a future KaTeX rehype plugin can pick them up. Inline $...$ is
 *      left untouched.
 *   5. Bookkeeping — source path, a `generatedBy` tag, and a `lastConverted`
 *      timestamp are written into the frontmatter so future re-runs are
 *      auditable.
 *
 * Original theory.md files are left in place as the source of truth — this
 * script is idempotent and safe to re-run.
 *
 * Usage:
 *   node scripts/convert-theory.mjs             # convert all 10 modules
 *   node scripts/convert-theory.mjs 03-cnns     # convert a single module
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(ROOT, "content", "modules");

// -----------------------------------------------------------------------------
// Minimal YAML frontmatter parser — we only need string/number/array scalars.
// -----------------------------------------------------------------------------
function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { frontmatter: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: {}, body: text };
  const fmRaw = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\n/, "");
  const fm = {};
  for (const line of fmRaw.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    fm[m[1]] = value;
  }
  return { frontmatter: fm, body };
}

function yamlString(value) {
  if (value == null) return '""';
  const s = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${s}"`;
}

function buildFrontmatter(fm) {
  const lines = ["---"];
  const emit = (k, v) => {
    if (v == null) return;
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
        return;
      }
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${yamlString(item)}`);
      return;
    }
    if (typeof v === "number" || typeof v === "boolean") {
      lines.push(`${k}: ${v}`);
      return;
    }
    lines.push(`${k}: ${yamlString(v)}`);
  };

  // Stable key order — matches what page loaders are looking for.
  const order = [
    "title",
    "module",
    "moduleId",
    "description",
    "shortTitle",
    "duration",
    "difficulty",
    "icon",
    "color",
    "prerequisites",
    "objectives",
    "source",
    "generatedBy",
    "lastConverted",
  ];
  for (const k of order) if (k in fm) emit(k, fm[k]);
  // Any extra keys the _meta.json carried but we didn't enumerate.
  for (const [k, v] of Object.entries(fm)) {
    if (order.includes(k)) continue;
    emit(k, v);
  }
  lines.push("---", "");
  return lines.join("\n");
}

// -----------------------------------------------------------------------------
// Transformations on the markdown body.
// -----------------------------------------------------------------------------

/**
 * Walk the body line-by-line while respecting fenced code blocks (so we don't
 * rewrite callout / math patterns that happen to appear inside code).
 * The `transform` callback receives (line, i, lines, inCode, codeLang) and
 * returns either a string or an array of strings to emit. Return the sentinel
 * object { skip: N } to drop the next N lines (used by callout consumption).
 */
function walkLines(body, transform) {
  const src = body.split("\n");
  const out = [];
  let inCode = false;
  let codeLang = "";
  let i = 0;
  while (i < src.length) {
    const line = src[i];
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (!inCode) {
        inCode = true;
        codeLang = fence[1] || "";
      } else {
        inCode = false;
        codeLang = "";
      }
      out.push(line);
      i += 1;
      continue;
    }
    const result = transform(line, i, src, inCode, codeLang);
    if (result == null) {
      out.push(line);
      i += 1;
      continue;
    }
    if (typeof result === "object" && "emit" in result) {
      for (const l of result.emit) out.push(l);
      i += (result.skip ?? 0) + 1;
      continue;
    }
    if (Array.isArray(result)) {
      for (const l of result) out.push(l);
      i += 1;
      continue;
    }
    out.push(result);
    i += 1;
  }
  return out.join("\n");
}

/**
 * Heuristic for detecting a code fence with no language.
 * - Empty lang → inspect first few body lines and guess.
 */
function guessFenceLanguage(body, openIndex) {
  const lines = body.split("\n");
  const snippet = [];
  for (let j = openIndex + 1; j < lines.length && snippet.length < 8; j += 1) {
    if (/^```/.test(lines[j])) break;
    snippet.push(lines[j]);
  }
  const s = snippet.join("\n");
  if (/\b(import\s+tensorflow|import\s+numpy|import\s+torch|def\s+\w+\(|print\()/.test(s)) return "python";
  if (/\$\s*pip|\$\s*conda|\$\s*docker|\$\s*npm|\$\s*bash/.test(s)) return "bash";
  if (/^\s*\{/.test(s) && /:\s*("|\d|\[|\{)/.test(s)) return "json";
  if (/<\/?[a-z]+[^>]*>/.test(s)) return "html";
  if (/w_i\(t\+1\)|\beta\b|\balpha\b|\bgradient\b|\b←\b|:=/.test(s)) return "text";
  return "python";
}

function normalizeCodeFences(body) {
  const lines = body.split("\n");
  let inCode = false;
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^```(\w*)\s*$/);
    if (!m) continue;
    if (!inCode) {
      if (!m[1]) {
        const lang = guessFenceLanguage(body, i);
        lines[i] = "```" + lang;
      }
      inCode = true;
    } else {
      inCode = false;
    }
  }
  return lines.join("\n");
}

/**
 * Convert bold-prefix callouts:
 *
 *   **Note:** rest of the line
 *   continuation line belonging to the callout
 *   (blank line terminates)
 *
 * into an HTML block the existing regex renderer passes through, and that
 * a real MDX compiler can later re-parse into <Callout /> via class hook.
 */
const CALLOUT_TYPES = {
  note: "note",
  tip: "tip",
  warning: "warning",
  pitfall: "pitfall",
  important: "warning",
  example: "note",
  insight: "tip",
  "key insight": "tip",
  "key idea": "tip",
  "key point": "tip",
  "key concept": "tip",
  "key takeaway": "tip",
  "key takeaways": "tip",
};

const CALLOUT_RE = /^\*\*([A-Z][A-Za-z ]{1,20}):\*\*\s*(.*)$/;

function convertCallouts(body) {
  const src = body.split("\n");
  const out = [];
  let inCode = false;
  for (let i = 0; i < src.length; i += 1) {
    const line = src[i];
    if (/^```/.test(line)) {
      inCode = !inCode;
      out.push(line);
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }
    const m = line.match(CALLOUT_RE);
    if (!m) {
      out.push(line);
      continue;
    }
    const label = m[1].trim();
    const type = CALLOUT_TYPES[label.toLowerCase()];
    if (!type) {
      // Leave unknown bold labels alone.
      out.push(line);
      continue;
    }
    // Collect continuation lines until a blank line or a heading.
    const bodyLines = [m[2]];
    let j = i + 1;
    while (j < src.length) {
      const next = src[j];
      if (next.trim() === "") break;
      if (/^#{1,6}\s/.test(next)) break;
      if (/^```/.test(next)) break;
      if (CALLOUT_RE.test(next)) break;
      bodyLines.push(next);
      j += 1;
    }
    i = j - 1;
    const inner = bodyLines.join(" ").trim();
    // HTML block that the regex renderer won't wrap in <p>.
    out.push(
      `<div class="my-6 rounded-xl border border-white/[0.08] bg-surface-1/30 px-4 py-3 callout callout-${type}" data-callout-type="${type}" data-callout-label="${label}">`
    );
    out.push(
      `  <div class="text-[11px] font-mono font-semibold uppercase tracking-wider text-neon-cyan mb-1">${label}</div>`
    );
    out.push(`  <div class="text-text-secondary leading-relaxed">${inner}</div>`);
    out.push(`</div>`);
  }
  return out.join("\n");
}

/**
 * Wrap $$ display math blocks in a styled HTML div so (a) the regex renderer
 * doesn't mangle them, and (b) a future remark-math/rehype-katex pass can
 * still pick up the raw LaTeX inside.
 */
function wrapDisplayMath(body) {
  const lines = body.split("\n");
  const out = [];
  let inCode = false;
  let inMath = false;
  let buf = [];
  for (const line of lines) {
    if (/^```/.test(line)) {
      inCode = !inCode;
      out.push(line);
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (trimmed === "$$") {
      if (!inMath) {
        inMath = true;
        buf = [];
        out.push(`<div class="my-6 rounded-xl border border-white/[0.06] bg-surface-1/20 px-4 py-3 font-code text-sm text-text-primary math-block">`);
        out.push(`  <div class="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">KaTeX</div>`);
        out.push(`  <div class="overflow-x-auto whitespace-pre">$$`);
      } else {
        inMath = false;
        out.push(buf.map((l) => "    " + l).join("\n"));
        out.push(`  $$</div>`);
        out.push(`</div>`);
      }
      continue;
    }
    if (inMath) {
      buf.push(line);
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

/**
 * The theory files all open with a big "# Module N: ..." heading followed by
 * "## Comprehensive Theoretical Content" which is redundant with the page
 * chrome the theory route already renders. Strip both so the MDX starts with
 * the first real chapter heading.
 */
function stripTopBanner(body) {
  const lines = body.split("\n");
  let i = 0;
  // Skip leading blank lines.
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (i >= lines.length) return body;
  if (!/^#\s+Module\s+\d+/i.test(lines[i])) return body;
  i += 1;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (i < lines.length && /^##\s+Comprehensive/i.test(lines[i])) {
    i += 1;
  }
  while (i < lines.length && (lines[i].trim() === "" || lines[i].trim() === "---")) i += 1;
  return lines.slice(i).join("\n");
}

// -----------------------------------------------------------------------------
// Per-module driver.
// -----------------------------------------------------------------------------
function convertModule(moduleDirName) {
  const moduleDir = path.join(MODULES_DIR, moduleDirName);
  const theoryMdPath = path.join(moduleDir, "theory.md");
  const theoryMdxPath = path.join(moduleDir, "theory.mdx");
  const metaPath = path.join(moduleDir, "_meta.json");

  if (!fs.existsSync(theoryMdPath)) {
    return { moduleDirName, skipped: true, reason: "no theory.md" };
  }

  const raw = fs.readFileSync(theoryMdPath, "utf-8");
  const { frontmatter: fm, body: rawBody } = parseFrontmatter(raw);

  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    } catch (e) {
      console.warn(`! ${moduleDirName}: _meta.json unreadable (${e.message})`);
    }
  }

  const merged = {
    title: fm.title || meta.title || moduleDirName,
    module: Number(fm.module || meta.number || 0),
    moduleId: meta.id || moduleDirName,
    description: fm.description || meta.description || "",
    shortTitle: meta.shortTitle || undefined,
    duration: fm.duration || meta.duration || "",
    difficulty: fm.difficulty || meta.difficulty || "intermediate",
    icon: meta.icon || undefined,
    color: meta.color || undefined,
    prerequisites: meta.prerequisites || [],
    objectives: meta.objectives || [],
    source: `content/modules/${moduleDirName}/theory.md`,
    generatedBy: "scripts/convert-theory.mjs",
    lastConverted: new Date().toISOString(),
  };

  let body = rawBody;
  body = stripTopBanner(body);
  body = normalizeCodeFences(body);
  body = convertCallouts(body);
  body = wrapDisplayMath(body);

  // Trim trailing whitespace and ensure a single trailing newline.
  body = body.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

  const mdx = buildFrontmatter(merged) + body;
  fs.writeFileSync(theoryMdxPath, mdx);

  // Metrics for the run report.
  const metrics = {
    moduleDirName,
    title: merged.title,
    bytesIn: raw.length,
    bytesOut: mdx.length,
    callouts: (mdx.match(/data-callout-type=/g) || []).length,
    mathBlocks: (mdx.match(/class="[^"]*math-block/g) || []).length,
    codeFences: (mdx.match(/^```/gm) || []).length / 2,
  };
  return metrics;
}

// -----------------------------------------------------------------------------
// Entry point.
// -----------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(MODULES_DIR)) {
    console.error(`! modules dir not found at ${MODULES_DIR}`);
    process.exit(1);
  }
  const filter = process.argv[2];
  const dirs = fs
    .readdirSync(MODULES_DIR)
    .filter((name) => fs.statSync(path.join(MODULES_DIR, name)).isDirectory())
    .filter((name) => !filter || name === filter)
    .sort();

  if (dirs.length === 0) {
    console.error(`! no matching modules (filter: ${filter ?? "none"})`);
    process.exit(1);
  }

  console.log(`Converting ${dirs.length} module(s)...\n`);
  const results = [];
  for (const d of dirs) {
    try {
      const res = convertModule(d);
      results.push(res);
      if (res.skipped) {
        console.log(`  skip  ${d} — ${res.reason}`);
      } else {
        console.log(
          `  ok    ${d}  ${res.codeFences} fences, ${res.callouts} callouts, ${res.mathBlocks} math  (${res.bytesIn}→${res.bytesOut} B)`
        );
      }
    } catch (e) {
      console.error(`  FAIL  ${d} — ${e.stack || e.message}`);
      results.push({ moduleDirName: d, error: e.message });
    }
  }

  const ok = results.filter((r) => !r.skipped && !r.error).length;
  const fail = results.filter((r) => r.error).length;
  console.log(`\nDone. ${ok} converted, ${fail} failed, ${results.length - ok - fail} skipped.`);
  if (fail > 0) process.exit(1);
}

main();
