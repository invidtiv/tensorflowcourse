#!/usr/bin/env node
/**
 * Walk every content/modules/<slug>/_meta.json, resolve transcriptUrl /
 * videoCaptions[].src to an on-disk file under public/, and report any
 * that are missing. Also flags module metadata that has a videoId but no
 * transcriptUrl (reminder to author a transcript).
 *
 * Exit code:
 *   0 — all referenced transcript files exist (warnings still allowed)
 *   1 — at least one referenced file is missing (hard failure)
 *
 * Wire into CI via `pretest` / `prebuild`, e.g.:
 *   "prebuild": "node scripts/check-transcripts.mjs"
 *
 * Usage: node scripts/check-transcripts.mjs [--strict]
 *   --strict  Also fail on warnings (missing transcriptUrl when videoId set,
 *             or videoCaptions[].src pointing at a missing file, or a
 *             transcript file below the cue-count / byte-size lower bounds).
 *
 * Lower bounds (catch empty / truncated replacement VTTs):
 *   MIN_CUES  = 12   (scaffolds ship at 17; < 12 signals a truncated replacement)
 *   MIN_BYTES = 2048 (< 2 KB signals an empty or placeholder VTT)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(ROOT, "content", "modules");
const PUBLIC_DIR = path.join(ROOT, "public");

const STRICT = process.argv.includes("--strict");
const MIN_CUES = 12;
const MIN_BYTES = 2048;

/**
 * Count timestamp cues in a WebVTT file. A cue is any line matching
 * `HH:MM:SS.mmm --> HH:MM:SS.mmm`. This is cheap, robust, and tolerant
 * of optional cue IDs, NOTE blocks, and STYLE blocks.
 */
function countVttCues(contents) {
  const re = /^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}/gm;
  const matches = contents.match(re);
  return matches ? matches.length : 0;
}

function resolvePublic(urlPath) {
  // urlPath looks like "/videos/transcripts/01-...-en.vtt"
  if (!urlPath || typeof urlPath !== "string") return null;
  const rel = urlPath.replace(/^\/+/, "");
  return path.join(PUBLIC_DIR, rel);
}

const results = {
  checked: 0,
  missingTranscript: [], // hard errors
  missingCaption: [],    // soft warnings
  noTranscriptUrl: [],   // soft warnings (has videoId, no transcriptUrl)
  tooSmall: [],          // soft warnings (below MIN_CUES or MIN_BYTES)
  ok: [],
};

if (!fs.existsSync(MODULES_DIR)) {
  console.error(`[check-transcripts] modules dir not found: ${MODULES_DIR}`);
  process.exit(1);
}

const moduleDirs = fs
  .readdirSync(MODULES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const moduleDir of moduleDirs) {
  const metaPath = path.join(MODULES_DIR, moduleDir, "_meta.json");
  if (!fs.existsSync(metaPath)) continue;
  results.checked++;

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch (err) {
    console.error(`[check-transcripts] JSON parse error in ${metaPath}: ${err.message}`);
    results.missingTranscript.push({ moduleDir, reason: `parse error: ${err.message}` });
    continue;
  }

  const hasVideoId = Boolean(meta.videoId);
  const transcriptUrl = meta.transcriptUrl;
  const captions = Array.isArray(meta.videoCaptions) ? meta.videoCaptions : [];

  if (transcriptUrl) {
    const onDisk = resolvePublic(transcriptUrl);
    if (!onDisk || !fs.existsSync(onDisk)) {
      results.missingTranscript.push({ moduleDir, transcriptUrl, onDisk });
    } else {
      // Size + cue-count lower-bound check (catches empty / truncated replacements).
      const stats = fs.statSync(onDisk);
      const contents = fs.readFileSync(onDisk, "utf-8");
      const cueCount = countVttCues(contents);
      if (stats.size < MIN_BYTES || cueCount < MIN_CUES) {
        results.tooSmall.push({
          moduleDir,
          transcriptUrl,
          bytes: stats.size,
          cues: cueCount,
        });
      }
      results.ok.push({ moduleDir, transcriptUrl, bytes: stats.size, cues: cueCount });
    }
  } else if (hasVideoId) {
    results.noTranscriptUrl.push({ moduleDir, videoId: meta.videoId });
  }

  for (const cap of captions) {
    if (!cap || !cap.src) continue;
    const onDisk = resolvePublic(cap.src);
    if (!onDisk || !fs.existsSync(onDisk)) {
      results.missingCaption.push({ moduleDir, src: cap.src, onDisk });
    }
  }
}

// Report
const pad = (n) => String(n).padStart(2, " ");
console.log(`\n[check-transcripts] scanned ${results.checked} module(s)\n`);

console.log(`  ✅ transcripts present : ${pad(results.ok.length)}`);
console.log(`  ❌ transcripts missing : ${pad(results.missingTranscript.length)}`);
console.log(`  ⚠️  videoId w/o transcriptUrl : ${pad(results.noTranscriptUrl.length)}`);
console.log(`  ⚠️  videoCaptions missing file : ${pad(results.missingCaption.length)}`);
console.log(`  ⚠️  transcripts below lower bound (< ${MIN_CUES} cues or < ${MIN_BYTES} B) : ${pad(results.tooSmall.length)}\n`);

if (results.ok.length) {
  console.log("  Present:");
  for (const r of results.ok) {
    console.log(
      `    • ${r.moduleDir} → ${r.transcriptUrl}  (${r.cues} cues, ${r.bytes} B)`
    );
  }
  console.log();
}
if (results.missingTranscript.length) {
  console.log("  MISSING (hard error):");
  for (const r of results.missingTranscript) {
    console.log(`    ✗ ${r.moduleDir} → ${r.transcriptUrl || r.reason}`);
  }
  console.log();
}
if (results.noTranscriptUrl.length) {
  console.log("  videoId without transcriptUrl:");
  for (const r of results.noTranscriptUrl) {
    console.log(`    • ${r.moduleDir} (videoId=${r.videoId})`);
  }
  console.log();
}
if (results.missingCaption.length) {
  console.log("  videoCaptions[].src without file on disk:");
  for (const r of results.missingCaption) {
    console.log(`    • ${r.moduleDir} → ${r.src}`);
  }
  console.log();
}
if (results.tooSmall.length) {
  console.log(
    `  Transcripts below lower bound (need ≥ ${MIN_CUES} cues and ≥ ${MIN_BYTES} B):`
  );
  for (const r of results.tooSmall) {
    console.log(
      `    • ${r.moduleDir} → ${r.transcriptUrl}  (${r.cues} cues, ${r.bytes} B)`
    );
  }
  console.log();
}

const hardFail = results.missingTranscript.length > 0;
const softFail =
  results.noTranscriptUrl.length > 0 ||
  results.missingCaption.length > 0 ||
  results.tooSmall.length > 0;

if (hardFail || (STRICT && softFail)) {
  process.exit(1);
}
process.exit(0);
