"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface ChapterTab {
  /** Full heading of the chapter's first section (used as tooltip). */
  title: string;
  /** Server-rendered MDX content for the chapter. */
  content: ReactNode;
}

export default function ChapterTabs({ chapters }: { chapters: ChapterTab[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  const select = useCallback((i: number) => {
    setActive(i);
    // Bring the start of the chapter into view when switching.
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next = active;
      if (e.key === "ArrowRight") next = Math.min(chapters.length - 1, active + 1);
      else if (e.key === "ArrowLeft") next = Math.max(0, active - 1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = chapters.length - 1;
      else return;
      e.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    },
    [active, chapters.length],
  );

  if (chapters.length <= 1) {
    return <article className="theory-prose max-w-none">{chapters[0]?.content}</article>;
  }

  return (
    <div>
      <div ref={topRef} className="scroll-mt-24" />
      {/* Tab strip — horizontal, scrolls when crowded */}
      <div
        role="tablist"
        aria-label="Chapters"
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-white/[0.08] mb-6 -mx-1 px-1 pb-px
"
      >
        {chapters.map((ch, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              id={`chapter-tab-${i}`}
              aria-selected={isActive}
              aria-controls={`chapter-panel-${i}`}
              tabIndex={isActive ? 0 : -1}
              title={ch.title}
              onClick={() => select(i)}
              className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5
                          text-sm font-medium transition-colors border-b-2 -mb-px
                          ${isActive
                            ? "border-neon-cyan text-neon-cyan"
                            : "border-transparent text-text-muted hover:text-text-secondary hover:bg-white/[0.03]"}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold
                            ${isActive ? "bg-neon-cyan/20 text-neon-cyan" : "bg-white/[0.06] text-text-muted group-hover:text-text-secondary"}`}
              >
                {i + 1}
              </span>
              <span className="max-w-[16rem] truncate">{ch.title}</span>
            </button>
          );
        })}
      </div>

      {/* Panels — keep all mounted, toggle visibility so switching is instant
          and in-page anchor links keep working. */}
      {chapters.map((ch, i) => (
        <article
          key={i}
          role="tabpanel"
          id={`chapter-panel-${i}`}
          aria-labelledby={`chapter-tab-${i}`}
          hidden={i !== active}
          className="theory-prose max-w-none"
        >
          {ch.content}
        </article>
      ))}

      {/* Prev / next chapter footer */}
      <div className="flex items-center justify-between gap-3 pt-6 mt-8 border-t border-white/[0.06]">
        <button
          onClick={() => select(active - 1)}
          disabled={active === 0}
          className="text-sm text-text-muted enabled:hover:text-text-primary transition-colors disabled:opacity-30"
        >
          ← {active > 0 ? chapters[active - 1].title : "Start"}
        </button>
        <span className="text-xs text-text-muted/60">
          Chapter {active + 1} of {chapters.length}
        </span>
        <button
          onClick={() => select(active + 1)}
          disabled={active === chapters.length - 1}
          className="text-sm text-neon-cyan enabled:hover:text-white transition-colors disabled:opacity-30"
        >
          {active < chapters.length - 1 ? chapters[active + 1].title : "End"} →
        </button>
      </div>
    </div>
  );
}
