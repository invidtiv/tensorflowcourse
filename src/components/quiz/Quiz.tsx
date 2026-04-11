"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/stores/quizStore";
import { useProgressStore } from "@/stores/progressStore";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import QuizProgress from "./QuizProgress";
import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";

interface QuizProps {
  moduleId: string;
  questions: QuizQuestionType[];
  passingScore: number;
  accentColor?: string;
}

/**
 * Top-level quiz wrapper. Seeds the zustand store with the module's question
 * set and drives the question → explanation → next → result flow.
 *
 * All state lives in `useQuizStore` so navigating away and coming back resets
 * naturally (startQuiz is called on mount / moduleId change), and so the
 * store's existing selectOption / submitAnswer / nextQuestion actions are the
 * single source of truth for the flow.
 */
export default function Quiz({ moduleId, questions, passingScore, accentColor = "#00d4ff" }: QuizProps) {
  const {
    currentModuleId,
    questions: storeQuestions,
    currentIndex,
    answers,
    showResult,
    showExplanation,
    selectedOption,
    isCorrect,
    startQuiz,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuizStore();

  const setQuizScore = useProgressStore((s) => s.setQuizScore);

  // (Re)seed the store whenever the route or source data changes.
  useEffect(() => {
    startQuiz(moduleId, questions, passingScore);
    return () => {
      // Clear when unmounting so the next module starts fresh.
      resetQuiz();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, questions, passingScore]);

  // Compute current state from the store's snapshot.
  const active = currentModuleId === moduleId && storeQuestions.length === questions.length;
  const total = questions.length;

  const { correct, answeredCount } = useMemo(() => {
    let c = 0;
    let a = 0;
    for (const q of questions) {
      const idx = answers[q.id];
      if (idx !== undefined) {
        a += 1;
        if (q.options[idx]?.correct) c += 1;
      }
    }
    return { correct: c, answeredCount: a };
  }, [answers, questions]);

  // Persist the score as soon as the result screen is shown, once per attempt.
  useEffect(() => {
    if (showResult && active) {
      setQuizScore(moduleId, correct, total, passingScore);
    }
  }, [showResult, active, moduleId, correct, total, passingScore, setQuizScore]);

  // Seeding still in flight — render a small placeholder to avoid a flash of
  // stale store content from a previous module.
  if (!active) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-surface-1/30 p-10 text-center">
        <div className="text-text-muted text-sm">Loading quiz…</div>
      </div>
    );
  }

  if (showResult) {
    return (
      <QuizResult
        moduleId={moduleId}
        questions={questions}
        answers={answers}
        correct={correct}
        total={total}
        passingScore={passingScore}
        onRetry={() => startQuiz(moduleId, questions, passingScore)}
      />
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  return (
    <div>
      <QuizProgress
        current={currentIndex}
        total={total}
        answered={answeredCount}
        accentColor={accentColor}
      />
      <AnimatePresence mode="wait">
        <QuizQuestion
          key={current.id}
          question={current}
          selectedOption={selectedOption}
          showExplanation={showExplanation}
          isCorrect={isCorrect}
          isLast={currentIndex === total - 1}
          accentColor={accentColor}
          onSelect={selectOption}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
        />
      </AnimatePresence>
    </div>
  );
}
