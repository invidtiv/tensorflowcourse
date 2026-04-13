"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModuleProgress, OverallProgress } from "@/types/progress";

interface ProgressStore {
  modules: Record<string, ModuleProgress>;
  overall: OverallProgress;

  // Actions
  markVideoWatched: (moduleId: string) => void;
  updateVideoProgress: (moduleId: string, percent: number) => void;
  markVideoFinished: (moduleId: string) => void;
  markTheoryRead: (moduleId: string) => void;
  updateTheoryScroll: (moduleId: string, percent: number) => void;
  markLabCompleted: (moduleId: string, labId: string) => void;
  setQuizScore: (moduleId: string, score: number, total: number, passingScore: number) => void;
  updateTimeSpent: (moduleId: string, minutes: number) => void;
  getModuleProgress: (moduleId: string) => ModuleProgress;
  getModuleCompletionPercent: (moduleId: string, totalLabs: number) => number;
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
        const total = 3; // theory + labs + quiz
        if (mod.theoryRead) completed++;
        if (totalLabs > 0 && mod.labsCompleted.length >= totalLabs) completed++;
        if (mod.quizPassed) completed++;
        return Math.round((completed / total) * 100);
      },

      resetModule: (moduleId) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [moduleId]: { ...defaultModuleProgress },
          },
        })),

      resetAll: () =>
        set({ modules: {}, overall: { ...defaultOverall } }),
    }),
    {
      name: "tf-course-progress",
    }
  )
);
