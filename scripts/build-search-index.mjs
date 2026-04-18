#!/usr/bin/env node
/**
 * build-search-index.mjs
 *
 * Walks all content/modules/<slug>/labs/*.mdx and content/modules/<slug>/theory.mdx
 * as well as content/modules/<slug>/quiz.json, extracts metadata + plain-text
 * body, and emits public/search-index.json.
 *
 * Wire into package.json:
 *   "build-search": "node scripts/build-search-index.mjs"
 *   "prebuild": "node scripts/check-transcripts.mjs && node scripts/build-search-index.mjs"
 *
 * Each entry:
 *   id, kind, moduleId, moduleNumber, labId?, title, description, tags, body (~300 chars)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// gray-matter ships as CJS; createRequire lets us import it in an ESM script.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(ROOT, "content", "modules");
const OUTPUT_FILE = path.join(ROOT, "public", "search-index.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip MDX / Markdown noise and return plain readable text (≤ maxLen chars). */
function mdxToPlainText(raw, maxLen = 400) {
  let text = raw
    // Remove YAML front matter block (already parsed by gray-matter, but just in case)
    .replace(/^---[\s\S]*?---\n?/, "")
    // Remove code fences (```...```)
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`[^`]*`/g, "")
    // Remove JSX/HTML tags
    .replace(/<[^>]+>/g, " ")
    // Remove markdown headings markers
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic markers
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
    // Remove link syntax, keep text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Remove image syntax
    .replace(/!\[.*?\]\(.*?\)/g, "")
    // Remove blockquote markers
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/** Parse module number from directory name like "02-neural-network-fundamentals" */
function parseModuleNumber(dirName) {
  const m = dirName.match(/^(\d+)-/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Derive a lab number from filename like "lab-04-some-title.mdx" */
function parseLabNumber(filename) {
  const m = filename.match(/^lab-(\d+)-/);
  return m ? parseInt(m[1], 10) : 0;
}

// ---------------------------------------------------------------------------
// Entry builders
// ---------------------------------------------------------------------------

function buildLabEntry(moduleId, moduleNumber, labFilePath) {
  const filename = path.basename(labFilePath, ".mdx");
  const raw = fs.readFileSync(labFilePath, "utf-8");
  const { data: fm, content } = matter(raw);

  const labNumber = parseLabNumber(filename);
  const id = `m${String(moduleNumber).padStart(2, "0")}-${filename}`;

  const title = fm.title || filename.replace(/-/g, " ");
  const description = fm.description || fm.summary || "";
  const tags = Array.isArray(fm.tags)
    ? fm.tags
    : typeof fm.tags === "string"
    ? [fm.tags]
    : [];
  const difficulty = fm.difficulty || fm.difficultyLevel || "";
  const duration = fm.estimatedTime || fm.duration || "";

  const body = mdxToPlainText(content);

  return {
    id,
    kind: "lab",
    moduleId,
    moduleNumber,
    labId: filename,
    labNumber,
    title,
    description,
    tags,
    difficulty,
    duration,
    body,
  };
}

function buildTheoryEntry(moduleId, moduleNumber, theoryFilePath, moduleMeta) {
  const raw = fs.readFileSync(theoryFilePath, "utf-8");
  const { data: fm, content } = matter(raw);

  const id = `m${String(moduleNumber).padStart(2, "0")}-theory`;
  const title = fm.title || moduleMeta?.title || `Module ${moduleNumber} Theory`;
  const description =
    fm.description || moduleMeta?.description || "";
  const tags = Array.isArray(fm.tags)
    ? fm.tags
    : typeof fm.tags === "string"
    ? [fm.tags]
    : [];

  const body = mdxToPlainText(content);

  return {
    id,
    kind: "theory",
    moduleId,
    moduleNumber,
    title,
    description,
    tags,
    body,
  };
}

function buildQuizEntries(moduleId, moduleNumber, quizFilePath, moduleMeta) {
  const raw = fs.readFileSync(quizFilePath, "utf-8");
  let quizData;
  try {
    quizData = JSON.parse(raw);
  } catch {
    console.warn(`  WARN: Could not parse quiz.json at ${quizFilePath}`);
    return [];
  }

  const questions = Array.isArray(quizData.questions)
    ? quizData.questions
    : [];
  if (questions.length === 0) return [];

  // Summarise all question texts into one body for searchability
  const body = questions
    .map((q) => q.question || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);

  const id = `m${String(moduleNumber).padStart(2, "0")}-quiz`;
  const title = `Module ${moduleNumber} Quiz`;
  const description =
    moduleMeta?.title
      ? `Test your knowledge of ${moduleMeta.title}`
      : `Quiz for Module ${moduleNumber}`;

  return [
    {
      id,
      kind: "quiz",
      moduleId,
      moduleNumber,
      title,
      description,
      tags: [],
      questionCount: questions.length,
      body,
    },
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("build-search-index: scanning content/modules…");

  const moduleDirs = fs
    .readdirSync(MODULES_DIR)
    .filter((d) => fs.statSync(path.join(MODULES_DIR, d)).isDirectory())
    .sort();

  const entries = [];

  for (const dirName of moduleDirs) {
    const moduleDir = path.join(MODULES_DIR, dirName);
    const moduleNumber = parseModuleNumber(dirName);

    // Load _meta.json for module title / description
    const metaPath = path.join(moduleDir, "_meta.json");
    let moduleMeta = null;
    if (fs.existsSync(metaPath)) {
      try {
        moduleMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      } catch {
        console.warn(`  WARN: Could not parse _meta.json for ${dirName}`);
      }
    }

    // Labs
    const labsDir = path.join(moduleDir, "labs");
    if (fs.existsSync(labsDir)) {
      const labFiles = fs
        .readdirSync(labsDir)
        .filter((f) => f.endsWith(".mdx"))
        .sort();

      for (const labFile of labFiles) {
        try {
          const entry = buildLabEntry(
            dirName,
            moduleNumber,
            path.join(labsDir, labFile)
          );
          entries.push(entry);
        } catch (err) {
          console.warn(`  WARN: Failed to process lab ${labFile}: ${err.message}`);
        }
      }
    }

    // Theory (prefer .mdx, fall back to .md)
    const theoryMdx = path.join(moduleDir, "theory.mdx");
    const theoryMd = path.join(moduleDir, "theory.md");
    const theoryPath = fs.existsSync(theoryMdx)
      ? theoryMdx
      : fs.existsSync(theoryMd)
      ? theoryMd
      : null;

    if (theoryPath) {
      try {
        entries.push(
          buildTheoryEntry(dirName, moduleNumber, theoryPath, moduleMeta)
        );
      } catch (err) {
        console.warn(`  WARN: Failed to process theory for ${dirName}: ${err.message}`);
      }
    }

    // Quiz
    const quizPath = path.join(moduleDir, "quiz.json");
    if (fs.existsSync(quizPath)) {
      try {
        const quizEntries = buildQuizEntries(
          dirName,
          moduleNumber,
          quizPath,
          moduleMeta
        );
        entries.push(...quizEntries);
      } catch (err) {
        console.warn(`  WARN: Failed to process quiz for ${dirName}: ${err.message}`);
      }
    }

    const labCount = entries.filter(
      (e) => e.kind === "lab" && e.moduleId === dirName
    ).length;
    console.log(
      `  ${dirName}: ${labCount} labs${theoryPath ? " + theory" : ""}${
        fs.existsSync(path.join(moduleDir, "quiz.json")) ? " + quiz" : ""
      }`
    );
  }

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2), "utf-8");

  const bytes = fs.statSync(OUTPUT_FILE).size;
  const labEntries = entries.filter((e) => e.kind === "lab").length;
  const theoryEntries = entries.filter((e) => e.kind === "theory").length;
  const quizEntries = entries.filter((e) => e.kind === "quiz").length;

  console.log(
    `\nbuild-search-index: wrote ${entries.length} entries` +
      ` (${labEntries} labs, ${theoryEntries} theory, ${quizEntries} quiz)` +
      ` → ${OUTPUT_FILE}` +
      ` (${(bytes / 1024).toFixed(1)} KB)`
  );
}

main();
