"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useProgressStore } from "@/stores/progressStore";
import Button from "@/components/ui/Button";

interface QuizWatchGateProps {
  moduleId: string;
  /** When true, the quiz is hidden behind a "watch the video first" prompt
   *  unless the learner has already watched ≥90% of it (or finished it).
   *  Falsy => gate is fully bypassed (used for modules without a video yet). */
  required: boolean;
  children: ReactNode;
}

/**
 * Watch-gate for module quizzes (Phase 5b — Point 5 of the course plan).
 *
 * Behaviour:
 * - If `required` is false, renders children immediately (no gate).
 * - If `required` is true, reads `isVideoWatched(moduleId)` from the progress
 *   store. When watched, renders children. Otherwise renders a soft prompt
 *   directing the learner back to the video, plus an "I've watched it
 *   elsewhere" override that calls `markVideoFinished` and unlocks the quiz.
 *
 * The override is intentional — this is a *learning aid*, not a DRM gate.
 * The goal is to nudge linear progression and bind quiz attempts to the
 * video's spaced-content structure (hook → concept → demo per Point 5.2).
 *
 * SSR-safe: returns a neutral skeleton during hydration to avoid a flash of
 * the gated/ungated state mismatch (Zustand persist hydrates client-side).
 */
export default function QuizWatchGate({ moduleId, required, children }: QuizWatchGateProps) {
  const [hydrated, setHydrated] = useState(false);
  const watched = useProgressStore((s) => s.isVideoWatched(moduleId));
  const markVideoFinished = useProgressStore((s) => s.markVideoFinished);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!required) return <>{children}</>;

  // During SSR / before hydration, optimistically render the gate's *open*
  // state. Worst case: a fully-watched user sees a half-frame of children
  // (no harm). Better than showing a gate the user has already cleared.
  if (!hydrated) return <>{children}</>;

  if (watched) return <>{children}</>;

  return (
    <div className="p-8 rounded-xl border border-white/[0.06] bg-surface-1/30">
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0" aria-hidden="true">🎬</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-1">
            Watch the lecture video first
          </h2>
          <p className="text-sm text-text-muted mb-4">
            This module&rsquo;s quiz is gated on the video lecture so the questions
            land in the right context. Watch ≥ 90% of the video (or mark it as
            seen elsewhere) to unlock the quiz.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button href={`/modules/${moduleId}`}>Go to module overview</Button>
            <button
              type="button"
              onClick={() => markVideoFinished(moduleId)}
              className="text-xs text-text-secondary/70 hover:text-text-secondary underline underline-offset-2"
            >
              I&rsquo;ve already watched it — unlock anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
