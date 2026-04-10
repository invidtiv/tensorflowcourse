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

export interface QuizData {
  moduleId: string;
  title: string;
  description: string;
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
