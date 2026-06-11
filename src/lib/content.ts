import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "modules");

export function getModuleTheoryContent(moduleId: string): { content: string; frontmatter: Record<string, unknown> } | null {
  const theoryPath = path.join(CONTENT_DIR, moduleId, "theory.mdx");
  if (!fs.existsSync(theoryPath)) {
    // Fallback: try .md
    const mdPath = path.join(CONTENT_DIR, moduleId, "theory.md");
    if (!fs.existsSync(mdPath)) return null;
    const raw = fs.readFileSync(mdPath, "utf-8");
    const { content, data } = matter(raw);
    return { content, frontmatter: data };
  }
  const raw = fs.readFileSync(theoryPath, "utf-8");
  const { content, data } = matter(raw);
  return { content, frontmatter: data };
}

export interface LabListEntry {
  id: string;
  title: string;
  filename: string;
  labNumber: number;
  difficulty: "easy" | "medium" | "hard" | null;
  estimatedTime: string | null;
}

export function getModuleLabsList(moduleId: string): LabListEntry[] {
  const labsDir = path.join(CONTENT_DIR, moduleId, "labs");
  if (!fs.existsSync(labsDir)) return [];

  // Only consider files named lab-*.mdx / lab-*.md at the top of labs/.
  // This skips the _sources/ archive directory and any other stray files.
  const files = fs
    .readdirSync(labsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .filter((f) => /^lab-.*\.(mdx|md)$/.test(f));

  const entries: LabListEntry[] = files.map((filename) => {
    const filePath = path.join(labsDir, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    const id = filename.replace(/\.(mdx|md)$/, "");

    // Derive labNumber from frontmatter, falling back to the digits in the
    // filename (e.g. lab-07-first-tensorflow-model.mdx -> 7).
    let labNumber: number;
    if (typeof data.labNumber === "number") {
      labNumber = data.labNumber;
    } else if (typeof data.labNumber === "string" && !Number.isNaN(parseFloat(data.labNumber))) {
      labNumber = parseFloat(data.labNumber);
    } else {
      const match = filename.match(/^lab-(\d+)/);
      labNumber = match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    }

    const difficulty =
      data.difficulty === "easy" || data.difficulty === "medium" || data.difficulty === "hard"
        ? (data.difficulty as "easy" | "medium" | "hard")
        : null;

    return {
      id,
      title: (data.title as string) || id.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      filename,
      labNumber,
      difficulty,
      estimatedTime: typeof data.estimatedTime === "string" ? data.estimatedTime : null,
    };
  });

  // Sort by labNumber numerically, then by filename to break ties.
  entries.sort((a, b) => {
    if (a.labNumber !== b.labNumber) return a.labNumber - b.labNumber;
    return a.filename.localeCompare(b.filename);
  });

  return entries;
}

export function getLabContent(moduleId: string, labId: string): { content: string; frontmatter: Record<string, unknown> } | null {
  const labsDir = path.join(CONTENT_DIR, moduleId, "labs");
  const mdxPath = path.join(labsDir, `${labId}.mdx`);
  const mdPath = path.join(labsDir, `${labId}.md`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  return { content, frontmatter: data };
}

export interface LoadedQuiz {
  moduleId: string;
  passingScore: number;
  questions: Array<{
    id: string;
    type: "multiple-choice" | "code-comprehension" | "true-false";
    question: string;
    code?: string;
    options: Array<{ text: string; correct: boolean }>;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    topic: string;
  }>;
}

export function getModuleQuiz(moduleId: string): LoadedQuiz | null {
  const quizPath = path.join(CONTENT_DIR, moduleId, "quiz.json");
  if (!fs.existsSync(quizPath)) return null;
  try {
    const raw = fs.readFileSync(quizPath, "utf-8");
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    return {
      moduleId,
      passingScore: typeof parsed.passingScore === "number" ? parsed.passingScore : 80,
      questions,
    };
  } catch {
    return null;
  }
}

export function getAllModuleIds(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => fs.statSync(path.join(CONTENT_DIR, name)).isDirectory())
    .sort();
}

export interface TheoryChapter {
  /** Heading text of the first section in this chapter group. */
  title: string;
  /** MDX source for this chapter (one or more consecutive top-level sections). */
  content: string;
}

/**
 * Split a theory MDX body into ~`target` chapter groups for tabbed display.
 *
 * Heading structure isn't uniform across modules: some use H1 (`# Part`/`# Chapter`),
 * others only H2 (`## ...`). We detect the top level present (H1 when there are
 * several, otherwise H2 — always ignoring `#` lines inside ``` code fences), split
 * on it, producing one tab per top-level section (exact heading labels). Any
 * preamble before the first heading is folded into the first chapter.
 */
export function splitTheoryIntoChapters(content: string): TheoryChapter[] {
  const lines = content.split("\n");

  // Pass 1: count H1s that are real headings (not inside code fences).
  let inCode = false;
  let h1Count = 0;
  for (const ln of lines) {
    if (ln.trimStart().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    if (/^# .+/.test(ln)) h1Count += 1;
  }
  const level = h1Count >= 3 ? 1 : 2;
  const headingRe = level === 1 ? /^# (.+)/ : /^## (.+)/;

  // Pass 2: collect section start lines (ignoring code fences).
  inCode = false;
  const starts: { title: string; line: number }[] = [];
  lines.forEach((ln, i) => {
    if (ln.trimStart().startsWith("```")) { inCode = !inCode; return; }
    if (inCode) return;
    const m = ln.match(headingRe);
    if (m) starts.push({ title: m[1].trim(), line: i });
  });

  if (starts.length === 0) {
    return [{ title: "Overview", content: content.trim() }];
  }

  const preamble = lines.slice(0, starts[0].line).join("\n").trim();
  const sections = starts.map((s, idx) => {
    const end = idx + 1 < starts.length ? starts[idx + 1].line : lines.length;
    return { title: s.title, text: lines.slice(s.line, end).join("\n").trim() };
  });

  // One tab per top-level section, with its exact heading as the label.
  return sections.map((s, i) => ({
    title: s.title,
    content: i === 0 && preamble ? `${preamble}\n\n${s.text}` : s.text,
  }));
}
