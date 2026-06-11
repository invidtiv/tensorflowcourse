// Generates src/lib/chapters.generated.json: a map of moduleId -> [{ title, slug }]
// for the top-level theory sections, so the client Sidebar can render collapsible
// chapter links. Slugs are produced with github-slugger (the same library
// rehype-slug uses), processing EVERY heading in document order so duplicate-aware
// suffixes match the ids actually rendered on the theory page.
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";

const CONTENT = "content/modules";
const OUT = "src/lib/chapters.generated.json";

function stripFrontmatter(t) {
  if (t.startsWith("---")) {
    const end = t.indexOf("\n---", 3);
    if (end >= 0) return t.slice(t.indexOf("\n", end + 1) + 1);
  }
  return t;
}

// Plain-text of a heading the way rehype would see it (strip inline md markers).
function headingText(raw) {
  return raw
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

const result = {};
const dirs = fs.readdirSync(CONTENT).filter((d) => /^\d\d-/.test(d)).sort();

for (const d of dirs) {
  const file = path.join(CONTENT, d, "theory.mdx");
  if (!fs.existsSync(file)) { result[d] = []; continue; }
  const lines = stripFrontmatter(fs.readFileSync(file, "utf8")).split("\n");

  // decide chapter level: H1 if >=3 real H1s (outside code), else H2
  let inCode = false, h1 = 0;
  for (const ln of lines) {
    if (ln.trimStart().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    if (/^# .+/.test(ln)) h1++;
  }
  const chapterLevel = h1 >= 3 ? 1 : 2;

  // walk every heading in order, slug each (duplicate-aware), capture chapter ones
  const slugger = new GithubSlugger();
  inCode = false;
  const chapters = [];
  for (const ln of lines) {
    if (ln.trimStart().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = ln.match(/^(#{1,6})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    const text = headingText(m[2]);
    const slug = slugger.slug(text); // advances slugger state for ALL headings
    if (level === chapterLevel) chapters.push({ title: text, slug });
  }
  result[d] = chapters;
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
const counts = Object.entries(result).map(([k, v]) => `${k.slice(0, 2)}:${v.length}`).join(" ");
console.log(`build-chapters-index: wrote ${OUT}`);
console.log(`  chapters per module -> ${counts}`);
