"use client";

import { motion } from "framer-motion";
import Breadcrumb from "@/components/layout/Breadcrumb";

const resources = [
  {
    category: "Official Documentation",
    items: [
      { name: "TensorFlow API Docs", url: "https://www.tensorflow.org/api_docs", desc: "Complete API reference for TensorFlow 2.x" },
      { name: "Keras Documentation", url: "https://keras.io", desc: "High-level neural networks API" },
      { name: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials", desc: "Official step-by-step tutorials" },
    ],
  },
  {
    category: "Development Tools",
    items: [
      { name: "Google Colab", url: "https://colab.research.google.com", desc: "Free Jupyter notebooks with GPU access" },
      { name: "TensorBoard", url: "https://www.tensorflow.org/tensorboard", desc: "Visualization toolkit for TensorFlow" },
      { name: "TF Hub", url: "https://tfhub.dev", desc: "Repository of pretrained models" },
    ],
  },
  {
    category: "Datasets",
    items: [
      { name: "TF Datasets", url: "https://www.tensorflow.org/datasets", desc: "Ready-to-use datasets for TensorFlow" },
      { name: "Kaggle Datasets", url: "https://www.kaggle.com/datasets", desc: "Community-shared datasets for ML" },
      { name: "UCI ML Repository", url: "https://archive.ics.uci.edu/ml", desc: "Classic machine learning datasets" },
    ],
  },
  {
    category: "Further Learning",
    items: [
      { name: "arXiv (cs.LG)", url: "https://arxiv.org/list/cs.LG/recent", desc: "Latest machine learning research papers" },
      { name: "Papers With Code", url: "https://paperswithcode.com", desc: "ML papers with implementation code" },
      { name: "Distill.pub", url: "https://distill.pub", desc: "Interactive visual explanations of ML concepts" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumb items={[{ label: "Resources" }]} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-3">
          Resources
        </h1>
        <p className="text-text-secondary text-lg">
          Curated tools, documentation, and references to supplement your learning.
        </p>
      </motion.div>

      <div className="space-y-10">
        {resources.map((group, gi) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gi * 0.1 }}
          >
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {group.items.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 rounded-xl border border-white/[0.06] bg-surface-1/30 hover:border-neon-cyan/20 hover:bg-surface-1/50 transition-all"
                >
                  <h3 className="font-medium text-text-primary group-hover:text-neon-cyan transition-colors text-sm mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
