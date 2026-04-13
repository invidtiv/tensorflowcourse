export interface ModuleProgress {
  theoryRead: boolean;
  theoryScrollPercent: number;
  labsCompleted: string[];
  quizScore: number | null;
  quizPassed: boolean;
  /** Whether the student has started watching the module video. */
  videoWatched: boolean;
  /** Percentage of the video the student has watched (0–100). Updated via onTimeUpdate. */
  videoWatchedPercent: number;
  /** ISO timestamp when the student watched ≥90% of the video (or it ended). */
  videoFinishedAt: string;
  lastAccessed: string;
  timeSpentMinutes: number;
}

export interface OverallProgress {
  completedModules: number;
  totalTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  startedAt: string;
}

export interface ProgressState {
  modules: Record<string, ModuleProgress>;
  overall: OverallProgress;
}
