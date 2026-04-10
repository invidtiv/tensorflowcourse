"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface QuizResultProps {
  moduleId: string;
  questions: QuizQuestionType[];
  answers: Record<string, number>;
  correct: number;
  total: number;
  passingScore: number;
  onRetry: () => void;
}

/**
 * Final score screen shown after the last question.
 * Shows a ring-style percentage, pass / fail banner, per-question breakdown,
 * and CTAs to retry or continue to the next module.
 */
export default function QuizResult({
  moduleId,
  questions,
  answers,
  correct,
  total,
  passingScore,
  onRetry,
}: QuizResultProps) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.round((correct / safeTotal) * 100);
  const passed = percent >= passingScore;

  // SVG ring math
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/[0.08] bg-surface-1/40 backdrop-blur-sm p-6 sm:p-10"
    >
      {/* Headline */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        {/* Ring */}
        <div className="relative w-[140px] h-[140px] shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={passed ? "#10b981" : "#ef4444"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 10px ${passed ? "#10b98166" : "#ef444466"})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-heading font-bold text-text-primary">{percent}%</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
              {correct} / {total}
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="flex-1 text-center sm:text-left">
          <div
            className={`inline-block text-[11px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ${
              passed
                ? "border-success/40 bg-success/10 text-success"
                : "border-error/40 bg-error/10 text-error"
            }`}
          >
            {passed ? "Passed" : "Not yet"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
            {passed ? "Nice work." : "Keep going."}
          </h2>
          <p className="text-text-muted text-sm leading-relaxed max-w-md">
            {passed
              ? `You scored above the ${passingScore}% passing threshold. Your progress has been saved.`
              : `You need at least ${passingScore}% to pass. Review the explanations below, revisit the theory, then try again.`}
          </p>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="mt-8 border-t border-white/[0.06] pt-6">
        <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted mb-3">
          Breakdown
        </h3>
        <ol className="space-y-3">
          {questions.map((q, idx) => {
            const answerIdx = answers[q.id];
            const answered = answerIdx !== undefined;
            const wasCorrect = answered && q.options[answerIdx]?.correct === true;
            const correctIdx = q.options.findIndex((o) => o.correct);

            return (
              <li
                key={q.id}
                className={`rounded-xl border px-4 py-3 ${
                  wasCorrect
                    ? "border-success/30 bg-success/[0.04]"
                    : "border-error/30 bg-error/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold ${
                      wasCorrect
                        ? "bg-success/20 text-success"
                        : "bg-error/20 text-error"
                    }`}
                    aria-hidden="true"
                  >
                    {wasCorrect ? "✓" : "✕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Q{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted/70">
                        {q.topic}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary leading-snug mb-1">{q.question}</p>
                    {!wasCorrect && correctIdx >= 0 && (
                      <p className="text-xs text-text-muted leading-relaxed">
                        <span className="text-success font-semibold">Correct: </span>
                        {q.options[correctIdx].text}
                      </p>
                    )}
                    {!wasCorrect && (
                      <p className="text-xs text-text-muted leading-relaxed mt-1">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
        <Link
          href={`/modules/${moduleId}/theory`}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          ← Back to theory
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onRetry}>
            Retry quiz
          </Button>
          <Button variant="primary" href="/modules">
            All modules
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
