"use client";

import Link from "next/link";
import type { ModuleMeta } from "@/types/module";
import Badge from "./Badge";
import ProgressRing from "../progress/ProgressRing";

interface ModuleCardProps {
  module: ModuleMeta;
  progress?: number;
}

export default function ModuleCard({ module, progress = 0 }: ModuleCardProps) {
  const difficultyVariant = module.difficulty === "beginner"
    ? "beginner"
    : module.difficulty === "intermediate"
    ? "intermediate"
    : "advanced";

  return (
    <Link href={`/modules/${module.id}`}>
      <div
        className="group relative rounded-xl border border-white/[0.06] bg-surface-1/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-surface-1/60 hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden"
      >
        {/* Glow accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${module.color}, transparent)` }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{module.icon}</span>
            <span
              className="text-xs font-mono font-semibold uppercase tracking-wider"
              style={{ color: module.color }}
            >
              Module {module.number}
            </span>
          </div>
          <ProgressRing percent={progress} size={40} color={module.color} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2 group-hover:text-white transition-colors">
          {module.shortTitle}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
          {module.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Badge variant={difficultyVariant}>{module.difficulty}</Badge>
          <span className="text-xs text-text-muted">
            {module.labCount} labs · {module.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}
