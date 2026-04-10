"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { modules } from "@/lib/modules";
import ModuleCard from "@/components/ui/ModuleCard";
import Button from "@/components/ui/Button";

const NeuralNetworkHero = dynamic(
  () => import("@/components/animations/NeuralNetworkHero"),
  { ssr: false }
);
const ParticleBackground = dynamic(
  () => import("@/components/animations/ParticleBackground"),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden grid-pattern">
        <NeuralNetworkHero />
        <ParticleBackground />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 via-bg-primary/40 to-bg-primary pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                Free &amp; Open — 2025 Edition
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold tracking-tight"
            >
              <span className="text-text-primary">Deep Learning with</span>
              <br />
              <span className="gradient-text">TensorFlow</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
            >
              A comprehensive, semester-long course from neural network
              fundamentals to production deployment. Hands-on labs, interactive
              demos, and real-world projects.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex items-center justify-center gap-6 sm:gap-10 text-sm"
            >
              {[
                { value: "10", label: "Modules" },
                { value: "80+", label: "Labs" },
                { value: "227+", label: "Code Examples" },
                { value: "Free", label: "Forever" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-text-muted text-xs sm:text-sm mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex items-center justify-center gap-4 pt-4"
            >
              <Button variant="primary" size="lg" href="/modules/01-intro-deep-learning">
                Start Learning
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Button variant="outline" size="lg" href="/modules">
                View Curriculum
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              A structured learning path designed for maximum retention and practical skill building.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📖",
                title: "Learn Theory",
                desc: "Each module starts with deep theoretical foundations — mathematical derivations, historical context, and intuitive explanations.",
                color: "#00d4ff",
              },
              {
                icon: "💻",
                title: "Practice with Labs",
                desc: "80+ hands-on labs with complete, runnable code. Step-by-step implementations with expected outputs and challenge exercises.",
                color: "#8b5cf6",
              },
              {
                icon: "🧪",
                title: "Test & Build",
                desc: "Quiz yourself on each module, then apply your knowledge to real-world projects — from image classifiers to production deployments.",
                color: "#f97316",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-xl border border-white/[0.06] bg-surface-1/30 p-8 text-center"
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mt-4 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MODULES GRID ===== */}
      <section className="py-24 px-4 sm:px-6 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              Course Curriculum
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              10 progressive modules covering everything from neural network basics to production deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ModuleCard module={mod} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              Built With Industry Tools
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-12">
              Learn the tools and frameworks used by machine learning engineers worldwide.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: "TensorFlow", color: "#FF6F00" },
              { name: "Python", color: "#3776AB" },
              { name: "NumPy", color: "#013243" },
              { name: "Keras", color: "#D00000" },
              { name: "Google Colab", color: "#F9AB00" },
              { name: "Jupyter", color: "#F37626" },
            ].map((tool) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="px-6 py-3 rounded-xl border border-white/[0.06] bg-surface-1/30 text-sm font-medium text-text-secondary"
              >
                {tool.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary">
              Ready to Start?
            </h2>
            <p className="text-text-secondary text-lg">
              Begin your deep learning journey today. No prerequisites beyond
              basic Python knowledge.
            </p>
            <Button variant="primary" size="lg" href="/modules/01-intro-deep-learning">
              Begin Module 1
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
