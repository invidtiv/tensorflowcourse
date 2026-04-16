"use client";

import { motion } from "framer-motion";
import { modules } from "@/lib/modules";
import ModuleCard from "@/components/ui/ModuleCard";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProgressDashboard from "@/components/progress/ProgressDashboard";

export default function ModulesPage() {
  const foundation = modules.filter((m) => m.number <= 3);
  const core = modules.filter((m) => m.number >= 4 && m.number <= 6);
  const advanced = modules.filter((m) => m.number >= 7);

  const sections = [
    { title: "Foundation", subtitle: "Build your deep learning fundamentals", modules: foundation, color: "#00d4ff" },
    { title: "Core Deep Learning", subtitle: "Master advanced training and computer vision", modules: core, color: "#8b5cf6" },
    { title: "Advanced Applications", subtitle: "Specialize in GANs, NLP, time series, and deployment", modules: advanced, color: "#f97316" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb items={[{ label: "Modules" }]} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-3">
          Course Curriculum
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          10 progressive modules with 80+ hands-on labs. Follow the recommended path or jump to any module.
        </p>
      </motion.div>

      <ProgressDashboard />

      {/* Study schedule */}
      <div className="mb-12 p-6 rounded-xl border border-white/[0.06] bg-surface-1/30">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Recommended Schedule — 16 Weeks
        </h3>
        <div className="flex flex-wrap gap-2">
          {modules.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: `${m.color}10`, color: m.color, border: `1px solid ${m.color}20` }}
            >
              <span>{m.icon}</span>
              <span className="font-medium">M{m.number}</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">{m.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Module sections */}
      {sections.map((section, si) => (
        <div key={section.title} className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 max-w-[40px]" style={{ background: section.color }} />
              <h2
                className="text-xl font-heading font-semibold"
                style={{ color: section.color }}
              >
                {section.title}
              </h2>
            </div>
            <p className="text-text-muted text-sm">{section.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {section.modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <ModuleCard module={mod} />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
