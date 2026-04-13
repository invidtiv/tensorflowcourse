"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useProgressStore } from "@/stores/progressStore";

type VideoType = "youtube" | "mp4";

/** A single caption/subtitle track for the MP4 player. Maps to <track> element. */
interface CaptionTrack {
  /** URL or path to the .vtt file (e.g., "/videos/captions/01-intro-en.vtt"). */
  src: string;
  /** BCP 47 language code (e.g., "en", "pt-BR"). */
  srclang: string;
  /** Human-readable label shown in the track picker (e.g., "English", "Português"). */
  label: string;
  /** Whether this track is active by default. At most one should be true. */
  default?: boolean;
  /** Track kind — "subtitles" for translations, "captions" for same-language + sound effects.
   *  Defaults to "captions" for accessibility best practice. */
  kind?: "captions" | "subtitles";
}

interface VideoEmbedProps {
  /** YouTube video ID (for type="youtube") or src URL / path (for type="mp4"). Legacy: videoId is still accepted. */
  src?: string;
  videoId?: string;
  type?: VideoType;
  title?: string;
  /** Optional poster image for mp4 facade. For YouTube, auto-derived from thumbnail. */
  poster?: string;
  /** Start time in seconds (YouTube: ?start=; mp4: #t=). */
  startAt?: number;
  /** Callback fired when the user initiates playback (clicks the facade or plays the mp4). Useful for progress tracking. */
  onPlay?: () => void;
  /** When provided, automatically calls markVideoWatched(moduleId) on first play.
   *  This bridges VideoEmbed to the Zustand progress store without requiring an
   *  external onPlay callback — ideal for server-rendered MDX pages where you
   *  can't pass client callbacks through MDXRemote. */
  moduleId?: string;
  /** Caption/subtitle tracks for the MP4 player. Each entry renders a <track> element.
   *  For YouTube, captions are handled by YouTube's built-in cc_load_policy=1 param.
   *  Example usage in MDX:
   *  ```
   *  <VideoEmbed type="mp4" src="/videos/01-intro.mp4"
   *    captions={[{ src: "/videos/captions/01-intro-en.vtt", srclang: "en", label: "English", default: true }]}
   *  />
   *  ```
   */
  captions?: CaptionTrack[];
}

/**
 * YouTube IFrame Player API progress tracker.
 *
 * Uses the `enablejsapi=1` param + `postMessage` to listen for state changes
 * and poll `getCurrentTime` / `getDuration` without loading the full YT
 * IFrame API script. This keeps the lazy-load semantics — no extra network
 * requests until the user clicks play.
 *
 * State codes: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued.
 */
