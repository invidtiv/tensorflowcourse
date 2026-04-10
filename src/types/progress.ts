export interface ModuleProgress {
  theoryRead: boolean;
  theoryScrollPercent: number;
  labsCompleted: string[];
  quizScore: number | null;
  quizPassed: boolean;
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
