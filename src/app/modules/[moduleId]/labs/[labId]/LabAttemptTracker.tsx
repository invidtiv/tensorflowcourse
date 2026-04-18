"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/stores/progressStore";

interface Props {
  moduleId: string;
  labId: string;
}

/**
 * Invisible client component mounted inside the server-rendered lab page.
 * Calls `startLabAttempt` once on mount so we record when the student
 * opened the lab — enabling the analytics timeline.
 */
export default function LabAttemptTracker({ moduleId, labId }: Props) {
  const startLabAttempt = useProgressStore((s) => s.startLabAttempt);

  useEffect(() => {
    startLabAttempt(moduleId, labId);
    // Only fire once when this lab page mounts — not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, labId]);

  return null;
}
