"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getModule, getAdjacentModules } from "@/lib/modules";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function ModuleOverviewPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">Module not found</h1>
        <Button href="/modules">Back to Modules</Button>
      </div>
    );
  }

  const { prev, next } = getAdjacentModules(moduleId);
  const diffVariant = mod.difficulty === "beginner" ? "beginner" : mod.difficulty === "intermediate" ? "intermediate" : "advanced";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Modules", href: "/modules" },
          { label: `Module ${mod.number}: ${mod.shortTitle}` },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{mod.icon}</span>
            <span
              className="text-xs font-mono font-semibold uppercase tracking-wider"
              style={{ color: mod.color }}
            >
              Module {mod.number}
            </span>
            <Badge variant={diffVariant}>{mod.difficulty}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-3">
            {mod.title}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            {mod.description}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
            <span>{mod.duration}</span>
            <span>·</span>
            <span>{mod.labCount} labs</span>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="mb-8 p-6 rounded-xl border border-white/[0.06] bg-surface-1/30">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Learning Objectives
          </h2>
          <ul className="space-y-2.5">
            {mod.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: `${mod.color}15`, color: mod.color }}>
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Content Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/modules/${moduleId}/theory`}
            className="group p-5 rounded-xl border border-white/[0.06] bg-surface-1/30 hover:border-neon-cyan/30 hover:bg-surface-1/50 transition-all"
          >
            <div className="text-2xl mb-2">📖</div>
            <h3 className="font-heading font-semibold text-text-primary group-hover:text-neon-cyan transition-colors">
              Theory
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Theoretical foundations &amp; concepts
            </p>
          </Link>
          <Link
            href={`/modules/${moduleId}/labs`}
            className="group p-5 rounded-xl border border-white/[0.06] bg-surface-1/30 hover:border-neon-purple/30 hover:bg-surface-1/50 transition-all"
          >
            <div className="text-2xl mb-2">💻</div>
            <h3 className="font-heading font-semibold text-text-primary group-hover:text-neon-purple transition-colors">
              Labs
            </h3>
            <p className="text-xs text-text-muted mt-1">
              {mod.labCount} hands-on exercises
            </p>
          </Link>
          <Link
            href={`/modules/${moduleId}/quiz`}
            className="group p-5 rounded-xl border border-white/[0.06] bg-surface-1/30 hover:border-tf-orange/30 hover:bg-surface-1/50 transition-all"
          >
            <div className="text-2xl mb-2">🧪</div>
            <h3 className="font-heading font-semibold text-text-primary group-hover:text-tf-orange transition-colors">
              Quiz
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Test your understanding
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
          {prev ? (
            <Link
              href={`/modules/${prev.id}`}
              className="group flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Module {prev.number}: {prev.shortTitle}</span>
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/modules/${next.id}`}
              className="group flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <span>Module {next.number}: {next.shortTitle}</span>
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div />}
        </div>
      </motion.div>
    </div>
  );
}
