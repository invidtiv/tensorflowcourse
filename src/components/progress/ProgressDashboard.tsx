"use client";

/**
 * ProgressDashboard
 *
 * Overall course progress overview. Shown on the /modules page above the
 * module grid. Collapsible — collapsed by default on first visit (no progress
 * yet) and auto-expanded once any module has been started.
 *
 * Reads from progressStore (localStorage-persisted). Zero network calls.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProgressStore } from "@/stores/progressStore";
import { modules } from "@/lib/modules";
import ProgressRing from "@/components/progress/ProgressRing";

export default function ProgressDashboard() {
  const progressModules = useProgressStore((s) => s.modules);
  const getModuleCompletionPercent = useProgressStore(
    (s) => s.getModuleCompletionPercent,
  );
  const isModuleComplete = useProgressStore((s) => s.isModuleComplete);

  const startedModules = modules.filter(
    (m) => progressModules[m.id]?.lastAccessed,
  );
  const completedModules = modules.filter((m) =>
    isModuleComplete(m.id, m.labCount),
  );

  const hasAnyProgress = startedModules.length > 0;
  const [open, setOpen] = useState(hasAnyProgress);

  if (!hasAnyProgress) return null;

  const totalMinutes = Math.round(
    Object.values(progressModules).reduce(
      (sum, m) => sum + (m.timeSpentMinutes ?? 0),
      0,
    ),
  );

  return (
    <div className="mb-10 rounded-xl border border-white/[0.08] bg-surface-1/20 overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-text-primary">
            Your Progress
          </span>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span>
              <span className="text-neon-cyan font-semibold">
                {completedModules.length}
              </span>
              /{modules.length} modules done
            </span>
            <span>·</span>
            <span>
              <span className="text-neon-cyan font-semibold">
                {startedModules.length}
              </span>{" "}
              started
            </span>
            {totalMinutes > 0 && (
              <>
                <span>·</span>
                <span>
                  <span className="text-neon-cyan font-semibold">
                    {totalMinutes}
                  </span>{" "}
                  min spent
                </span>
              </>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded rows */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modules.map((mod) => {
                const pct = getModuleCompletionPercent(mod.id, mod.labCount);
                const complete = isModuleComplete(mod.id, mod.labCount);
                const started = !!progressModules[mod.id]?.lastAccessed;
                if (!started) return null;

                const mp = progressModules[mod.id];
                const labsDone = mp?.labsCompleted?.length ?? 0;

                return (
                  <Link
                    key={mod.id}
                    href={`/modules/${mod.id}`}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <ProgressRing
                      percent={pct}
                      size={32}
                      strokeWidth={3}
                      color={complete ? "#10b981" : mod.color}
                      showLabel={false}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary truncate group-hover:text-neon-cyan transition-colors">
                          M{mod.number}: {mod.shortTitle}
                        </span>
                        {complete && (
                          <span className="shrink-0 text-[10px] text-emerald-400">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                        {mp?.theoryRead && <span>Theory ✓</span>}
                        <span>
                          {labsDone}/{mod.labCount} labs
                        </span>
                        {mp?.quizPassed && <span>Quiz ✓</span>}
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-xs font-mono"
                      style={{ color: complete ? "#10b981" : mod.color }}
                    >
                      {pct}%
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
