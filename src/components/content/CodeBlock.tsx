"use client";

import { useState } from "react";

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  children,
  language = "python",
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = children.trim().split("\n");

  return (
    <div className="group relative my-4 rounded-xl border border-white/[0.06] overflow-hidden bg-[#0d1117]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-1/50 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          {filename && (
            <span className="text-xs text-text-muted font-mono">{filename}</span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-2 text-text-muted font-mono uppercase">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-surface-2"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content.
          CRITICAL layout decision: the code body is rendered as a SINGLE
          raw text node inside <pre><code>. No per-line <div> wrapping.
          Per-line divs in a flex layout caused sub-pixel drift between
          rows because each div independently computed its content width,
          and any per-glyph font fallback for box-drawing characters
          (U+2500–257F) compounded across rows.
          Line numbers live in a SEPARATE parallel column outside the
          <pre>, so the pre contains nothing but the original text and
          `white-space: pre` is the single source of truth for layout. */}
      <div className="overflow-x-auto">
        <div className="flex">
          {showLineNumbers && (
            <div
              aria-hidden
              className="select-none shrink-0 py-4 pl-4 pr-4 text-right text-xs leading-relaxed text-text-muted/30"
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', 'Cascadia Mono', monospace",
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre
            className="p-4 pl-0 text-sm leading-relaxed !bg-transparent !border-0 !m-0 min-w-max"
            style={{
              // Force a single, system-provided monospace font that has ASCII
              // + box-drawing at identical advance widths. Tailwind v4's
              // preflight sets `code, kbd, samp, pre { font-family: var(--font-code) !important }`,
              // so we also set --font-code in globals.css to this same stack;
              // having both inline and var in sync means the effective font
              // is deterministic whichever wins the cascade.
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', 'Cascadia Mono', monospace",
              fontVariantLigatures: "none",
              fontVariantNumeric: "tabular-nums",
              fontFeatureSettings: "'calt' 0, 'liga' 0, 'clig' 0, 'dlig' 0, 'kern' 0",
              fontKerning: "none",
              textRendering: "geometricPrecision",
              whiteSpace: "pre",
              tabSize: 4,
            }}
          >
            <code
              className="text-text-secondary"
              style={{
                fontFamily: "inherit",
                background: "transparent",
                padding: 0,
              }}
            >
              {children.replace(/\n+$/, "")}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
