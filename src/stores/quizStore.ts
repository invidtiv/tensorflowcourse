"use client";

import { create } from "zustand";
import type { QuizQuestion, QuizAttempt } from "@/types/quiz";

interface QuizStore {
  // Current quiz state
  currentModuleId: string | null;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, number>;
  showResult: boolean;
  showExplanation: boolean;
  selectedOption: number | null;
  isCorrect: boolean | null;

  // Actions
  startQuiz: (moduleId: string, questions: QuizQuestion[]) => void;
  selectOption: (optionIndex: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  finishQuiz: () => QuizAttempt;
  resetQuiz: () => void;

  // Computed
  getScore: () => { correct: number; total: number; percentage: number };
  isComplete: () => boolean;
}

export const useQuizStore = create<QuizStore>()((set, get) => ({
  currentModuleId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  showResult: false,
  showExplanation: false,
  selectedOption: null,
  isCorrect: null,

  startQuiz: (moduleId, questions) =>
    set({
      currentModuleId: moduleId,
      questions,
      currentIndex: 0,
      answers: {},
      showResult: false,
      showExplanation: false,
      selectedOption: null,
      isCorrect: null,
    }),

  selectOption: (optionIndex) =>
    set({ selectedOption: optionIndex }),

  submitAnswer: () => {
    const { questions, currentIndex, selectedOption, answers } = get();
    if (selectedOption === null) return;
    const question = questions[currentIndex];
    const correct = question.options[selectedOption]?.correct ?? false;
    set({
      answers: { ...answers, [question.id]: selectedOption },
      showExplanation: true,
      isCorrect: correct,
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        showExplanation: false,
        selectedOption: null,
        isCorrect: null,
      });
    } else {
      set({ showResult: true });
    }
  },

  finishQuiz: () => {
    const { currentModuleId, questions, answers } = get();
    let correct = 0;
    questions.forEach((q) => {
      const answerIdx = answers[q.id];
      if (answerIdx !== undefined && q.options[answerIdx]?.correct) {
        correct++;
      }
    });
    return {
      moduleId: currentModuleId || "",
      answers,
      score: correct,
      total: questions.length,
      passed: (correct / questions.length) * 100 >= 70,
      completedAt: new Date().toISOString(),
    };
  },

  resetQuiz: () =>
    set({
      currentModuleId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      showResult: false,
      showExplanation: false,
      selectedOption: null,
      isCorrect: null,
    }),

  getScore: () => {
    const { questions, answers } = get();
    let correct = 0;
    questions.forEach((q) => {
      const answerIdx = answers[q.id];
      if (answerIdx !== undefined && q.options[answerIdx]?.correct) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  },

  isComplete: () => {
    const { questions, answers } = get();
    return questions.length > 0 && Object.keys(answers).length === questions.length;
  },
}));
