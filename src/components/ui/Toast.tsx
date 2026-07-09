"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface ToastItemProps {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  onDismiss: (id: string) => void;
}

function ToastItem({ id, message, type, onDismiss }: ToastItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    animate(ref.current as HTMLElement, {
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 400,
      easing: "easeOutExpo",
    });
  }, [reduced]);

  const handleDismiss = () => {
    if (!ref.current) {
      onDismiss(id);
      return;
    }
    if (reduced) {
      onDismiss(id);
      return;
    }
    animate(ref.current as HTMLElement, {
      translateY: -20,
      opacity: 0,
      duration: 300,
      easing: "easeInExpo",
      complete: () => onDismiss(id),
    });
  };

  const bg =
    type === "success"
      ? "bg-[var(--acc)] text-black"
      : type === "error"
        ? "bg-red-600 text-white"
        : "bg-[var(--bg1)] text-[var(--t1)] border border-[var(--bdr)]";

  const icon =
    type === "success" ? "✓" : type === "error" ? "✕" : "i";

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-2xl ${bg}`}
      role="alert"
    >
      <span>{icon}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={handleDismiss}
        className="ml-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: { id: string; message: string; type: "success" | "error" | "info" }[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
