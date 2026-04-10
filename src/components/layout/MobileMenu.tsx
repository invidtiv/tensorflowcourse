"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { modules } from "@/lib/modules";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/modules", label: "All Modules", icon: "📚" },
  { href: "/resources", label: "Resources", icon: "📦" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

const difficultyColors: Record<string, string> = {
  beginner: "text-success",
  intermediate: "text-warning",
  advanced: "text-error",
};

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] lg:hidden flex flex-col bg-bg-secondary border-r border-white/[0.06]"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06]">
              <Link href="/" className="flex items-center gap-3" onClick={onClose}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold text-sm">
                  TF
                </div>
                <span className="font-heading font-semibold text-text-primary">
                  TensorFlow Course
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <div className="px-3 py-4 border-b border-white/[0.06]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      isActive
                        ? "text-neon-cyan bg-neon-cyan/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-1"
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Module list */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted px-3 mb-3">
                Course Modules
              </h3>
              <div className="space-y-1">
                {modules.map((mod) => {
                  const isActive = pathname.includes(mod.id);
                  return (
                    <Link
                      key={mod.id}
                      href={`/modules/${mod.id}`}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-neon-cyan/10 text-neon-cyan"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-1"
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                        style={{
                          backgroundColor: isActive ? `${mod.color}20` : "var(--surface-2)",
                          color: isActive ? mod.color : "var(--text-muted)",
                        }}
                      >
                        {mod.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{mod.shortTitle}</div>
                        <span className={`text-[10px] ${difficultyColors[mod.difficulty]}`}>
                          {mod.difficulty} &middot; {mod.labCount} labs
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] text-[11px] text-text-muted text-center">
              Free &middot; Open Source &middot; 10 Modules
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
