"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModuleProgress, OverallProgress } from "@/types/progress";

interface UserPreferences {
  /** Preferred video playback speed. Persisted across modules/sessions. */
  videoPlaybackRate: number;
  /** Whether captions should be shown by default whenever a video mounts.
   *  Honoured by VideoEmbed when no per-track `default` flag is set. */
  captionsDefault: boolean;
  /** Whether the per-video transcript panel should start expanded.
   *  Sticky across modules so a user who prefers transcripts always sees them. */
  lastTranscriptVisible: boolean;
}

const defaultPreferences: UserPreferences = {
  videoPlaybackRate: 1,
  captionsDefault: false,
  lastTranscriptVisible: false,
};

interface ProgressStore {
  modules: Record<string, ModuleProgress>;
  overall: OverallProgress;
  preferences: UserPreferences;

  // Actions
  setVideoPlaybackRate: (rate: number) => void;
  setCaptionsDefault: (on: boolean) => void;
  setLastTranscriptVisible: (on: boolean) => void;
  isVideoWatched: (moduleId: string) => boolean;
  markVideoWatched: (moduleId: string) => void;
  updateVideoProgress: (moduleId: string, percent: number) => void;
  markVideoFinished: (moduleId: string) => void;
  /** Persist the learner's playback position + cumulative watched-seconds.
   *  Called by VideoEmbed on timeupdate alongside updateVideoProgress. */
  updateVideoPosition: (moduleId: string, seconds: number, watchedDelta?: number) => void;
  /** Read-only resume helper — returns the last saved playback position or 0. */
  getVideoResumeTime: (moduleId: string) => number;
  markTheoryRead: (moduleId: string) => void;
  updateTheoryScroll: (moduleId: string, percent: number) => void;
  markLabCompleted: (moduleId: string, labId: string) => void;
  setQuizScore: (moduleId: string, score: number, total: number, passingScore: number) => void;
  updateTimeSpent: (moduleId: string, minutes: number) => void;
  getModuleProgress: (moduleId: string) => ModuleProgress;
  getModuleCompletionPercent: (moduleId: string, totalLabs: number) => number;
  /** Returns true when all four completion signals are met:
   *  video watched (≥90%), theory read, all labs completed, quiz passed.
   *  Provides a single boolean gate for CompletionBadge and module-card UI. */
  isModuleComplete: (moduleId: string, totalLabs: number) => boolean;
  resetModule: (moduleId: string) => void;
  resetAll: () => void;
}

const defaultModuleProgress: ModuleProgress = {
  theoryRead: false,
  theoryScrollPercent: 0,
  labsCompleted: [],
  quizScore: null,
  quizPassed: false,
  videoWatched: false,
  videoWatchedPercent: 0,
  videoFinishedAt: "",
  videoLastPosition: 0,
  videoWatchedSeconds: 0,
  lastAccessed: "",
  timeSpentMinutes: 0,
};

