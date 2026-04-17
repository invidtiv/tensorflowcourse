export interface ModuleMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: number[];
  objectives: string[];
  icon: string;
  color: string;
  labCount: number;
  /** Optional: YouTube video ID for an intro lecture (used by <VideoEmbed type="youtube" src={...} />). */
  videoId?: string;
  /** Optional: self-hosted MP4 path (e.g., "/videos/module-01.mp4") for a localhost lecture. */
  videoUrl?: string;
  /** Optional: array of caption/subtitle tracks for the self-hosted MP4.
   *  Each entry has { src, srclang, label, default?, kind? }.
   *  Example: [{ src: "/videos/captions/01-intro-en.vtt", srclang: "en", label: "English", default: true }]
   */
  videoCaptions?: Array<{
    src: string;
    srclang: string;
    label: string;
    default?: boolean;
    kind?: "captions" | "subtitles";
  }>;
  /** Optional: VTT transcript path for <VideoTranscript>. Populated as a placeholder for m01–m10 in slot 33. */
  transcriptUrl?: string;
  /** Optional: WebVTT chapter cues path for the intro video. Stretch field — not yet consumed. */
  chaptersUrl?: string;
}

export interface LabMeta {
  id: string;
  title: string;
  description: string;
  moduleNumber: number;
  labNumber: number;
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface ModuleContent {
  meta: ModuleMeta;
  theoryContent: string;
  labs: LabMeta[];
}