function useYouTubeProgress(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  iframeReady: boolean,
  moduleId: string | undefined,
  updateVideoProgress: (moduleId: string, percent: number) => void,
  markVideoFinished: (moduleId: string) => void,
) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPctRef = useRef(0);

  useEffect(() => {
    if (!iframeReady || !moduleId || !iframeRef.current) return;

    const iframe = iframeRef.current;

    // Helper: send a command to the YouTube player via postMessage.
    const sendCmd = (func: string, args?: unknown[]) => {
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func, args: args ?? [] }),
          "https://www.youtube.com",
        );
      } catch {
        // Cross-origin errors are expected if iframe hasn't fully loaded.
      }
    };

    // Listen for YT player state messages (sent via `enablejsapi=1`).
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      let data: { event?: string; info?: number | { currentTime?: number; duration?: number } };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      // State change: 0 = ended, 1 = playing
      if (data.event === "onStateChange" && typeof data.info === "number") {
        if (data.info === 0 && moduleId) {
          // Video ended
          markVideoFinished(moduleId);
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
        if (data.info === 1) {
          // Playing — start polling current time
          if (!pollRef.current) {
            pollRef.current = setInterval(() => {
              sendCmd("getCurrentTime");
              sendCmd("getDuration");
            }, 3000);
          }
        }
        if (data.info === 2 || data.info === 0) {
          // Paused or ended — stop polling
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
      }

      // Response from getCurrentTime / getDuration info callbacks
      if (data.event === "infoDelivery" && typeof data.info === "object" && data.info !== null) {
        const info = data.info as Record<string, number>;
        if (typeof info.currentTime === "number" && typeof info.duration === "number" && info.duration > 0) {
          const pct = Math.round((info.currentTime / info.duration) * 100);
          if (Math.abs(pct - lastPctRef.current) >= 5) {
            lastPctRef.current = pct;
            updateVideoProgress(moduleId, pct);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Tell the YT player to start sending events.
    // Small delay to ensure the iframe's YT player has initialised.
    const initTimer = setTimeout(() => {
      sendCmd("addEventListener", ["onStateChange"]);
    }, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(initTimer);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [iframeReady, moduleId, iframeRef, updateVideoProgress, markVideoFinished]);
}

/**
 * Lazy-loaded video facade.
 *
 * - `type="youtube"`: renders a click-to-load thumbnail, iframe only loads
 *   after user interaction. Uses rel=0 + modestbranding=1 + cc_load_policy=1
 *   to suppress external recs and surface captions. No network hit until click
 *   (except the single thumbnail image from img.youtube.com).
 * - `type="mp4"`: renders a native <video controls preload="metadata"> so the
 *   browser fetches only headers until playback starts. Works fully offline
 *   when `src` is under /public/videos/.
 *
 * Designed for localhost-only deployment: the YouTube branch is safe for
 * offline dev (no iframe request until clicked), and the MP4 branch is the
 * canonical path for self-hosted content per Point 5.1 of the course plan.
 */
export default function VideoEmbed({
  src,
  videoId,
  type = "youtube",
  title = "Video",
  poster,
  startAt,
  onPlay,
  moduleId,
  captions,
}: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const markVideoWatched = useProgressStore((s) => s.markVideoWatched);
  const updateVideoProgress = useProgressStore((s) => s.updateVideoProgress);
  const markVideoFinished = useProgressStore((s) => s.markVideoFinished);

  // Unified play handler: fires the external onPlay callback (if any) AND
  // marks the video as watched in the progress store (if moduleId is set).
  const handlePlay = useCallback(() => {
    onPlay?.();
    if (moduleId) {
      markVideoWatched(moduleId);
    }
  }, [onPlay, moduleId, markVideoWatched]);

  // Track playback progress for the native <video> branch.
  // Throttled: only updates the store when the percentage changes by ≥5%.
  const lastReportedPct = useState(0);
  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!moduleId) return;
    const vid = e.currentTarget;
    if (!vid.duration || vid.duration === Infinity) return;
    const pct = Math.round((vid.currentTime / vid.duration) * 100);
    if (Math.abs(pct - lastReportedPct[0]) >= 5) {
      lastReportedPct[0] = pct;
      updateVideoProgress(moduleId, pct);
    }
  }, [moduleId, updateVideoProgress, lastReportedPct]);

  // Mark video as fully watched when it ends.
  const handleEnded = useCallback(() => {
    if (moduleId) {
      markVideoFinished(moduleId);
    }
  }, [moduleId, markVideoFinished]);

  // YouTube IFrame Player API progress tracking (only active when iframe is loaded).
  useYouTubeProgress(iframeRef, iframeReady, moduleId, updateVideoProgress, markVideoFinished);

  // Back-compat: legacy callers passed `videoId` positionally. If only videoId
  // is provided, treat it as a YouTube ID.
  const resolvedType: VideoType = videoId && !src ? "youtube" : type;
  const resolvedSrc = src ?? videoId ?? "";

  // Playback speed state for MP4 player
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, []);

  if (resolvedType === "mp4") {
    // mp4 start-at uses media fragment (#t=SS)
    const mp4Src = startAt ? `${resolvedSrc}#t=${startAt}` : resolvedSrc;
    return (
      <div className="my-6 rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="relative aspect-video bg-surface-1">
          <video
            ref={videoRef}
            controls
            preload="metadata"
            poster={poster}
            className="absolute inset-0 w-full h-full"
            aria-label={title}
            onPlay={(e) => {
              // Sync playback rate when play starts (in case browser reset it)
              e.currentTarget.playbackRate = playbackRate;
              handlePlay();
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          >
            <source src={mp4Src} type="video/mp4" />
            {captions?.map((track) => (
              <track
                key={`${track.srclang}-${track.kind ?? "captions"}`}
                src={track.src}
                kind={track.kind ?? "captions"}
                srcLang={track.srclang}
                label={track.label}
                default={track.default}
              />
            ))}
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="px-4 py-2.5 bg-surface-1/50 border-t border-white/[0.06] flex items-center justify-between gap-3">
          {title && (
            <span className="text-sm text-text-secondary truncate">{title}</span>
          )}
          {captions && captions.length > 0 && (
            <button
              onClick={() => {
                if (!videoRef.current) return;
                const tracks = videoRef.current.textTracks;
                for (let i = 0; i < tracks.length; i++) {
                  tracks[i].mode = tracks[i].mode === "showing" ? "hidden" : "showing";
                }
              }}
              className="px-2 py-0.5 text-xs rounded transition-colors text-text-secondary/70 hover:text-text-secondary hover:bg-white/[0.04] border border-white/[0.06]"
              aria-label="Toggle captions"
              title="Toggle captions"
            >
              CC
            </button>
          )}
          <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label="Playback speed">
            <span className="text-xs text-text-secondary/60 mr-1">Speed:</span>
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                  playbackRate === s
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                    : "text-text-secondary/70 hover:text-text-secondary hover:bg-white/[0.04]"
                }`}
                aria-label={`${s}x speed`}
                aria-pressed={playbackRate === s}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // YouTube facade
  const ytId = resolvedSrc;
  // maxresdefault 404s for some videos; fall back to hqdefault
  const thumbnailUrl = poster
    ?? (thumbFailed
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`);
  const startParam = startAt ? `&start=${startAt}` : "";

  return (
    <div className="my-6 rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="relative aspect-video bg-surface-1">
        {!loaded ? (
          <button
            className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer"
            onClick={() => { setLoaded(true); handlePlay(); }}
            aria-label={`Play ${title}`}
            style={{
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Hidden probe to detect thumbnail 404 and trigger fallback */}
            {!thumbFailed && !poster && (
              <img
                src={thumbnailUrl}
                alt=""
                className="hidden"
                onError={() => setThumbFailed(true)}
              />
            )}
            <div className="absolute inset-0 bg-bg-primary/40" />
            <div className="relative w-16 h-16 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center group-hover:bg-neon-cyan/30 group-hover:scale-110 transition-all">
              <svg className="w-7 h-7 text-neon-cyan ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        ) : (
          <>
            {!iframeReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-1 z-10">
                <div className="w-10 h-10 border-3 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}${startParam}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
              onLoad={() => setIframeReady(true)}
            />
          </>
        )}
      </div>
      {title && (
        <div className="px-4 py-2.5 bg-surface-1/50 border-t border-white/[0.06]">
          <span className="text-sm text-text-secondary">{title}</span>
        </div>
      )}
    </div>
  );
}
