export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "code-comprehension" | "true-false";
  question: string;
  code?: string;
  options: QuizOption[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

/**
 * Shape of the on-disk `content/modules/<moduleId>/quiz.json` files as
 * produced by `scripts/seed-quizzes.mjs`. Only `version`, `passingScore`,
 * and `questions` are persisted; the runtime `moduleId` is inferred from
 * the directory name and attached in `getModuleQuiz` (see `LoadedQuiz`
 * in `src/lib/content.ts`).
 */
export interface QuizData {
  version: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  moduleId: string;
  answers: Record<string, number>;
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}
