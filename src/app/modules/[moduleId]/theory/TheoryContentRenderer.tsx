"use client";

import { useMemo } from "react";

interface TheoryContentRendererProps {
  content: string;
}

export default function TheoryContentRenderer({ content }: TheoryContentRendererProps) {
  const html = useMemo(() => {
    // Simple markdown-to-html conversion for display
    // In production, this would use MDX compilation
    let processed = content;

    // Headers
    processed = processed.replace(/^#### (.+)$/gm, '<h4 class="text-lg font-heading font-semibold text-text-primary mt-6 mb-3">$1</h4>');
    processed = processed.replace(/^### (.+)$/gm, '<h3 class="text-xl font-heading font-semibold text-text-primary mt-8 mb-3">$1</h3>');
    processed = processed.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-heading font-bold text-text-primary mt-10 mb-4 pb-2 border-b border-white/[0.06]">$1</h2>');
    processed = processed.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-heading font-bold text-text-primary mt-10 mb-4">$1</h1>');

    // Code blocks
    processed = processed.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_, lang, code) => {
        const language = lang || "python";
        const lines = code.trim().split("\n");
        const lineNums = lines.map((line: string, i: number) =>
          `<div class="flex"><span class="select-none text-text-muted/30 w-10 shrink-0 text-right pr-4 text-xs leading-relaxed">${i + 1}</span><span>${escapeHtml(line)}</span></div>`
        ).join("");
        return `<div class="group relative my-6 rounded-xl border border-white/[0.06] overflow-hidden bg-[#0d1117]">
          <div class="flex items-center justify-between px-4 py-2 bg-surface-1/50 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <div class="flex gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-error/60"></div><div class="w-2.5 h-2.5 rounded-full bg-warning/60"></div><div class="w-2.5 h-2.5 rounded-full bg-success/60"></div></div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-surface-2 text-text-muted font-mono uppercase">${language}</span>
            </div>
          </div>
          <div class="overflow-x-auto"><pre class="p-4 text-sm leading-relaxed !bg-transparent !border-0 !m-0"><code class="font-code">${lineNums}</code></pre></div>
        </div>`;
      }
    );

    // Inline code
    processed = processed.replace(
      /`([^`]+)`/g,
      '<code class="bg-surface-1 px-1.5 py-0.5 rounded text-sm font-code text-neon-cyan">$1</code>'
    );

    // Bold
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');

    // Italic
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    processed = processed.replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-3 border-neon-purple/40 pl-4 text-text-secondary italic my-4">$1</blockquote>'
    );

    // Tables
    processed = processed.replace(
      /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g,
      (_, headerRow, bodyRows) => {
        const headers = headerRow.split("|").filter((h: string) => h.trim()).map((h: string) =>
          `<th class="px-4 py-3 text-left text-xs font-semibold text-neon-cyan uppercase tracking-wider bg-surface-1">${h.trim()}</th>`
        ).join("");
        const rows = bodyRows.trim().split("\n").map((row: string) => {
          const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) =>
            `<td class="px-4 py-3 text-sm text-text-secondary border-b border-white/[0.04]">${c.trim()}</td>`
          ).join("");
          return `<tr class="hover:bg-neon-cyan/[0.02]">${cells}</tr>`;
        }).join("");
        return `<div class="my-6 overflow-x-auto rounded-xl border border-white/[0.06]"><table class="w-full"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
      }
    );

    // Unordered lists
    processed = processed.replace(
      /^- (.+)$/gm,
      '<li class="flex items-start gap-2 text-text-secondary mb-1.5"><span class="text-neon-cyan mt-1.5 text-[6px]">●</span><span>$1</span></li>'
    );
    // Wrap consecutive li elements
    processed = processed.replace(
      /((?:<li[^>]*>.*?<\/li>\n?)+)/g,
      '<ul class="my-4 space-y-1">$1</ul>'
    );

    // Ordered lists
    processed = processed.replace(/^(\d+)\. (.+)$/gm, '<li class="text-text-secondary mb-1.5 ml-4">$2</li>');

    // Horizontal rules
    processed = processed.replace(/^---$/gm, '<hr class="my-8 border-white/[0.06]" />');

    // Paragraphs (lines that aren't already HTML)
    processed = processed.replace(
      /^(?!<[a-z]|$)(.+)$/gm,
      '<p class="text-text-secondary leading-relaxed mb-4">$1</p>'
    );

    // Clean up empty paragraphs
    processed = processed.replace(/<p[^>]*>\s*<\/p>/g, "");

    return processed;
  }, [content]);

  return (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
