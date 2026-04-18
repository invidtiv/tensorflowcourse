"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import MiniSearch from "minisearch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EntryKind = "lab" | "theory" | "quiz";

interface SearchEntry {
  id: string;
  kind: EntryKind;
  moduleId: string;
  moduleNumber: number;
  labId?: string;
  labNumber?: number;
  title: string;
  description: string;
  tags: string[];
  difficulty?: string;
  duration?: string;
  questionCount?: number;
  body: string;
}

interface SearchResult extends SearchEntry {
  score: number;
  match: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entryHref(entry: SearchEntry): string {
  const base = `/modules/${entry.moduleId}`;
  if (entry.kind === "lab") return `${base}/labs/${entry.labId}`;
  if (entry.kind === "theory") return `${base}/theory`;
  return `${base}/quiz`;
}

function kindLabel(kind: EntryKind) {
  if (kind === "lab") return "Lab";
  if (kind === "theory") return "Theory";
  return "Quiz";
}

function kindColor(kind: EntryKind) {
  if (kind === "lab") return "var(--neon-purple)";
  if (kind === "theory") return "var(--neon-cyan)";
  return "var(--tf-orange)";
}

function kindBg(kind: EntryKind) {
  if (kind === "lab") return "rgba(139,92,246,0.12)";
  if (kind === "theory") return "rgba(0,212,255,0.10)";
  return "rgba(249,115,22,0.12)";
}

/**
 * Highlight all occurrences of `query` tokens in `text`.
 * Returns an array of {text, highlight} segments.
 */
function highlightSegments(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (tokens.length === 0) return [{ text, highlight: false }];

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part) => ({
    text: part,
    highlight: pattern.test(part),
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GROUP_ORDER: EntryKind[] = ["lab", "theory", "quiz"];

export default function SearchPage() {
  const [index, setIndex] = useState<MiniSearch<SearchEntry> | null>(null);
  const [allEntries, setAllEntries] = useState<SearchEntry[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus input and handle "/" shortcut
  useEffect(() => {
    inputRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      // "/" — jump to search input (unless already in an input/textarea)
      if (
        e.key === "/" &&
        document.activeElement !== inputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape — clear
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("");
        setResults([]);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load search index once
  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch("/search-index.json");
        if (!res.ok) throw new Error(`Failed to fetch search index: ${res.status}`);
        const entries: SearchEntry[] = await res.json();
        setAllEntries(entries);

        const ms = new MiniSearch<SearchEntry>({
          idField: "id",
          fields: ["title", "description", "body", "tags"],
          storeFields: [
            "id",
            "kind",
            "moduleId",
            "moduleNumber",
            "labId",
            "labNumber",
            "title",
            "description",
            "tags",
            "difficulty",
            "duration",
            "questionCount",
            "body",
          ],
          searchOptions: {
            boost: { title: 3, description: 2, tags: 2, body: 1 },
            prefix: true,
            fuzzy: 0.2,
          },
        });

        ms.addAll(entries);
        setIndex(ms);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load search index");
      } finally {
        setLoading(false);
      }
    }

    loadIndex();
  }, []);

  // Debounced search
  const runSearch = useCallback(
    (q: string) => {
      if (!index) return;
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const raw = index.search(q, { combineWith: "OR" });
      // MiniSearch returns objects with all storeFields + score + match
      setResults(raw as unknown as SearchResult[]);
    },
    [index]
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 150);
  }

  // Group results by kind
  const grouped: Record<EntryKind, SearchResult[]> = {
    lab: results.filter((r) => r.kind === "lab"),
    theory: results.filter((r) => r.kind === "theory"),
    quiz: results.filter((r) => r.kind === "quiz"),
  };

  const hasResults = results.length > 0;
  const showEmpty = !loading && !error && query.trim() && !hasResults;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
          Search
        </h1>
        <p className="text-text-muted text-sm">
          Search across {allEntries.length > 0 ? allEntries.length : "all"} course
          items — labs, theory, and quizzes. Press{" "}
          <kbd className="inline-block px-1.5 py-0.5 text-xs font-mono rounded border border-white/20 text-text-muted bg-surface-1">
            /
          </kbd>{" "}
          to focus search from anywhere.
        </p>
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInput}
          placeholder="Search labs, theory, quizzes…"
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-12 pr-12 py-4 rounded-xl border border-white/[0.10] bg-surface-1/60 text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20 text-base transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 text-text-muted py-8">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Loading search index…</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-error/30 bg-error/5 text-sm text-error">
          {error}
        </div>
      )}

      {/* Empty state */}
      {showEmpty && (
        <div className="py-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-muted text-sm">
            No results for{" "}
            <span className="text-text-secondary font-medium">"{query}"</span>
          </p>
          <p className="text-text-muted text-xs mt-1">
            Try different keywords or shorter terms
          </p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-8">
          <p className="text-xs text-text-muted">
            {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
            <span className="text-text-secondary">"{query}"</span>
          </p>

          {GROUP_ORDER.map((kind) => {
            const group = grouped[kind];
            if (group.length === 0) return null;

            return (
              <section key={kind}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ color: kindColor(kind), background: kindBg(kind) }}
                  >
                    {kindLabel(kind)}s
                  </span>
                  <span className="text-xs text-text-muted">
                    {group.length} result{group.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Result cards */}
                <ul className="space-y-2">
                  {group.map((result) => (
                    <ResultCard key={result.id} result={result} query={query} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Idle state — no query yet */}
      {!loading && !error && !query && (
        <div className="py-10 text-center text-text-muted text-sm">
          <p>Start typing to search across all course content.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResultCard
// ---------------------------------------------------------------------------

function ResultCard({
  result,
  query,
}: {
  result: SearchResult;
  query: string;
}) {
  const href = entryHref(result);
  const segments = highlightSegments(result.title, query);
  const snippet = result.description || result.body;
  const snippetSegments = highlightSegments(snippet.slice(0, 160), query);

  return (
    <li>
      <Link
        href={href}
        className="group block p-4 rounded-xl border border-white/[0.06] bg-surface-1/20 hover:border-white/[0.14] hover:bg-surface-1/40 transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Module badge + kind */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[10px] font-mono font-semibold uppercase tracking-wider"
                style={{ color: kindColor(result.kind) }}
              >
                M{String(result.moduleNumber).padStart(2, "0")}
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: kindColor(result.kind),
                  background: kindBg(result.kind),
                }}
              >
                {kindLabel(result.kind)}
              </span>
              {result.kind === "lab" && result.labNumber != null && (
                <span className="text-[10px] text-text-muted">
                  Lab {result.labNumber}
                </span>
              )}
              {result.difficulty && (
                <span className="text-[10px] text-text-muted capitalize">
                  · {result.difficulty}
                </span>
              )}
              {result.duration && (
                <span className="text-[10px] text-text-muted">
                  · {result.duration}
                </span>
              )}
              {result.kind === "quiz" && result.questionCount != null && (
                <span className="text-[10px] text-text-muted">
                  · {result.questionCount} questions
                </span>
              )}
            </div>

            {/* Title with highlights */}
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-white transition-colors leading-snug">
              {segments.map((seg, i) =>
                seg.highlight ? (
                  <mark
                    key={i}
                    className="bg-transparent font-bold"
                    style={{ color: kindColor(result.kind) }}
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </h3>

            {/* Snippet with highlights */}
            {snippet && (
              <p className="mt-1 text-xs text-text-muted leading-relaxed line-clamp-2">
                {snippetSegments.map((seg, i) =>
                  seg.highlight ? (
                    <mark
                      key={i}
                      className="bg-transparent font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
            )}

            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2/60 text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Arrow */}
          <svg
            className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </li>
  );
}
