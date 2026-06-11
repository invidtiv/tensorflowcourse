"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { modules } from "@/lib/modules";
import chaptersIndex from "@/lib/chapters.generated.json";

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/20 text-success",
  intermediate: "bg-warning/20 text-warning",
  advanced: "bg-error/20 text-error",
};

const chaptersByModule = chaptersIndex as Record<string, { title: string; slug: string }[]>;

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isModulePage = pathname.startsWith("/modules/");
  const segments = pathname.split("/");
  const currentModuleId = segments[2] || "";

  // Which modules are expanded to show their chapters. The active module starts
  // expanded; navigating to another module expands that one too (user toggles kept).
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(currentModuleId ? [currentModuleId] : []),
  );
  useEffect(() => {
    if (currentModuleId) {
      setExpanded((prev) => (prev.has(currentModuleId) ? prev : new Set(prev).add(currentModuleId)));
    }
  }, [currentModuleId]);

  if (!isModulePage) return null;

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-16 bottom-0 z-40 hidden lg:flex flex-col glass border-r border-white/[0.06] overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-b border-white/[0.06] text-text-secondary hover:text-neon-cyan hover:bg-surface-1 transition-colors shrink-0"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* Module list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {modules.map((mod) => {
          const isActive = currentModuleId === mod.id;
          const chapters = chaptersByModule[mod.id] ?? [];
          const isOpen = expanded.has(mod.id);
          const hasChapters = chapters.length > 0;

          return (
            <div key={mod.id}>
              <div
                className={`flex items-center rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-1 border border-transparent"
                }`}
              >
                <Link
                  href={`/modules/${mod.id}`}
                  className={`flex items-center gap-3 min-w-0 flex-1 ${collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"}`}
                  title={collapsed ? mod.title : undefined}
                >
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isActive ? "bg-neon-cyan/20 text-neon-cyan" : "bg-surface-2 text-text-muted group-hover:text-text-secondary"
                    }`}
                    style={isActive ? { borderColor: mod.color, borderWidth: 2 } : {}}
                  >
                    {mod.number}
                  </div>

                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{mod.shortTitle}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${difficultyColors[mod.difficulty]}`}>
                          {mod.difficulty}
                        </span>
                        <span className="text-[10px] text-text-muted">{mod.labCount} labs</span>
                      </div>
                    </div>
                  )}
                </Link>

                {/* Chapter expand caret */}
                {!collapsed && hasChapters && (
                  <button
                    onClick={() => toggle(mod.id)}
                    aria-label={isOpen ? `Collapse ${mod.shortTitle} chapters` : `Expand ${mod.shortTitle} chapters`}
                    aria-expanded={isOpen}
                    className="shrink-0 p-2 mr-1 rounded-md text-text-muted hover:text-neon-cyan hover:bg-white/[0.05] transition-colors"
                  >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Chapter sub-items */}
              <AnimatePresence initial={false}>
                {!collapsed && isOpen && hasChapters && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-5 mt-0.5 mb-1 border-l border-white/[0.08] overflow-hidden"
                  >
                    {chapters.map((ch, i) => (
                      <li key={ch.slug}>
                        <Link
                          href={`/modules/${mod.id}/theory#${ch.slug}`}
                          className="flex items-start gap-2 pl-3 pr-2 py-1.5 text-xs text-text-muted hover:text-neon-cyan hover:bg-white/[0.03] transition-colors -ml-px border-l border-transparent hover:border-neon-cyan/40"
                          title={ch.title}
                        >
                          <span className="text-text-muted/50 tabular-nums shrink-0">{i + 1}.</span>
                          <span className="line-clamp-2 leading-snug">{ch.title}</span>
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer hint (only when expanded) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-white/[0.06] text-[11px] text-text-muted"
          >
            10 modules &middot; 80+ labs
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
