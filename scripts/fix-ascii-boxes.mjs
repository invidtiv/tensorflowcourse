#!/usr/bin/env node
// Normalizes width of bordered ASCII box diagrams in MDX content.
//
// Rationale: the source content contains many box-drawing diagrams where
// outer rectangle borders drift by 1-3 characters row-to-row. No font/CSS
// fix can repair this because the text itself has inconsistent column
// counts. This script walks every ```...``` fenced block in theory.mdx
// files, detects blocks containing box-drawing characters, and pads clearly
// bordered lines so the outer rectangle aligns.
//
// Conservative rules — only these line patterns get modified:
//   1. `│...│`           — left and right are `│`. Pad with spaces just
//                          before the trailing `│` until width == target.
//   2. `┌─...─┐` / `├─...─┤` / `└─...─┘`  — horizontal rule. Extend the
//                          run of `─` characters until width == target.
// All other lines (arrows, labels, partial connectors) are untouched.
//
// The target width is the maximum width of the block (so we only ever pad
// outward, never truncate content).
//
// Usage: node scripts/fix-ascii-boxes.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_GLOB = path.join(ROOT, "content/modules");

const BOX_CHARS = new Set([..."─│┌┐└┘├┤┬┴┼▶◀▲▼"]);
const dryRun = process.argv.includes("--dry-run");

function codepointLength(s) {
  return [...s].length;
}

function hasBoxChar(line) {
  for (const c of line) if (BOX_CHARS.has(c)) return true;
  return false;
}

// A line is a "vertical border row" if it starts with │ and ends with │.
function isVerticalBorderRow(line) {
  const chars = [...line];
  return chars.length >= 2 && chars[0] === "│" && chars[chars.length - 1] === "│";
}

// A line is a "horizontal rule" if it matches one of:
//   ┌─+┐   ├─+┤   └─+┘   and contains ONLY box-drawing run chars.
function isHorizontalRule(line) {
  return /^[┌├└]─+[┐┤┘]$/.test(line);
}

function padVerticalBorder(line, targetWidth) {
  const chars = [...line];
  const currentWidth = chars.length;
  if (currentWidth >= targetWidth) return line;
  const pad = " ".repeat(targetWidth - currentWidth);
  // Insert pad just before the trailing │
  return chars.slice(0, -1).join("") + pad + "│";
}

function extendHorizontalRule(line, targetWidth) {
  const chars = [...line];
  const currentWidth = chars.length;
  if (currentWidth >= targetWidth) return line;
  const left = chars[0];
  const right = chars[chars.length - 1];
  const dashCount = targetWidth - 2;
  return left + "─".repeat(dashCount) + right;
}

function processBlock(blockLines) {
  if (!blockLines.some(hasBoxChar)) return { lines: blockLines, changed: 0 };
  const widths = blockLines.map(codepointLength);
  const target = Math.max(...widths);
  let changed = 0;
  const out = blockLines.map((ln) => {
    if (codepointLength(ln) === target) return ln;
    if (isVerticalBorderRow(ln)) {
      const fixed = padVerticalBorder(ln, target);
      if (fixed !== ln) changed++;
      return fixed;
    }
    if (isHorizontalRule(ln)) {
      const fixed = extendHorizontalRule(ln, target);
      if (fixed !== ln) changed++;
      return fixed;
    }
    return ln;
  });
  return { lines: out, changed };
}

function processFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  let totalChanged = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      // Capture fence
      out.push(line);
      i++;
      const blockStart = i;
      while (i < lines.length && !lines[i].startsWith("```")) i++;
      const block = lines.slice(blockStart, i);
      const { lines: processed, changed } = processBlock(block);
      totalChanged += changed;
      out.push(...processed);
      if (i < lines.length) {
        out.push(lines[i]); // closing fence
        i++;
      }
    } else {
      out.push(line);
      i++;
    }
  }
  const newText = out.join("\n");
  if (newText !== text) {
    if (!dryRun) fs.writeFileSync(filePath, newText, "utf8");
  }
  return totalChanged;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name === "theory.mdx") out.push(full);
  }
  return out;
}

const files = walk(CONTENT_GLOB);
let grandTotal = 0;
for (const f of files) {
  const n = processFile(f);
  if (n > 0) {
    console.log(`${dryRun ? "[dry] " : ""}${path.relative(ROOT, f)}: ${n} line(s) padded`);
    grandTotal += n;
  }
}
console.log(`\n${dryRun ? "Would pad" : "Padded"} ${grandTotal} border line(s) across ${files.length} theory files.`);
