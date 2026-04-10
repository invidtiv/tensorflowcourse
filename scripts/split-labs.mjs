#!/usr/bin/env node
/**
 * Smart lab splitter.
 *
 * Walks content/modules/*\/labs/, finds monolithic lab source files
 * (lab-*.md), and splits them into individual .mdx files per lab.
 *
 * Delimiters recognized (at start of line):
 *   # Lab N[.M]: Title
 *   ## Lab N[.M]: Title
 *   # Lab N - Title         (uncommon)
 *
 * Content preceding the first delimiter is treated as the first lab,
 * and its title is taken from the file's YAML frontmatter if present.
 *
 * Output: labs/lab-XX-slug.mdx with generated frontmatter.
 * Source files are moved to labs/_sources/ for archival.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(ROOT, "content", "modules");

const LAB_HEADING = /^(#{1,2})\s+Lab\s+([0-9]+(?:\.[0-9]+)?)[\s:.\-–]+(.+?)\s*$/;

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { frontmatter: null, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: null, body: text };
  const fmRaw = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\n/, "");
  const fm = {};
  for (const line of fmRaw.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*"?(.*?)"?\s*$/);
    if (m) fm[m[1]] = m[2];
  }
  return { frontmatter: fm, body };
}

function buildFrontmatter({ title, moduleNumber, labNumber, difficulty, estimatedTime, source }) {
  const esc = (v) => String(v).replace(/"/g, '\\"');
  const lines = [
    "---",
    `title: "${esc(title)}"`,
    `module: ${moduleNumber}`,
    `labNumber: ${labNumber}`,
    `difficulty: "${esc(difficulty || "medium")}"`,
    `estimatedTime: "${esc(estimatedTime || "45-60 minutes")}"`,
    `source: "${esc(source)}"`,
    "---",
    "",
  ];
  return lines.join("\n");
}

/**
 * Split a body of markdown into sections by `# Lab N:` markers.
 * Returns array of { heading, labNum, title, body } with the content
 * before the first marker placed into the first section (heading=null).
 */
function splitByLabHeadings(body) {
  const lines = body.split("\n");
  const sections = [];
  let current = { heading: null, labNum: null, title: null, lines: [] };
  for (const line of lines) {
    const m = line.match(LAB_HEADING);
    if (m) {
      if (current.lines.length > 0 || current.heading != null) {
        sections.push(current);
      }
      current = {
        heading: line,
        labNum: m[2],
        title: m[3].trim(),
        lines: [],
      };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0 || current.heading != null) sections.push(current);
  return sections.map((s) => ({ ...s, body: s.lines.join("\n").trim() }));
}

function processModule(moduleDir) {
  const metaPath = path.join(moduleDir, "_meta.json");
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  const labsDir = path.join(moduleDir, "labs");
  if (!fs.existsSync(labsDir)) return null;

  const sourcesDir = path.join(labsDir, "_sources");
  fs.mkdirSync(sourcesDir, { recursive: true });

  const sourceFiles = fs
    .readdirSync(labsDir)
    .filter((f) => /^lab-.*\.md$/.test(f) && !/\.mdx$/.test(f))
    .sort();

  if (sourceFiles.length === 0) return { module: meta.number, created: 0, skipped: true };

  // Determine next global lab number for this module.
  let labCounter = 0;
  const outputs = [];

  for (const file of sourceFiles) {
    const full = path.join(labsDir, file);
    const raw = fs.readFileSync(full, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const sections = splitByLabHeadings(body);

    for (const sec of sections) {
      let title;
      let difficulty = (frontmatter && frontmatter.difficulty) || "medium";
      let estimatedTime = (frontmatter && frontmatter.estimatedTime) || "45-60 minutes";
      if (sec.heading == null) {
        // Leading content — use file frontmatter title if available, else skip if empty.
        if (!sec.body) continue;
        title = (frontmatter && frontmatter.title) || `Lab ${labCounter + 1}`;
      } else {
        title = sec.title;
      }
      labCounter += 1;
      const labNumStr = String(labCounter).padStart(2, "0");
      const slug = slugify(title);
      const outName = `lab-${labNumStr}-${slug}.mdx`;
      const outPath = path.join(labsDir, outName);

      const fm = buildFrontmatter({
        title,
        moduleNumber: meta.number,
        labNumber: labCounter,
        difficulty,
        estimatedTime,
        source: file,
      });

      // Re-emit the heading as a level-1 heading inside the body for MDX rendering.
      const bodyOut = sec.heading
        ? `# ${title}\n\n${sec.body}\n`
        : `${sec.body}\n`;

      fs.writeFileSync(outPath, fm + bodyOut);
      outputs.push(outName);
    }

    // Archive source
    fs.renameSync(full, path.join(sourcesDir, file));
  }

  return { module: meta.number, created: outputs.length, outputs };
}

function main() {
  const results = [];
  const moduleDirs = fs
    .readdirSync(MODULES_DIR)
    .filter((d) => /^\d{2}-/.test(d))
    .sort();
  for (const d of moduleDirs) {
    const r = processModule(path.join(MODULES_DIR, d));
    if (r) results.push(r);
  }
  console.log(JSON.stringify(results, null, 2));
  const total = results.reduce((a, r) => a + (r.created || 0), 0);
  console.log(`\nSplit ${total} labs across ${results.length} modules.`);
}

main();
