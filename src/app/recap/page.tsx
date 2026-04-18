"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProgressStore } from "@/stores/progressStore";
import { modules } from "@/lib/modules";
import type { QuizQuestionAttempt } from "@/types/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModuleMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  color: string;
  icon: string;
  keyTakeaways?: string[];
}

interface RecapModuleData {
  meta: ModuleMeta;
  completedAt: string;    // ISO of best guess
  labsCount: number;
  totalLabMinutes: number;
  avgQuizScore: number | null;
  quizAttemptCount: number;
  hardestQuestions: { questionText: string; correctRate: number }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function totalLabMinutes(attempts: { startedAt: string; completedAt?: string }[]): number {
  let ms = 0;
  for (const a of attempts) {
    if (a.completedAt) {
      ms += new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime();
    }
  }
  return Math.round(ms / 60000);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Aggregate per-question stats from the user's attempts
// ---------------------------------------------------------------------------

interface QStat {
  questionId: string;
  total: number;
  correct: number;
  correctRate: number;
}

function aggregateQStats(attempts: QuizQuestionAttempt[]): Map<string, QStat> {
  const map = new Map<string, QStat>();
  for (const a of attempts) {
    const s = map.get(a.questionId) ?? {
      questionId: a.questionId,
      total: 0,
      correct: 0,
      correctRate: 0,
    };
    s.total += 1;
    if (a.isCorrect) s.correct += 1;
    map.set(a.questionId, s);
  }
  for (const s of map.values()) {
    s.correctRate = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RecapPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [modulesMeta, setModulesMeta] = useState<ModuleMeta[]>([]);
  const [quizQuestionTexts, setQuizQuestionTexts] = useState<
    Map<string, Map<string, string>>
  >(new Map()); // moduleId -> questionId -> text

  const progressModules = useProgressStore((s) => s.modules);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Load all _meta.json files including keyTakeaways
  useEffect(() => {
    fetch("/api/module-meta")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ModuleMeta[]) => setModulesMeta(data))
      .catch(() => {});
  }, []);

  // Load quiz question texts for modules the user has attempted
  useEffect(() => {
    if (!hasMounted) return;
    const modulesWithQuizAttempts = modules.filter(
      (m) => (progressModules[m.id]?.quizQuestionAttempts?.length ?? 0) > 0
    );
    Promise.all(
      modulesWithQuizAttempts.map((m) =>
        fetch(`/api/module-quiz?moduleId=${m.id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => ({ moduleId: m.id, questions: data?.questions ?? [] }))
          .catch(() => ({ moduleId: m.id, questions: [] }))
      )
    ).then((results) => {
      const map = new Map<string, Map<string, string>>();
      for (const { moduleId, questions } of results) {
        const qMap = new Map<string, string>();
        for (const q of questions) {
          qMap.set(q.id, q.question);
        }
        map.set(moduleId, qMap);
      }
      setQuizQuestionTexts(map);
    });
  }, [hasMounted, progressModules]);

  // Determine which modules are complete
  const completedModuleData: RecapModuleData[] = [];
  for (const mod of modules) {
    const progress = progressModules[mod.id];
    if (!progress) continue;

    const totalLabs = mod.labCount;
    const videoOk = progress.videoWatchedPercent >= 90 || !!progress.videoFinishedAt;
    const theoryOk = progress.theoryRead;
    const labsOk = totalLabs === 0 || progress.labsCompleted.length >= totalLabs;
    const quizOk = progress.quizPassed;
    const isComplete = videoOk && theoryOk && labsOk && quizOk;

    if (!isComplete) continue;

    // Best-guess completion date: latest of quiz lastAccessed or last labAttempt completedAt
    const dates: string[] = [];
    if (progress.lastAccessed) dates.push(progress.lastAccessed);
    for (const a of progress.labAttempts ?? []) {
      if (a.completedAt) dates.push(a.completedAt);
    }
    const completedAt = dates.sort().pop() ?? "";

    // Hardest questions
    const qAttempts = progress.quizQuestionAttempts ?? [];
    const qStats = aggregateQStats(qAttempts);
    const qTextMap = quizQuestionTexts.get(mod.id) ?? new Map<string, string>();
    const hardest = Array.from(qStats.values())
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 3)
      .map((s) => ({
        questionText: qTextMap.get(s.questionId) ?? s.questionId,
        correctRate: s.correctRate,
      }));

    const metaFromApi = modulesMeta.find((m) => m.id === mod.id);

    completedModuleData.push({
      meta: metaFromApi ?? {
        id: mod.id,
        number: mod.number,
        title: mod.title,
        shortTitle: mod.shortTitle,
        color: mod.color,
        icon: mod.icon,
        keyTakeaways: [],
      },
      completedAt,
      labsCount: progress.labsCompleted.length,
      totalLabMinutes: totalLabMinutes(progress.labAttempts ?? []),
      avgQuizScore: progress.quizScore,
      quizAttemptCount: progress.quizAttempts ?? 0,
      hardestQuestions: hardest,
    });
  }

  // Loading skeleton
  if (!hasMounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface-1 rounded" />
          <div className="h-64 bg-surface-1 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neon-cyan">
          Your Learning Journey
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mt-2 mb-3">
          What You&apos;ve Learned
        </h1>
        <p className="text-text-secondary">
          A recap of every module you&apos;ve completed — key takeaways, your hardest questions, and
          time invested.
        </p>
      </div>

      {completedModuleData.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-white/[0.06] bg-surface-1/20 p-16 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-3">
            Complete your first module to see your recap here
          </h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            Watch the video, read the theory, finish the labs, and pass the quiz — then
            come back and see what you&apos;ve learned.
          </p>
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-colors"
          >
            Browse Modules
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {completedModuleData.map((data) => (
            <RecapCard key={data.meta.id} data={data} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecapCard
// ---------------------------------------------------------------------------

function RecapCard({ data }: { data: RecapModuleData }) {
  const { meta, completedAt, labsCount, totalLabMinutes, avgQuizScore, quizAttemptCount, hardestQuestions } = data;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-1/20 overflow-hidden">
      {/* Card header */}
      <div
        className="px-6 py-4 border-b border-white/[0.06]"
        style={{ borderLeftWidth: 3, borderLeftColor: meta.color, borderLeftStyle: "solid" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <div className="text-xs font-mono text-text-muted uppercase tracking-wider">
                Module {meta.number}
              </div>
              <h2 className="font-heading font-semibold text-text-primary text-lg leading-tight">
                {meta.title}
              </h2>
            </div>
          </div>
          {completedAt && (
            <div className="shrink-0 text-right">
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Completed</div>
              <div className="text-sm text-emerald-400 font-medium">{formatDate(completedAt)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatTile
            label="Labs done"
            value={String(labsCount)}
            color={meta.color}
          />
          <StatTile
            label="Lab time"
            value={totalLabMinutes > 0 ? `${totalLabMinutes}m` : "—"}
            color={meta.color}
          />
          <StatTile
            label={quizAttemptCount > 1 ? `Quiz (${quizAttemptCount} tries)` : "Quiz score"}
            value={avgQuizScore !== null ? `${avgQuizScore}` : "—"}
            color={meta.color}
          />
        </div>

        {/* Key takeaways */}
        {meta.keyTakeaways && meta.keyTakeaways.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted mb-3">
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {meta.keyTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span
                    className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: meta.color }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hardest questions */}
        {hardestQuestions.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted mb-3">
              Your Hardest Questions
            </h3>
            <div className="space-y-2">
              {hardestQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-surface-1/30 px-3 py-2.5"
                >
                  <span className="shrink-0 mt-0.5 text-xs font-bold text-rose-400">#{i + 1}</span>
                  <p className="text-sm text-text-secondary flex-1 leading-snug">{q.questionText}</p>
                  <span className="shrink-0 text-xs font-mono text-rose-400">
                    {q.correctRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to analytics */}
        <div className="pt-2 border-t border-white/[0.04]">
          <Link
            href={`/modules/${meta.id}/analytics`}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
            style={{ color: meta.color }}
          >
            View detailed analytics →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-surface-1/20 p-3 text-center">
      <div className="text-xl font-bold font-heading" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-text-muted mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
