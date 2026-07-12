"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type NetworkStatus = "saved" | "saving" | "error" | "offline" | "hidden";

let networkListeners: Array<(status: NetworkStatus) => void> = [];
let currentStatus: NetworkStatus = "saved";

function emit(status: NetworkStatus) {
  currentStatus = status;
  networkListeners.forEach((l) => l(status));
}

export const networkStatus = {
  saving() { emit("saving"); },
  saved() { emit("saved"); },
  error() { emit("error"); },
};

export default function NetworkIndicator() {
  const [status, setStatus] = useState<NetworkStatus>(currentStatus);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const listener = (s: NetworkStatus) => setStatus(s);
    networkListeners.push(listener);
    return () => {
      networkListeners = networkListeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      emit("saved");
    };
    const handleOffline = () => {
      emit("offline");
    };

    if (!navigator.onLine) emit("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (status === "saved" || status === "error") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (status === "saved" || status === "error") {
          setStatus("hidden");
        }
      }, status === "error" ? 5000 : 2000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status]);

  const config: Record<NetworkStatus, { dot: string; text: string; show: boolean }> = {
    saved: { dot: "bg-emerald-400", text: "All changes saved", show: false },
    saving: { dot: "bg-yellow-400 animate-pulse-fast", text: "Saving...", show: true },
    error: { dot: "bg-red-400", text: "Failed to save", show: true },
    offline: { dot: "bg-[var(--t3)]", text: "Offline", show: true },
    hidden: { dot: "", text: "", show: false },
  };

  const { dot, text, show } = config[status];
  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-[var(--bdr)] bg-[var(--bg1)]/90 px-3 py-1.5 text-[10px] font-medium text-[var(--t2)] backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
