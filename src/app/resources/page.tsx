"use client";

import { motion } from "framer-motion";
import Breadcrumb from "@/components/layout/Breadcrumb";
import resourcesData from "../../../content/resources/resources.json";

interface ResourceItem {
  name: string;
  url: string;
  desc: string;
}
interface ResourceGroup {
  category: string;
  items: ResourceItem[];
}

// Link data is content-driven: edit content/resources/resources.json to add,
// remove, or re-order resources — no code change required.
const resources = resourcesData as ResourceGroup[];

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