const defaultOverall: OverallProgress = {
  completedModules: 0,
  totalTimeMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  startedAt: "",
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      modules: {},
      overall: { ...defaultOverall },
      preferences: { ...defaultPreferences },

      setVideoPlaybackRate: (rate) =>
        set((state) => {
          // Clamp to the supported range [0.25, 4] so a bad write never wedges the player.
          const clamped = Math.min(4, Math.max(0.25, Number.isFinite(rate) ? rate : 1));
          return {
            preferences: { ...state.preferences, videoPlaybackRate: clamped },
          };
        }),

      setCaptionsDefault: (on) =>
        set((state) => ({
          preferences: { ...state.preferences, captionsDefault: !!on },
        })),

      setLastTranscriptVisible: (on) =>
        set((state) => ({
          preferences: { ...state.preferences, lastTranscriptVisible: !!on },
        })),

      isVideoWatched: (moduleId) => {
        // Used by the quiz watch-gate. "Watched" = explicitly finished OR ≥90% progress.
        // Matches the same threshold used by `getModuleCompletionPercent`.
        const m = get().modules[moduleId];
        if (!m) return false;
        return !!m.videoFinishedAt || m.videoWatchedPercent >= 90;
      },

      markVideoWatched: (moduleId) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: {
              ...(state.modules[moduleId] || { ...defaultModuleProgress }),
              videoWatched: true,
              lastAccessed: new Date().toISOString(),
            },
          },
        })),

      updateVideoProgress: (moduleId, percent) =>
        set((state) => {
          const current = state.modules[moduleId] || { ...defaultModuleProgress };
          const clamped = Math.min(100, Math.max(0, Math.round(percent)));
          const isFinished = clamped >= 90 && !current.videoFinishedAt;
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...current,
                videoWatchedPercent: Math.max(current.videoWatchedPercent, clamped),
                videoWatched: true,
                ...(isFinished ? { videoFinishedAt: new Date().toISOString() } : {}),
                lastAccessed: new Date().toISOString(),
              },
            },
          };
        }),

      markVideoFinished: (moduleId) =>
        set((state) => {
          const current = state.modules[moduleId] || { ...defaultModuleProgress };
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...current,
                videoWatched: true,
                videoWatchedPercent: 100,
                videoFinishedAt: current.videoFinishedAt || new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
              },
            },
          };
        }),

      updateVideoPosition: (moduleId, seconds, watchedDelta = 0) =>
        set((state) => {
          const current = state.modules[moduleId] || { ...defaultModuleProgress };
          const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? seconds : 0;
          // Only credit forward play toward watched-seconds — ignore scrubs and
          // negative deltas. Callers can pass 0 when they cannot compute a delta.
          const credit =
            Number.isFinite(watchedDelta) && watchedDelta > 0 && watchedDelta < 10
              ? watchedDelta
              : 0;
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...current,
                videoLastPosition: safeSeconds,
                videoWatchedSeconds: current.videoWatchedSeconds + credit,
                lastAccessed: new Date().toISOString(),
              },
            },
          };
        }),

      getVideoResumeTime: (moduleId) => {
        const m = get().modules[moduleId];
        if (!m) return 0;
        // Don't resume finished videos — start fresh for a rewatch.
        if (m.videoFinishedAt) return 0;
        return Number.isFinite(m.videoLastPosition) ? m.videoLastPosition : 0;
      },

      markTheoryRead: (moduleId) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: {
              ...(state.modules[moduleId] || { ...defaultModuleProgress }),
              theoryRead: true,
              lastAccessed: new Date().toISOString(),
            },
          },
        })),

      updateTheoryScroll: (moduleId, percent) =>
        set((state) => {
          const current = state.modules[moduleId] || { ...defaultModuleProgress };
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...current,
                theoryScrollPercent: Math.max(current.theoryScrollPercent, percent),
                theoryRead: percent >= 90 ? true : current.theoryRead,
                lastAccessed: new Date().toISOString(),
              },
            },
          };
        }),

      markLabCompleted: (moduleId, labId) =>
        set((state) => {
          const current = state.modules[moduleId] || { ...defaultModuleProgress };
          const labs = current.labsCompleted.includes(labId)
            ? current.labsCompleted
            : [...current.labsCompleted, labId];
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...current,
                labsCompleted: labs,
                lastAccessed: new Date().toISOString(),
              },
            },
          };
        }),

      setQuizScore: (moduleId, score, total, passingScore) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: {
              ...(state.modules[moduleId] || { ...defaultModuleProgress }),
              quizScore: score,
              quizPassed: (score / total) * 100 >= passingScore,
              lastAccessed: new Date().toISOString(),
            },
          },
        })),

      updateTimeSpent: (moduleId, minutes) =>
        set((state) => {
          const current = state.modules[moduleId] || { ...defaultModuleProgress };
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...current,
                timeSpentMinutes: current.timeSpentMinutes + minutes,
              },
            },
            overall: {
              ...state.overall,
              totalTimeMinutes: state.overall.totalTimeMinutes + minutes,
            },
          };
        }),

      getModuleProgress: (moduleId) => {
        return get().modules[moduleId] || { ...defaultModuleProgress };
      },

      getModuleCompletionPercent: (moduleId, totalLabs) => {
        const mod = get().modules[moduleId] || { ...defaultModuleProgress };
        let completed = 0;
        const total = 4; // video + theory + labs + quiz
        if (mod.videoWatchedPercent >= 90 || mod.videoFinishedAt) completed++;
        if (mod.theoryRead) completed++;
        if (totalLabs > 0 && mod.labsCompleted.length >= totalLabs) completed++;
        if (mod.quizPassed) completed++;
        return Math.round((completed / total) * 100);
      },

      isModuleComplete: (moduleId, totalLabs) => {
        const mod = get().modules[moduleId] || { ...defaultModuleProgress };
        const videoOk = mod.videoWatchedPercent >= 90 || !!mod.videoFinishedAt;
        const theoryOk = mod.theoryRead;
        const labsOk = totalLabs === 0 || mod.labsCompleted.length >= totalLabs;
        const quizOk = mod.quizPassed;
        return videoOk && theoryOk && labsOk && quizOk;
      },

      resetModule: (moduleId) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: { ...defaultModuleProgress },
          },
        })),

      resetAll: () =>
        set({
          modules: {},
          overall: { ...defaultOverall },
          preferences: { ...defaultPreferences },
        }),
    }),
    {
      name: "tf-course-progress",
    }
  )
);
