"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getModule } from "@/lib/modules";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/Button";
import { useProgressStore } from "@/stores/progressStore";
import type { LabAttempt, QuizQuestionAttempt } from "@/types/progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(startIso: string, endIso?: string): string {
  if (!endIso) return "in progress";
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (diffMs < 0) return "–";
  const totalSec = Math.round(diffMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTime(iso: string): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

// Group lab attempts by calendar date (using startedAt)
function groupByDate(attempts: LabAttempt[]): Map<string, LabAttempt[]> {
  const map = new Map<string, LabAttempt[]>();
  for (const a of attempts) {
    const key = formatDate(a.startedAt);
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return map;
}

// Total lab time in minutes
function totalLabMinutes(attempts: LabAttempt[]): number {
  let ms = 0;
  for (const a of attempts) {
    if (a.completedAt) {
      ms += new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime();
    }
  }
  return Math.round(ms / 60000);
}

// Per-question aggregation across all attempts
interface QuestionStats {
  questionId: string;
  questionText: string;
  total: number;
  correct: number;
  correctRate: number; // 0–100
  choiceDistribution: number[]; // count per choice index
  correctIndex: number;
}

function aggregateQuestionStats(
  attempts: QuizQuestionAttempt[],
  questions: Array<{ id: string; question: string; options: Array<{ text: string; correct: boolean }> }>
): QuestionStats[] {
  const statsMap = new Map<string, QuestionStats>();

  // Seed with all known questions
  for (const q of questions) {
    const correctIdx = q.options.findIndex((o) => o.correct);
    statsMap.set(q.id, {
      questionId: q.id,
      questionText: q.question,
      total: 0,
      correct: 0,
      correctRate: 0,
      choiceDistribution: new Array(q.options.length).fill(0),
      correctIndex: correctIdx === -1 ? 0 : correctIdx,
    });
  }

  for (const a of attempts) {
    const s = statsMap.get(a.questionId);
    if (!s) continue;
    s.total += 1;
    if (a.isCorrect) s.correct += 1;
    if (a.choiceIndex >= 0 && a.choiceIndex < s.choiceDistribution.length) {
      s.choiceDistribution[a.choiceIndex] += 1;
    }
  }

  // Compute rate
  for (const s of statsMap.values()) {
    s.correctRate = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  }

  return Array.from(statsMap.values()).sort((a, b) => a.correctRate - b.correctRate);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const mod = getModule(moduleId);

  const moduleProgress = useProgressStore((s) => s.modules[moduleId]);
  // Also pull quiz data from store for per-question enrichment
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{ id: string; question: string; options: Array<{ text: string; correct: boolean }> }>
  >([]);

  // Load quiz JSON on client (content API is server-side; we fetch the static file)
  useEffect(() => {
    fetch(`/api/module-quiz?moduleId=${moduleId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.questions) setQuizQuestions(data.questions);
      })
      .catch(() => {});
  }, [moduleId]);

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">Module not found</h1>
        <Button href="/modules">Back to Modules</Button>
      </div>
    );
  }

  if (!hasMounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse h-8 w-48 bg-surface-1 rounded mb-4" />
        <div className="animate-pulse h-64 bg-surface-1 rounded" />
      </div>
    );
  }

  const labAttempts: LabAttempt[] = moduleProgress?.labAttempts ?? [];
  const quizQAttempts: QuizQuestionAttempt[] = moduleProgress?.quizQuestionAttempts ?? [];
  const totalMinutes = totalLabMinutes(labAttempts);
  const avgQuizScore = moduleProgress?.quizScore ?? null;
  const quizAttemptCount = moduleProgress?.quizAttempts ?? 0;
  const quizPassed = moduleProgress?.quizPassed ?? false;

  const grouped = groupByDate(labAttempts);
  const questionStats = aggregateQuestionStats(quizQAttempts, quizQuestions);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Modules", href: "/modules" },
          { label: `Module ${mod.number}`, href: `/modules/${moduleId}` },
          { label: "Analytics" },
        ]}
      />

      <div className="mt-8 mb-8">
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider"
          style={{ color: mod.color }}
        >
          Module {mod.number} — Analytics
        </span>
        <h1 className="text-3xl font-heading font-bold text-text-primary mt-2 mb-2">
          {mod.shortTitle} — Your Progress Breakdown
        </h1>
        <p className="text-text-muted text-sm">
          Detailed lab and quiz analytics for this module.
        </p>
      </div>

      {/* ── Summary tiles ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <SummaryTile
          label="Total lab time"
          value={totalMinutes > 0 ? `${totalMinutes}m` : "—"}
          color={mod.color}
        />
        <SummaryTile
          label="Lab attempts"
          value={labAttempts.length === 0 ? "0" : String(labAttempts.length)}
          color={mod.color}
        />
        <SummaryTile
          label="Last quiz score"
          value={avgQuizScore !== null ? `${avgQuizScore}` : "—"}
          color={mod.color}
        />
        <SummaryTile
          label={quizPassed ? "Passed on attempt" : "Quiz attempts"}
          value={
            quizPassed
              ? `#${quizAttemptCount}`
              : quizAttemptCount > 0
              ? String(quizAttemptCount)
              : "—"
          }
          color={mod.color}
        />
      </div>

      {/* ── Lab attempt history ───────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Lab Attempt History
        </h2>

        {labAttempts.length === 0 ? (
          <EmptyState message="No lab attempts recorded yet. Open any lab to start tracking." />
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([date, dateAttempts]) => (
              <div key={date}>
                <div className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">
                  {date}
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-surface-1/20 overflow-hidden">
                  {dateAttempts.map((a, i) => {
                    const isComplete = !!a.completedAt;
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-4 py-3 text-sm ${
                          i > 0 ? "border-t border-white/[0.04]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isComplete ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                            }`}
                          />
                          <span className="font-mono text-xs text-text-secondary">
                            {a.labId}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-text-muted text-xs">
                          <span>started {formatTime(a.startedAt)}</span>
                          {a.completedAt && (
                            <>
                              <span>·</span>
                              <span>completed {formatTime(a.completedAt)}</span>
                              <span>·</span>
                              <span className="text-emerald-400">
                                {formatDuration(a.startedAt, a.completedAt)}
                              </span>
                            </>
                          )}
                          {!a.completedAt && (
                            <span className="text-amber-400 italic">in progress</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Quiz question analytics ───────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-1">
          Quiz Question Breakdown
        </h2>
        <p className="text-text-muted text-sm mb-4">
          Sorted hardest first (lowest correct rate). Requires at least one quiz attempt.
        </p>

        {quizQAttempts.length === 0 ? (
          <EmptyState message="No quiz attempts recorded yet. Take the quiz to see per-question analytics." />
        ) : questionStats.length === 0 ? (
          <EmptyState message="Quiz questions data not available yet." />
        ) : (
          <div className="space-y-3">
            {questionStats.map((qs, i) => (
              <QuestionStatCard key={qs.questionId} stat={qs} rank={i + 1} accentColor={mod.color} />
            ))}
          </div>
        )}
      </section>

      {/* Back link */}
      <div className="pt-4 border-t border-white/[0.06]">
        <Link
          href={`/modules/${moduleId}`}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          ← Back to module overview
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-1/20 p-4">
      <div className="text-2xl font-bold font-heading" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-1/20 p-8 text-center">
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  );
}

function QuestionStatCard({
  stat,
  rank,
  accentColor,
}: {
  stat: QuestionStats;
  rank: number;
  accentColor: string;
}) {
  const barWidth = stat.total > 0 ? `${stat.correctRate}%` : "0%";
  const barColor =
    stat.correctRate < 40
      ? "#ef4444"
      : stat.correctRate < 70
      ? "#f59e0b"
      : "#10b981";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-1/20 p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <span
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: `${accentColor}15`, color: accentColor }}
          >
            {rank}
          </span>
          <p className="text-sm text-text-primary leading-snug">{stat.questionText}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold font-heading" style={{ color: barColor }}>
            {stat.total > 0 ? `${stat.correctRate}%` : "—"}
          </div>
          <div className="text-[10px] text-text-muted">correct rate</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: barWidth, background: barColor }}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>{stat.total} attempt{stat.total !== 1 ? "s" : ""}</span>
        <span>{stat.correct} correct / {stat.total - stat.correct} wrong</span>
      </div>

      {/* Choice distribution */}
      {stat.total > 0 && stat.choiceDistribution.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {stat.choiceDistribution.map((count, ci) => {
            const isCorrect = ci === stat.correctIndex;
            return (
              <div
                key={ci}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
                  isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/[0.06] bg-surface-1/30 text-text-muted"
                }`}
              >
                <span>Choice {ci + 1}</span>
                <span className="font-bold">{count}×</span>
                {isCorrect && <span title="correct answer">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
