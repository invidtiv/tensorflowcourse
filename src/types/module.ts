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
