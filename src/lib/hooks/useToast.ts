"use client";

import { useCallback, useEffect, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastListeners: Array<(toast: Toast) => void> = [];
let toastId = 0;

function emitToast(message: string, type: Toast["type"] = "info") {
  const toast: Toast = { id: `toast_${++toastId}`, message, type };
  toastListeners.forEach((l) => l(toast));
}

export const toast = {
  success: (msg: string) => emitToast(msg, "success"),
  error: (msg: string) => emitToast(msg, "error"),
  info: (msg: string) => emitToast(msg, "info"),
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3500);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { toasts, dismiss };
}
