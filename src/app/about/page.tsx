"use client";

import { motion } from "framer-motion";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb items={[{ label: "About" }]} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-6">
          About This Course
        </h1>

        <div className="prose max-w-none space-y-6">
          <p className="text-text-secondary leading-relaxed text-lg">
            Deep Learning with TensorFlow is a comprehensive, free, semester-length course
            designed to take you from the fundamentals of neural networks all the way to
            production deployment. The 2025 Edition covers the latest TensorFlow 2.x APIs
            and modern deep learning practices.
          </p>

          <div className="p-6 rounded-xl border border-white/[0.06] bg-surface-1/30">
            <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Course at a Glance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "10", label: "Modules" },
                { value: "80+", label: "Labs" },
                { value: "227+", label: "Code Examples" },
                { value: "16 weeks", label: "Duration" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-surface-2/30">
                  <div className="text-xl font-heading font-bold text-neon-cyan">{stat.value}</div>
                  <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-xl font-heading font-semibold text-text-primary mt-8">Methodology</h2>
          <p className="text-text-secondary leading-relaxed">
            Each module follows a structured approach: theoretical foundations with mathematical
            derivations and historical context, followed by hands-on lab exercises with complete,
            runnable code. Quiz assessments verify understanding before progression. This
            learn-practice-test cycle is designed for maximum retention.
          </p>

          <h2 className="text-xl font-heading font-semibold text-text-primary mt-8">Prerequisites</h2>
          <p className="text-text-secondary leading-relaxed">
            Basic Python programming knowledge is the only prerequisite. The course covers
            NumPy fundamentals, linear algebra concepts, and TensorFlow from installation
            through advanced usage. No prior machine learning experience is required.
          </p>

          <h2 className="text-xl font-heading font-semibold text-text-primary mt-8">Technology</h2>
          <p className="text-text-secondary leading-relaxed">
            The course is built around TensorFlow 2.x and Keras. Lab exercises are designed
            to run on Google Colab (free GPU access) or any local Python environment with
            TensorFlow installed. All code examples are complete and runnable.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
