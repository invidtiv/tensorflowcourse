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
  /** Optional chapters/cues VTT file rendered as <track kind="chapters">.
   *  Modern browsers expose chapter cues to the native controls UI (Chrome,
   *  Edge) and to assistive tech (cue events). Authors should ship a WebVTT
   *  file whose cue payloads are short chapter titles, e.g.:
   *  ```
   *  WEBVTT
   *
   *  00:00.000 --> 02:30.000
   *  Hook & motivation
   *
   *  02:30.000 --> 09:45.000
   *  Concept walkthrough
   *  ```
   *  Per Point 5.2 of the course plan, this surfaces the 30–60s hook → 3–5min
   *  concept → 5–10min demo structure directly in the player UI.
   *  YouTube ignores this — chapters there come from the description timestamps. */
  chapters?: string;
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
  chapters,
}: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const markVideoWatched = useProgressStore((s) => s.markVideoWatched);
  const updateVideoProgress = useProgressStore((s) => s.updateVideoProgress);
  const markVideoFinished = useProgressStore((s) => s.markVideoFinished);
  const updateVideoPosition = useProgressStore((s) => s.updateVideoPosition);
  const getVideoResumeTime = useProgressStore((s) => s.getVideoResumeTime);

  // Unified play handler: fires the external onPlay callback (if any) AND
  // marks the video as watched in the progress store (if moduleId is set).
  const handlePlay = useCallback(() => {
    onPlay?.();
    if (moduleId) {
      markVideoWatched(moduleId);
    }
  }, [onPlay, moduleId, markVideoWatched]);

  // Track playback progress for the native <video> branch.
  // Throttled: percentage updates fire on ≥5% deltas; position + watched-seconds
  // fire every ~2 seconds of wall-clock playback via `lastPositionRef`.
  const lastReportedPct = useState(0);
  const lastPositionRef = useRef<number>(0);
  const lastPositionTickRef = useRef<number>(0);
  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!moduleId) return;
    const vid = e.currentTarget;
    if (!vid.duration || vid.duration === Infinity) return;
    const pct = Math.round((vid.currentTime / vid.duration) * 100);
    if (Math.abs(pct - lastReportedPct[0]) >= 5) {
      lastReportedPct[0] = pct;
      updateVideoProgress(moduleId, pct);
    }
    // Persist resume position + credit forward play to watched-seconds.
    const now = vid.currentTime;
    const prev = lastPositionRef.current;
    const delta = now - prev;
    // Credit only forward deltas ≤2.5s (natural playback window). Scrubs > 2.5s
    // or backward jumps reset the anchor without crediting watched-seconds.
    const credit = delta > 0 && delta <= 2.5 ? delta : 0;
    lastPositionRef.current = now;
    // Throttle store writes to once per ~2s to avoid thrashing persistence.
    if (now - lastPositionTickRef.current >= 2) {
      lastPositionTickRef.current = now;
      updateVideoPosition(moduleId, now, credit);
    }
    // Broadcast to any paired <VideoTranscript> so it can highlight the active
    // cue. Fires every timeupdate (~4 Hz on most browsers) — VideoTranscript
    // debounces internally by only updating state when the cue index changes.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tfc:transcript-time", {
          detail: { videoId: videoId ?? null, time: now },
        }),
      );
    }
  }, [moduleId, updateVideoProgress, lastReportedPct, updateVideoPosition, videoId]);

  // Resume from the last-known position when the MP4 metadata loads.
  // No-op for finished videos (getVideoResumeTime returns 0 in that case).
  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!moduleId) return;
    const resumeAt = getVideoResumeTime(moduleId);
    const vid = e.currentTarget;
    if (resumeAt > 1 && vid.duration && resumeAt < vid.duration - 5) {
      try {
        vid.currentTime = resumeAt;
        lastPositionRef.current = resumeAt;
        lastPositionTickRef.current = resumeAt;
      } catch {
        /* seeking can throw on some mobile browsers pre-load; safe to skip */
      }
    }
  }, [moduleId, getVideoResumeTime]);

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

  // Respect prefers-reduced-motion for accessible animations
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Picture-in-Picture state — only valid for the MP4 branch.
  // `pipSupported`: true if the browser supports the PiP API.
  // `isPip`: tracks whether *this* VideoEmbed is currently the PiP window.
  const [pipSupported, setPipSupported] = useState(false);
  const [isPip, setIsPip] = useState(false);
  useEffect(() => {
    setPipSupported(typeof document !== "undefined" && "pictureInPictureEnabled" in document);
  }, []);
  useEffect(() => {
    const onEnterPip = () => setIsPip(true);
    const onLeavePip = () => setIsPip(false);
    const vid = videoRef.current;
    if (!vid) return;
    vid.addEventListener("enterpictureinpicture", onEnterPip);
    vid.addEventListener("leavepictureinpicture", onLeavePip);
    return () => {
      vid.removeEventListener("enterpictureinpicture", onEnterPip);
      vid.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  });

  const handlePip = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await vid.requestPictureInPicture();
      }
    } catch {
      // PiP may be blocked by browser policy (e.g. no user gesture) — fail silently.
    }
  }, []);

  // Playback speed — sourced from the persisted Zustand preference so the user's
  // chosen speed survives reloads and propagates to every module's player.
  const persistedRate = useProgressStore((s) => s.preferences?.videoPlaybackRate ?? 1);
  const setPersistedRate = useProgressStore((s) => s.setVideoPlaybackRate);
  const captionsDefault = useProgressStore((s) => s.preferences?.captionsDefault ?? false);
  const setCaptionsDefault = useProgressStore((s) => s.setCaptionsDefault);
  const [playbackRate, setPlaybackRate] = useState(persistedRate);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Keep local state in sync if another VideoEmbed instance changes the store.
  useEffect(() => {
    setPlaybackRate(persistedRate);
    if (videoRef.current) videoRef.current.playbackRate = persistedRate;
  }, [persistedRate]);

  // Apply persisted captionsDefault preference on mount (and when captions list changes).
  // Skips chapters tracks — those are always passive metadata. Respects per-track `default`
  // flag if any caption track already has it set (authored opt-in wins).
  useEffect(() => {
    if (!captionsDefault) return;
    const vid = videoRef.current;
    if (!vid || !captions || captions.length === 0) return;
    const authoredDefault = captions.some((t) => t.default);
    if (authoredDefault) return; // the <track default> will already auto-show.
    // Native TextTrackList is populated asynchronously; poll briefly.
    const apply = () => {
      const tracks = vid.textTracks;
      if (tracks.length === 0) return false;
      let applied = false;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind !== "chapters" && tracks[i].mode !== "showing") {
          tracks[i].mode = "showing";
          applied = true;
          break; // first caption track only — matches user expectation.
        }
      }
      return applied;
    };
    if (!apply()) {
      const t = setTimeout(apply, 120);
      return () => clearTimeout(t);
    }
  }, [captionsDefault, captions]);

  // Listen for transcript cue clicks (from <VideoTranscript>) and seek the
  // <video> element. The event contract is documented in VideoTranscript.tsx.
  // YouTube facades ignore the event — the <iframe> postMessage API could
  // handle this later (Phase 5b stretch), but keeping the MP4 path for now.
  useEffect(() => {
    const onSeek = (e: Event) => {
      const detail = (e as CustomEvent<{ videoId?: string | null; time: number }>).detail;
      if (!detail || typeof detail.time !== "number") return;
      // If both sides declare a videoId, require a match so multiple players
      // on one page don't all jump when a single transcript cue is clicked.
      if (detail.videoId && videoId && detail.videoId !== videoId) return;
      const vid = videoRef.current;
      if (!vid) return;
      try {
        vid.currentTime = Math.max(0, detail.time);
        void vid.play().catch(() => {
          // Autoplay blocked — the learner can press play manually.
        });
      } catch {
        /* noop */
      }
    };
    window.addEventListener("tfc:transcript-seek", onSeek as EventListener);
    return () => window.removeEventListener("tfc:transcript-seek", onSeek as EventListener);
  }, [videoId]);

  const handleSpeedChange = useCallback(
    (speed: number) => {
      setPlaybackRate(speed);
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
      setPersistedRate(speed);
    },
    [setPersistedRate],
  );

  // Keyboard shortcuts for MP4 player (only when container is focused).
  // Space/K = play/pause, ←/→ = seek ±5s, ↑/↓ = volume ±10%, M = mute,
  // </> = playback speed down/up, F = fullscreen toggle.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const vid = videoRef.current;
    if (!vid) return;

    // Don't intercept when a button inside the container is focused
    const tag = (e.target as HTMLElement).tagName?.toLowerCase();
    if (tag === "button" && e.key === " ") return;

    switch (e.key) {
      case " ":
      case "k":
      case "K":
        e.preventDefault();
        vid.paused ? vid.play() : vid.pause();
        break;
      case "ArrowLeft":
        e.preventDefault();
        vid.currentTime = Math.max(0, vid.currentTime - 5);
        break;
      case "ArrowRight":
        e.preventDefault();
        vid.currentTime = Math.min(vid.duration || Infinity, vid.currentTime + 5);
        break;
      case "ArrowUp":
        e.preventDefault();
        vid.volume = Math.min(1, vid.volume + 0.1);
        break;
      case "ArrowDown":
        e.preventDefault();
        vid.volume = Math.max(0, vid.volume - 0.1);
        break;
      case "m":
      case "M":
        e.preventDefault();
        vid.muted = !vid.muted;
        break;
      case "f":
      case "F":
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          containerRef.current?.requestFullscreen?.();
        }
        break;
      case "p":
      case "P":
        e.preventDefault();
        void handlePip();
        break;
      case "<":
      case ",": {
        e.preventDefault();
        const idx = speeds.indexOf(playbackRate);
        if (idx > 0) handleSpeedChange(speeds[idx - 1]);
        break;
      }
      case ">":
      case ".": {
        e.preventDefault();
        const idx = speeds.indexOf(playbackRate);
        if (idx < speeds.length - 1) handleSpeedChange(speeds[idx + 1]);
        break;
      }
    }
  }, [playbackRate, handleSpeedChange, speeds]);

  // Read video watch progress from the store for the progress indicator.
  const videoProgress = useProgressStore((s) =>
    moduleId ? (s.modules[moduleId]?.videoWatchedPercent ?? 0) : 0,
  );
  const videoFinished = useProgressStore((s) =>
    moduleId ? !!(s.modules[moduleId]?.videoFinishedAt) : false,
  );

  if (resolvedType === "mp4") {
    // mp4 start-at uses media fragment (#t=SS)
    const mp4Src = startAt ? `${resolvedSrc}#t=${startAt}` : resolvedSrc;
    return (
      <div
        ref={containerRef}
        className="my-6 rounded-xl border border-white/[0.06] overflow-hidden focus-within:ring-1 focus-within:ring-neon-cyan/30"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label={`Video player: ${title}`}
      >
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
            onLoadedMetadata={handleLoadedMetadata}
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
            {chapters && (
              // Chapters track exposes cue metadata to native controls + a11y.
              // No `default` flag — chapters tracks are always passive metadata.
              <track
                key="chapters"
                src={chapters}
                kind="chapters"
                srcLang="en"
                label="Chapters"
              />
            )}
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="px-4 py-2.5 bg-surface-1/50 border-t border-white/[0.06] flex items-center justify-between gap-3">
          {title && (
            <span className="text-sm text-text-secondary truncate">{title}</span>
          )}
          {pipSupported && (
            <button
              onClick={handlePip}
              className={`px-2 py-0.5 text-xs rounded transition-colors border ${
                isPip
                  ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40"
                  : "text-text-secondary/70 hover:text-text-secondary hover:bg-white/[0.04] border-white/[0.06]"
              }`}
              aria-label={isPip ? "Exit picture-in-picture" : "Enter picture-in-picture"}
              title={isPip ? "Exit picture-in-picture" : "Picture-in-picture"}
            >
              PiP
            </button>
          )}
          {captions && captions.length > 0 && (
            <button
              onClick={() => {
                if (!videoRef.current) return;
                const tracks = videoRef.current.textTracks;
                // Detect any currently-showing caption/subtitle track (skip chapters — always passive).
                let anyShowing = false;
                for (let i = 0; i < tracks.length; i++) {
                  if (tracks[i].kind !== "chapters" && tracks[i].mode === "showing") {
                    anyShowing = true;
                    break;
                  }
                }
                const nextMode: TextTrackMode = anyShowing ? "hidden" : "showing";
                for (let i = 0; i < tracks.length; i++) {
                  if (tracks[i].kind !== "chapters") {
                    tracks[i].mode = nextMode;
                  }
                }
                // Persist user intent so captions default across modules.
                if (setCaptionsDefault) setCaptionsDefault(nextMode === "showing");
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
        {/* Video progress indicator + keyboard hint */}
        {moduleId && (
          <div className="px-4 py-1.5 bg-surface-1/30 border-t border-white/[0.04] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    videoFinished ? "bg-emerald-400" : "bg-neon-cyan/70"
                  }`}
                  style={{ width: `${videoFinished ? 100 : videoProgress}%` }}
                />
              </div>
              <span className="text-[11px] text-text-secondary/50 whitespace-nowrap">
                {videoFinished ? "Watched" : videoProgress > 0 ? `${videoProgress}%` : "Not started"}
              </span>
            </div>
            <span className="text-[10px] text-text-secondary/30 hidden sm:inline" aria-hidden="true">
              Space: play/pause &middot; ←→: seek &middot; M: mute &middot; F: fullscreen &middot; P: PiP
            </span>
          </div>
        )}
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
            <div className={`relative w-16 h-16 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center group-hover:bg-neon-cyan/30 ${reducedMotion ? "" : "group-hover:scale-110 transition-all"}`}>
              <svg className="w-7 h-7 text-neon-cyan ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        ) : (
          <>
            {!iframeReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-1 z-10">
                <div className={`w-10 h-10 border-3 border-neon-cyan/30 border-t-neon-cyan rounded-full ${reducedMotion ? "" : "animate-spin"}`} />
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
      <div className="px-4 py-2.5 bg-surface-1/50 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {title && (
          <span className="text-sm text-text-secondary truncate">{title}</span>
        )}
        {moduleId && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  videoFinished ? "bg-emerald-400" : "bg-neon-cyan/70"
                }`}
                style={{ width: `${videoFinished ? 100 : videoProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-text-secondary/50 whitespace-nowrap">
              {videoFinished ? "Watched" : videoProgress > 0 ? `${videoProgress}%` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
