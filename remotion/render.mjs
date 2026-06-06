// Cross-platform renderer (Windows/macOS/Linux). Bundles once, then renders
// one or more module compositions. Usage:
//   node render.mjs            -> renders all 10 modules
//   node render.mjs 1          -> renders module-01
//   node render.mjs 1 5 10     -> renders module-01, 05, 10
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "public");
const outDir = path.join(__dirname, "out");
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const ids = (args.length ? args : Array.from({ length: 10 }, (_, i) => i + 1)).map(
  (n) => `module-${String(n).padStart(2, "0")}`
);

console.log("Ensuring headless browser is available (first run downloads it)...");
await ensureBrowser();

console.log("Bundling Remotion project...");
const serveUrl = await bundle({
  entryPoint: path.join(__dirname, "src", "index.ts"),
  publicDir,
  onProgress: () => {},
});

const failed = [];
for (const id of ids) {
  try {
    const composition = await selectComposition({ serveUrl, id });
    const outputLocation = path.join(outDir, `${id}.mp4`);
    console.log(
      `\nRendering ${id}  (${composition.durationInFrames} frames @ ${composition.fps}fps) -> ${outputLocation}`
    );
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      // Windows-friendly: a single Chrome process is far less prone to the
      // `kill EPERM` teardown race than multi-process concurrency.
      concurrency: 1,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r  ${id}: ${(progress * 100).toFixed(0)}%   `);
      },
    });
    process.stdout.write("\n");
    console.log(`  done: ${outputLocation}`);
  } catch (err) {
    process.stdout.write("\n");
    console.error(`  FAILED ${id}: ${err?.message || err}`);
    failed.push(id);
  }
}

console.log(`\nFinished. Rendered ${ids.length - failed.length}/${ids.length} -> ${outDir}`);
if (failed.length) {
  console.log(`Failed: ${failed.join(", ")}`);
  process.exitCode = 1;
}
