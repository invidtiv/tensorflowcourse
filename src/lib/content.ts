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
