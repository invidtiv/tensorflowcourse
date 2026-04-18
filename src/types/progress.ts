export interface LabAttempt {
  labId: string;
  startedAt: string;   // ISO
  completedAt?: string; // ISO, set when lab marked done
}

export interface QuizQuestionAttempt {
  questionId: string;
  answeredAt: string;       // ISO
  choiceIndex: number;      // which choice the user picked
  correctIndex: number;     // the right answer (0-based index)
  isCorrect: boolean;
  attemptNumber: number;    // 1-indexed quiz attempt
}

export interface ModuleProgress {
  theoryRead: boolean;
  theoryScrollPercent: number;
  labsCompleted: string[];
  labAttempts: LabAttempt[];              // new — append-only log
  quizScore: number | null;
  quizPassed: boolean;
  quizAttempts: number;                   // total quiz submission count
  quizQuestionAttempts: QuizQuestionAttempt[]; // per-question log
  /** Whether the student has started watching the module video. */
  videoWatched: boolean;
  /** Percentage of the video the student has watched (0–100). Updated via onTimeUpdate. */
  videoWatchedPercent: number;
  /** ISO timestamp when the student watched ≥90% of the video (or it ended). */
  videoFinishedAt: string;
  /** Last-known playback position in seconds. Used by VideoEmbed to resume
   *  where the learner left off across reloads. Updated alongside
   *  videoWatchedPercent on timeupdate. */
  videoLastPosition: number;
  /** Cumulative watched-seconds estimate. Incremented by the delta between
   *  timeupdate ticks so scrubbing doesn't inflate the count. Used to drive
   *  the true "watched minutes" metric independent of video length. */
  videoWatchedSeconds: number;
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
