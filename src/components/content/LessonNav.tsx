"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LessonNavProps {
  prev?: { href: string; label: string } | null;
  next?: { href: string; label: string } | null;
}

export default function LessonNav({ prev, next }: LessonNavProps) {
  return (
    <nav className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-white/[0.06]">
      {prev ? (
        <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
          <Link
            href={prev.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl glass glass-hover transition-all max-w-[45%]"
          >
            <svg
              className="w-5 h-5 text-text-muted group-hover:text-neon-cyan transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-text-muted">
                Previous
              </div>
              <div className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                {prev.label}
              </div>
            </div>
          </Link>
        </motion.div>
      ) : (
        <div />
      )}

      {next ? (
        <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
          <Link
            href={next.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl glass glass-hover transition-all max-w-[45%] text-right"
          >
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-text-muted">
                Next
              </div>
              <div className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors truncate">
                {next.label}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-text-muted group-hover:text-neon-cyan transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      ) : (
        <div />
      )}
    </nav>
  );
}
