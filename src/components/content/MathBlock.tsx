"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface MathBlockProps {
  math: string;
  display?: boolean;
  className?: string;
}

export default function MathBlock({ math, display = true, className = "" }: MathBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch {
        if (containerRef.current) {
          containerRef.current.textContent = math;
        }
      }
    }
  }, [math, display]);

  return (
    <div
      ref={containerRef}
      className={`${
        display
          ? "my-6 py-4 px-6 rounded-lg bg-surface-1/50 border border-white/[0.06] overflow-x-auto text-center"
          : "inline"
      } ${className}`}
    />
  );
}
