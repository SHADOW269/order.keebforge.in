"use client";

import { useCallback, useEffect, useState } from "react";

type ProgressPhase = "idle" | "loading" | "complete" | "error";

interface ProgressState {
  phase: ProgressPhase;
}

let progressListeners: Array<(state: ProgressState) => void> = [];
let currentPhase: ProgressPhase = "idle";

function emit(phase: ProgressPhase) {
  currentPhase = phase;
  progressListeners.forEach((l) => l({ phase }));
}

function setPhase(phase: ProgressPhase) {
  if (currentPhase === phase) return;
  emit(phase);
}

export const topProgress = {
  start() {
    setPhase("loading");
  },
  complete() {
    setPhase("complete");
  },
  error() {
    setPhase("error");
  },
};

export function useTopProgress() {
  const [state, setState] = useState<ProgressState>({ phase: currentPhase });

  useEffect(() => {
    const listener = (s: ProgressState) => setState(s);
    progressListeners.push(listener);
    return () => {
      progressListeners = progressListeners.filter((l) => l !== listener);
    };
  }, []);

  const start = useCallback(() => topProgress.start(), []);
  const complete = useCallback(() => topProgress.complete(), []);
  const error = useCallback(() => topProgress.error(), []);

  return { ...state, start, complete, error };
}
