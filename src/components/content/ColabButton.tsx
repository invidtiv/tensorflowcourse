"use client";

import { motion } from "framer-motion";

interface ColabButtonProps {
  notebookUrl?: string;
  className?: string;
}

export default function ColabButton({ notebookUrl, className = "" }: ColabButtonProps) {
  const href = notebookUrl || "https://colab.research.google.com/";

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-tf-orange/10 border border-tf-orange/30 text-tf-orange hover:bg-tf-orange/20 hover:border-tf-orange/50 transition-colors font-medium text-sm ${className}`}
    >
      {/* Colab icon */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.9414 4.9757a7.033 7.033 0 0 0-4.9308 2.0646 7.033 7.033 0 0 0-.0714 9.9146l2.4726-2.4726a3.9 3.9 0 0 1-.028-5.4964 3.9 3.9 0 0 1 5.4964.028l2.4727-2.4727A7.033 7.033 0 0 0 16.941 4.976zm-9.9016.0012a7.033 7.033 0 0 0-4.9308 2.0646 7.033 7.033 0 0 0 2.0646 11.0196l2.4726-2.4726a3.9 3.9 0 0 1-1.1152-6.224 3.9 3.9 0 0 1 5.4964.028l2.4727-2.4727a7.033 7.033 0 0 0-6.46-1.9432z" />
      </svg>
      Open in Google Colab
      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </motion.a>
  );
}
