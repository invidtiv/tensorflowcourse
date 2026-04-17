"use client";

/**
 * VideoTranscript — Phase 5b final deliverable.
 *
 * Renders a collapsible, per-video transcript panel from a WebVTT (.vtt) file.
 * - Lazy-fetches and parses the VTT only after first expansion (keeps offline
 *   localhost UX snappy; zero network hit until the learner asks for it).
 * - Expanded/collapsed state is persisted across modules via
 *   `preferences.lastTranscriptVisible` on the progressStore, so a learner who
 *   prefers transcripts always sees them — and vice versa.
 * - Clicking a cue dispatches a `tfc:transcript-seek` CustomEvent with
 *   `{ videoId, time }`. A matching VideoEmbed can listen for this event and
 *   seek its <video> / YouTube player. Decoupled so the component works even
 *   when dropped into an MDX page without a paired VideoEmbed.
 *
 * Props:
 *   - src:            required. URL of the .vtt transcript file.
 *   - videoId?:       pairing id — forwarded on the seek CustomEvent so a
 *                     specific VideoEmbed instance can opt-in.
 *   - title?:         header label. Defaults to "Transcript".
 *   - defaultExpanded? override the persisted preference for this mount only.
 *   - lang?:          informational; forwarded to aria-label.
 *
 * Intentionally does NOT accept a direct ref to the video element — transcripts
 * are often rendered in a different MDX block / stacking context, so event-bus
 * coupling is the least-surprising integration.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgressStore } from "@/stores/progressStore";

export interface TranscriptCue {
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
  /** Cue body with VTT tags stripped. */
  text: string;
}

export interface VideoTranscriptProps {
  src: string;
  videoId?: string;
  title?: string;
  defaultExpanded?: boolean;
  lang?: string;
}

/** Parse `HH:MM:SS.mmm` or `MM:SS.mmm` into seconds. Returns NaN on failure. */
function parseVttTimestamp(ts: string): number {
  const m = ts.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!m) return NaN;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = parseInt(m[2], 10);
  const s = parseInt(m[3], 10);
  const ms = m[4] ? parseInt(m[4].padEnd(3, "0"), 10) : 0;
  return h * 3600 + min * 60 + s + ms / 1000;
}

/**
 * Minimal WebVTT parser — handles the subset needed for educational
 * transcripts: sequential cues, optional cue IDs, "HH:MM:SS.mmm --> HH:MM:SS.mmm"
 * header lines, multi-line payloads, and inline tag stripping. Ignores STYLE,
 * REGION, NOTE blocks. Intentionally forgiving: malformed cues are skipped,
 * not thrown, so a typo in one cue doesn't blank the whole panel.
 */
export function parseVtt(raw: string): TranscriptCue[] {
  const cues: TranscriptCue[] = [];
  const blocks = raw.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.length > 0);
    if (lines.length === 0) continue;
    // Skip non-cue blocks.
    if (/^WEBVTT/i.test(lines[0])) continue;
    if (/^(NOTE|STYLE|REGION)\b/i.test(lines[0])) continue;

    // Cue header may be preceded by an optional cue-id line.
    let headerIdx = lines.findIndex((l) => l.includes("-->"));
    if (headerIdx === -1) continue;
    const header = lines[headerIdx];
    const [startRaw, endRaw] = header.split("-->").map((s) => s.trim().split(" ")[0]);
    const start = parseVttTimestamp(startRaw);
    const end = parseVttTimestamp(endRaw);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

    const body = lines
      .slice(headerIdx + 1)
      .join(" ")
      // Strip VTT inline tags: <v Speaker>, <b>, <i>, <c.class>, etc.
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!body) continue;
    cues.push({ start, end, text: body });
  }
  return cues;
}

