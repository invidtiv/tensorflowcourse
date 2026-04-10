"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { modules } from "@/lib/modules";

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/20 text-success",
  intermediate: "bg-warning/20 text-warning",
  advanced: "bg-error/20 text-error",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Only show sidebar on module pages
  const isModulePage = pathname.startsWith("/modules/");
  if (!isModulePage) return null;

  // Extract current module ID from pathname
  const segments = pathname.split("/");
  const currentModuleId = segments[2] || "";

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
          const href = `/modules/${mod.id}`;

          return (
            <Link
              key={mod.id}
              href={href}
              className={`flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-1 border border-transparent"
              }`}
              title={collapsed ? mod.title : undefined}
            >
              {/* Progress dot / Module number */}
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-neon-cyan/20 text-neon-cyan"
                    : "bg-surface-2 text-text-muted group-hover:text-text-secondary"
                }`}
                style={isActive ? { borderColor: mod.color, borderWidth: 2 } : {}}
              >
                {mod.number}
              </div>

              {/* Module info (hidden when collapsed) */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-0 flex-1"
                  >
                    <div className="text-sm font-medium truncate">
                      {mod.shortTitle}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          difficultyColors[mod.difficulty]
                        }`}
                      >
                        {mod.difficulty}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {mod.labCount} labs
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
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
