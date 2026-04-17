"use client";

/**
 * ContinueLearning
 *
 * "Pick up where you left off" widget for the landing page.
 *
 * Algorithm:
 *   1. Find the module with the most recent `lastAccessed` timestamp that
 *      is NOT yet fully complete.
 *   2. Determine the next action: video → theory → labs → quiz.
 *   3. Render a single card with a direct link to that action.
 *   4. If all started modules are complete, render a "Great work" variant
 *      pointing to the next unstarted module.
 *   5. If all 10 modules complete, render a celebration message.
 *   6. If no progress at all, render nothing.
 */

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "@/stores/progressStore";
import { modules } from "@/lib/modules";
import type { ModuleProgress } from "@/types/progress";

interface NextAction {
  label: string;
  href: string;
  emoji: string;
}

function getNextAction(
  moduleId: string,
  modLabCount: number,
  mp: ModuleProgress,
): NextAction {
  const videoOk =
    mp.videoWatchedPercent >= 90 || !!mp.videoFinishedAt;
  if (!videoOk)
    return {
      label: "Watch the video",
      href: `/modules/${moduleId}/theory`,
      emoji: "🎬",
    };
  if (!mp.theoryRead)
    return {
      label: "Read the theory",
      href: `/modules/${moduleId}/theory`,
      emoji: "📖",
    };
  if (mp.labsCompleted.length < modLabCount)
    return {
      label: `Continue labs (${mp.labsCompleted.length}/${modLabCount})`,
      href: `/modules/${moduleId}/labs`,
      emoji: "💻",
    };
  return {
    label: "Take the quiz",
    href: `/modules/${moduleId}/quiz`,
    emoji: "🧪",
  };
}

export default function ContinueLearning() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  const progressModules = useProgressStore((s) => s.modules);
  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);
  const getModuleCompletionPercent = useProgressStore((s) => s.getModuleCompletionPercent);

  if (!hasMounted) return null;

  // No progress at all → render nothing
  if (Object.keys(progressModules).length === 0) return null;

  // Find most-recently-accessed incomplete module
  const candidates = modules
    .filter((m) => {
      const mp = progressModules[m.id];
      return mp?.lastAccessed && !isModuleComplete(m.id, m.labCount);
    })
    .sort((a, b) => {
      const ta = progressModules[a.id]?.lastAccessed ?? "";
      const tb = progressModules[b.id]?.lastAccessed ?? "";
      return tb.localeCompare(ta); // descending
    });

  let content: React.ReactNode = null;

  if (candidates.length === 0) {
    const nextUnstarted = modules.find(
      (m) => !progressModules[m.id]?.lastAccessed,
    );

    if (!nextUnstarted) {
      // All modules complete
      content = (
        <motion.div
          key="all-done"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-xl mx-auto mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-center"
        >
          <p className="text-sm font-semibold text-emerald-400">
            🏆 You&apos;ve completed the entire course! Outstanding work.
          </p>
        </motion.div>
      );
    } else {
      // All started modules complete — point to next unstarted
      content = (
        <motion.div
          key="next-up"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-xl mx-auto mb-8"
        >
          <Link
            href={`/modules/${nextUnstarted.id}`}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-surface-1/30 px-5 py-4 hover:border-neon-cyan/30 hover:bg-surface-1/50 transition-all"
          >
            <span className="text-2xl">{nextUnstarted.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
                Next up
              </p>
              <p className="text-sm font-semibold text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                Module {nextUnstarted.number}: {nextUnstarted.title}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-text-muted group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      );
    }
  } else {
    const mod = candidates[0];
    const mp = progressModules[mod.id];
    if (mp) {
      const pct = getModuleCompletionPercent(mod.id, mod.labCount);
      const action = getNextAction(mod.id, mod.labCount, mp);
      content = (
        <motion.div
          key="resume"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-xl mx-auto mb-8"
        >
          <Link
            href={action.href}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-surface-1/30 px-5 py-4 hover:border-neon-cyan/30 hover:bg-surface-1/50 transition-all"
          >
            <span className="text-2xl">{action.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
                Continue where you left off
              </p>
              <p className="text-sm font-semibold text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                {action.label}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                Module {mod.number}: {mod.shortTitle} · {pct}% complete
              </p>
            </div>
            <svg
              className="w-4 h-4 text-text-muted group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      );
    }
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