/** Format seconds as `M:SS` or `H:MM:SS`. */
function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoTranscript({
  src,
  videoId,
  title = "Transcript",
  defaultExpanded,
  lang,
}: VideoTranscriptProps) {
  const persistedExpanded = useProgressStore((s) => s.preferences?.lastTranscriptVisible ?? false);
  const setPersistedExpanded = useProgressStore((s) => s.setLastTranscriptVisible);

  // Use the per-mount override if the author supplied one; otherwise honour the
  // sticky user preference. Either way, later user toggles are authoritative.
  const [expanded, setExpanded] = useState<boolean>(
    typeof defaultExpanded === "boolean" ? defaultExpanded : persistedExpanded,
  );
  const [cues, setCues] = useState<TranscriptCue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedOnce = useRef(false);
  // Active-cue highlight synced to the paired <video>'s currentTime.
  const [activeCueIdx, setActiveCueIdx] = useState<number>(-1);
  // Search/filter — narrows the cue list without losing seek behaviour.
  const [filter, setFilter] = useState<string>("");
  // Keyboard focus index inside the cue list (roving tabindex).
  const [focusedCueIdx, setFocusedCueIdx] = useState<number>(-1);
  const listRef = useRef<HTMLOListElement>(null);

  // Lazy-load: only fetch the VTT after the panel is first expanded.
  useEffect(() => {
    if (!expanded || fetchedOnce.current) return;
    fetchedOnce.current = true;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(src)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        const parsed = parseVtt(text);
        if (parsed.length === 0) {
          setError("No cues found in transcript.");
          setCues([]);
        } else {
          setCues(parsed);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load transcript.");
        // Allow a manual retry next time the panel is re-opened.
        fetchedOnce.current = false;
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, src]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      // Only write back to the sticky preference when the author has NOT
      // overridden defaultExpanded for this mount — otherwise an essay with
      // `defaultExpanded={false}` would flip the global preference for every
      // learner visiting that page.
      if (typeof defaultExpanded !== "boolean") {
        setPersistedExpanded(next);
      }
      return next;
    });
  }, [defaultExpanded, setPersistedExpanded]);

  const handleCueClick = useCallback(
    (cue: TranscriptCue) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent("tfc:transcript-seek", {
          detail: { videoId: videoId ?? null, time: cue.start },
        }),
      );
    },
    [videoId],
  );

  // Listen for time updates from the paired VideoEmbed (broadcast via a
  // `tfc:transcript-time` CustomEvent) to highlight the currently-active cue.
  // Falls back to the simple "no active cue" state when no video is playing.
  useEffect(() => {
    if (!cues || cues.length === 0) return;
    const onTime = (e: Event) => {
      const detail = (e as CustomEvent<{ videoId?: string | null; time: number }>).detail;
      if (!detail || typeof detail.time !== "number") return;
      if (detail.videoId && videoId && detail.videoId !== videoId) return;
      const t = detail.time;
      // Binary search would be nicer, but cue counts are ~17 — linear is fine.
      let idx = -1;
      for (let i = 0; i < cues.length; i++) {
        if (t >= cues[i].start && t < cues[i].end) {
          idx = i;
          break;
        }
      }
      setActiveCueIdx((prev) => (prev === idx ? prev : idx));
    };
    window.addEventListener("tfc:transcript-time", onTime as EventListener);
    return () =>
      window.removeEventListener("tfc:transcript-time", onTime as EventListener);
  }, [cues, videoId]);

  // Keyboard nav for the cue list — roving tabindex pattern per WAI-ARIA
  // listbox guidance. ArrowDown/Up move the focus; Enter/Space seeks.
  // Home/End jump to first/last visible cue.
  const visibleCues = useMemo(() => {
    if (!cues) return [] as Array<{ cue: TranscriptCue; origIdx: number }>;
    const q = filter.trim().toLowerCase();
    return cues
      .map((cue, origIdx) => ({ cue, origIdx }))
      .filter(({ cue }) => !q || cue.text.toLowerCase().includes(q));
  }, [cues, filter]);

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOListElement>) => {
      if (visibleCues.length === 0) return;
      const currentVisible = Math.max(
        0,
        visibleCues.findIndex((v) => v.origIdx === focusedCueIdx),
      );
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedCueIdx(
            visibleCues[Math.min(visibleCues.length - 1, currentVisible + 1)].origIdx,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedCueIdx(visibleCues[Math.max(0, currentVisible - 1)].origIdx);
          break;
        case "Home":
          e.preventDefault();
          setFocusedCueIdx(visibleCues[0].origIdx);
          break;
        case "End":
          e.preventDefault();
          setFocusedCueIdx(visibleCues[visibleCues.length - 1].origIdx);
          break;
        case "Enter":
        case " ": {
          const cue = cues?.[focusedCueIdx];
          if (cue) {
            e.preventDefault();
            handleCueClick(cue);
          }
          break;
        }
      }
    },
    [visibleCues, focusedCueIdx, cues, handleCueClick],
  );

  // When focusedCueIdx changes, imperatively move DOM focus to the button so
  // screen readers announce the new cue.
  useEffect(() => {
    if (focusedCueIdx < 0 || !listRef.current) return;
    const btn = listRef.current.querySelector<HTMLButtonElement>(
      `button[data-cue-idx="${focusedCueIdx}"]`,
    );
    btn?.focus();
    btn?.scrollIntoView({ block: "nearest" });
  }, [focusedCueIdx]);

  const cueCount = cues?.length ?? 0;
  const duration = useMemo(() => {
    if (!cues || cues.length === 0) return 0;
    return cues[cues.length - 1].end;
  }, [cues]);

  return (
    <section
      className="my-6 rounded-lg border border-white/[0.08] bg-surface-1/40"
      aria-label={lang ? `Transcript (${lang})` : "Transcript"}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors rounded-t-lg"
        aria-expanded={expanded}
        aria-controls={`transcript-${videoId ?? "default"}`}
      >
        <span className="flex items-center gap-2">
          <svg
            className={`h-4 w-4 text-neon-cyan transition-transform ${expanded ? "rotate-90" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6 4l8 6-8 6V4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-text-primary">{title}</span>
          {cueCount > 0 && (
            <span className="text-xs text-text-secondary">
              · {cueCount} cues · {formatTime(duration)}
            </span>
          )}
        </span>
        <span className="text-xs text-text-secondary">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div
          id={`transcript-${videoId ?? "default"}`}
          className="border-t border-white/[0.08]"
        >
          {loading && (
            <div className="px-4 py-6 text-sm text-text-secondary">Loading transcript…</div>
          )}
          {error && !loading && (
            <div className="px-4 py-4 text-sm text-red-400" role="alert">
              Transcript unavailable: {error}
            </div>
          )}
          {!loading && !error && cues && cues.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-white/[0.04] bg-surface-1/30">
                <label className="sr-only" htmlFor={`transcript-filter-${videoId ?? "default"}`}>
                  Filter transcript cues
                </label>
                <input
                  id={`transcript-filter-${videoId ?? "default"}`}
                  type="search"
                  role="searchbox"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search transcript…"
                  className="w-full bg-surface-1/60 border border-white/[0.06] rounded px-2 py-1 text-sm text-text-secondary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-neon-cyan/40"
                  aria-describedby={`transcript-filter-hint-${videoId ?? "default"}`}
                />
                <span
                  id={`transcript-filter-hint-${videoId ?? "default"}`}
                  className="sr-only"
                >
                  {filter
                    ? `${visibleCues.length} of ${cues.length} cues match`
                    : `${cues.length} cues. Use arrow keys to navigate, Enter to jump.`}
                </span>
              </div>
              <ol
                ref={listRef}
                role="listbox"
                aria-label={`Transcript cues${lang ? ` (${lang})` : ""}`}
                aria-activedescendant={
                  focusedCueIdx >= 0
                    ? `cue-${videoId ?? "default"}-${focusedCueIdx}`
                    : undefined
                }
                onKeyDown={handleListKeyDown}
                tabIndex={0}
                className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto focus:outline-none focus:ring-1 focus:ring-neon-cyan/30"
              >
                {visibleCues.length === 0 && (
                  <li className="px-4 py-3 text-sm text-text-secondary/60" role="option" aria-selected="false">
                    No cues match &ldquo;{filter}&rdquo;.
                  </li>
                )}
                {visibleCues.map(({ cue, origIdx }) => {
                  const isActive = origIdx === activeCueIdx;
                  const isFocused = origIdx === focusedCueIdx;
                  return (
                    <li
                      key={`${cue.start}-${origIdx}`}
                      role="option"
                      id={`cue-${videoId ?? "default"}-${origIdx}`}
                      aria-selected={isFocused}
                    >
                      <button
                        type="button"
                        data-cue-idx={origIdx}
                        onClick={() => {
                          setFocusedCueIdx(origIdx);
                          handleCueClick(cue);
                        }}
                        onFocus={() => setFocusedCueIdx(origIdx)}
                        tabIndex={isFocused || (focusedCueIdx === -1 && origIdx === visibleCues[0].origIdx) ? 0 : -1}
                        className={`flex w-full gap-3 px-4 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-neon-cyan/10 border-l-2 border-neon-cyan"
                            : "hover:bg-white/[0.03] border-l-2 border-transparent"
                        } focus:outline-none focus:bg-white/[0.05] focus-visible:ring-1 focus-visible:ring-neon-cyan/40`}
                        aria-label={`Jump to ${formatTime(cue.start)}${isActive ? " (currently playing)" : ""}`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <span className={`shrink-0 font-code text-xs tabular-nums mt-0.5 ${isActive ? "text-neon-cyan font-semibold" : "text-neon-cyan/80"}`}>
                          {formatTime(cue.start)}
                        </span>
                        <span className={`text-sm leading-relaxed ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                          {cue.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {activeCueIdx >= 0 && cues[activeCueIdx]
                  ? `Now playing cue ${activeCueIdx + 1}: ${cues[activeCueIdx].text}`
                  : ""}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
