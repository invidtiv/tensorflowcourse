"use client";

/**
 * CompletionBadge
 *
 * Celebratory badge shown on the module overview page when all four
 * completion signals are met: video watched (≥90%), theory read,
 * all labs done, quiz passed.
 *
 * Uses AnimatePresence for a pop-in animation. Reads the gate from
 * isModuleComplete() in progressStore.
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgressStore } from "@/stores/progressStore";

interface Props {
  moduleId: string;
  totalLabs: number;
}

export default function CompletionBadge({ moduleId, totalLabs }: Props) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  const isComplete = useProgressStore((s) =>
    s.isModuleComplete(moduleId, totalLabs),
  );

  if (!hasMounted) return null;

  return (
    <AnimatePresence>
      {isComplete && (
        <motion.div
          key="badge"
          initial={{ scale: 0.5, opacity: 0, y: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400 shadow-lg shadow-emerald-500/10"
          role="status"
          aria-label="Module completed"
        >
          <span className="text-base">🏆</span>
          <span>Module Complete</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
