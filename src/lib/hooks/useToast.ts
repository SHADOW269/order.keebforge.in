"use client";

import { useCallback, useEffect, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration: number;
}

let toastListeners: Array<(toast: Toast) => void> = [];
let queueListeners: Array<(toasts: Toast[]) => void> = [];
let toastId = 0;
const pendingQueue: Toast[] = [];
let activeToasts: Toast[] = [];
const MAX_VISIBLE = 2;

function emitToast(message: string, type: Toast["type"], duration: number) {
  const t: Toast = { id: `toast_${++toastId}`, message, type, duration };
  toastListeners.forEach((l) => l(t));
}

function processQueue() {
  while (activeToasts.length < MAX_VISIBLE && pendingQueue.length > 0) {
    const next = pendingQueue.shift()!;
    activeToasts.push(next);
    setTimeout(() => {
      activeToasts = activeToasts.filter((t) => t.id !== next.id);
      queueListeners.forEach((l) => l([...activeToasts]));
      processQueue();
    }, next.duration);
  }
  queueListeners.forEach((l) => l([...activeToasts]));
}

export const toast = {
  success: (msg: string, duration = 3500) => emitToast(msg, "success", duration),
  error: (msg: string, duration = 5000) => emitToast(msg, "error", duration),
  info: (msg: string, duration = 3500) => emitToast(msg, "info", duration),
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(activeToasts);

  useEffect(() => {
    const listener = (t: Toast) => {
      pendingQueue.push(t);
      processQueue();
    };
    const queueListener = (t: Toast[]) => setToasts(t);

    toastListeners.push(listener);
    queueListeners.push(queueListener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
      queueListeners = queueListeners.filter((l) => l !== queueListener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    queueListeners.forEach((l) => l([...activeToasts]));
    processQueue();
  }, []);

  return { toasts, dismiss };
}
