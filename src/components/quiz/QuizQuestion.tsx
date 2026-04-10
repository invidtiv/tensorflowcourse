"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import Button from "@/components/ui/Button";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedOption: number | null;
  showExplanation: boolean;
  isCorrect: boolean | null;
  isLast: boolean;
  accentColor?: string;
  onSelect: (optionIndex: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

const difficultyStyles: Record<"easy" | "medium" | "hard", string> = {
  easy: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  hard: "bg-error/10 text-error border-error/30",
};

/**
 * Renders a single quiz question with its code snippet (if any),
 * answer options, submit-then-explanation flow, and a Next / Finish CTA.
 */
export default function QuizQuestion({
  question,
  selectedOption,
  showExplanation,
  isCorrect,
  isLast,
  accentColor = "#00d4ff",
  onSelect,
  onSubmit,
  onNext,
}: QuizQuestionProps) {
  const canSubmit = selectedOption !== null && !showExplanation;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-surface-1/40 backdrop-blur-sm p-6 sm:p-8"
    >
      {/* Question metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${difficultyStyles[question.difficulty]}`}
        >
          {question.difficulty}
        </span>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-white/[0.08] text-text-muted">
          {question.topic}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted/60">
          {question.type.replace("-", " ")}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg sm:text-xl font-heading font-semibold text-text-primary leading-relaxed mb-4">
        {question.question}
      </h2>

      {/* Optional code snippet */}
      {question.code && (
        <div className="my-4 rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-2/50 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-2 text-text-muted font-mono uppercase">
              python
            </span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-code text-text-primary">
            <code>{question.code}</code>
          </pre>
        </div>
      )}

      {/* Options */}
      <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isThisCorrect = option.correct;
          let stateClasses = "border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]";

          if (showExplanation) {
            if (isThisCorrect) {
              stateClasses =
                "border-success/60 bg-success/[0.08] ring-1 ring-success/40";
            } else if (isSelected && !isThisCorrect) {
              stateClasses = "border-error/60 bg-error/[0.08] ring-1 ring-error/40";
            } else {
              stateClasses = "border-white/[0.06] opacity-60";
            }
          } else if (isSelected) {
            stateClasses = "border-neon-cyan/60 bg-neon-cyan/[0.06] ring-1 ring-neon-cyan/40";
          }

          return (
            <motion.button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={showExplanation}
              onClick={() => onSelect(idx)}
              whileHover={showExplanation ? {} : { x: 2 }}
              animate={
                showExplanation && isSelected && !isThisCorrect
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : showExplanation && isThisCorrect
                    ? { scale: [1, 1.015, 1] }
                    : { x: 0, scale: 1 }
              }
              transition={{ duration: 0.35 }}
              className={`w-full text-left rounded-xl border px-4 py-3 flex items-start gap-3 transition-colors ${stateClasses} ${
                showExplanation ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-semibold ${
                  isSelected
                    ? "border-neon-cyan text-neon-cyan"
                    : "border-white/20 text-text-muted"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-text-primary text-sm sm:text-base leading-relaxed flex-1">
                {option.text}
              </span>
              {showExplanation && isThisCorrect && (
                <span className="text-success text-lg leading-none" aria-label="correct">
                  ✓
                </span>
              )}
              {showExplanation && isSelected && !isThisCorrect && (
                <span className="text-error text-lg leading-none" aria-label="incorrect">
                  ✕
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence mode="wait">
        {showExplanation && (
          <motion.div
            key="explanation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-6 rounded-xl border px-4 py-3 ${
                isCorrect
                  ? "border-success/40 bg-success/[0.05]"
                  : "border-error/40 bg-error/[0.05]"
              }`}
            >
              <div
                className={`text-[11px] font-mono font-semibold uppercase tracking-wider mb-1 ${
                  isCorrect ? "text-success" : "text-error"
                }`}
              >
                {isCorrect ? "Correct" : "Not quite"}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {!showExplanation ? (
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={
              canSubmit
                ? {
                    boxShadow: `0 0 18px ${accentColor}33`,
                  }
                : undefined
            }
          >
            Submit Answer
          </Button>
        ) : (
          <Button variant="primary" onClick={onNext}>
            {isLast ? "Finish Quiz" : "Next Question"}
            <span className="ml-1">→</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
