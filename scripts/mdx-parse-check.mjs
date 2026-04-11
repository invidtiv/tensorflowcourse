#!/usr/bin/env node
/**
 * Parse-check every theory.mdx against the same plugin pipeline the theory
 * page uses at runtime. Reports per-module: math blocks seen by remark-math,
 * KaTeX errors from rehype-katex, and any parser crashes.
 *
 * Usage: node scripts/mdx-parse-check.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = path.resolve(__dirname, "..", "content", "modules");

async function checkModule(moduleDir) {
  const file = path.join(MODULES_DIR, moduleDir, "theory.mdx");
  if (!fs.existsSync(file)) return { moduleDir, skipped: true };
  const raw = fs.readFileSync(file, "utf-8");
  const { content } = matter(raw);
  const start = Date.now();
  try {
    const compiled = await compile(content, {
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        rehypeKatex,
      ],
      outputFormat: "function-body",
      development: false,
    });
    const out = String(compiled);
    return {
      moduleDir,
      ok: true,
      ms: Date.now() - start,
      bytesIn: content.length,
      bytesOut: out.length,
      katex: (out.match(/katex/g) || []).length,
      callout: (out.match(/\bCallout\b/g) || []).length,
    };
  } catch (e) {
    return {
      moduleDir,
      ok: false,
      ms: Date.now() - start,
      error: e.message,
      line: e.line,
      column: e.column,
    };
  }
}

const dirs = fs
  .readdirSync(MODULES_DIR)
  .filter((n) => fs.statSync(path.join(MODULES_DIR, n)).isDirectory())
  .sort();

const results = [];
for (const d of dirs) {
  const r = await checkModule(d);
  results.push(r);
  if (r.skipped) {
    console.log(`  skip  ${d}`);
  } else if (r.ok) {
    console.log(
      `  ok    ${d}  (${r.ms}ms)  ${r.bytesIn}→${r.bytesOut}  katex=${r.katex}  Callout=${r.callout}`
    );
  } else {
    console.log(`  FAIL  ${d}  (${r.ms}ms)  ${r.error}${r.line ? `  @${r.line}:${r.column}` : ""}`);
  }
}

const ok = results.filter((r) => r.ok).length;
const fail = results.filter((r) => r.ok === false).length;
console.log(`\n${ok} ok, ${fail} failed, ${results.length - ok - fail} skipped`);
process.exit(fail > 0 ? 1 : 0);
