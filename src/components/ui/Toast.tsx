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

function SuccessIcon({ reduced }: { reduced: boolean }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || reduced) return;
    animate(ref.current, {
      scale: [0, 1.2, 1],
      rotate: ["-90deg", "0deg"],
      duration: 400,
      easing: "easeOutExpo",
    });
  }, [reduced]);

  return (
    <svg
      ref={ref}
      className="h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 10.5l2.5 2.5 5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || reduced) return;
    animate(ref.current, {
      translateX: [0, -4, 4, -2, 2, 0],
      duration: 400,
      easing: "easeInOutSine",
    });
  }, [reduced]);

  return (
    <div ref={ref} className="shrink-0" aria-hidden="true">
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 7l6 6M13 7l-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
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
    if (!ref.current || reduced) {
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

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-2xl ${bg}`}
      role="alert"
    >
      {type === "success" && <SuccessIcon reduced={reduced} />}
      {type === "error" && <ErrorIcon reduced={reduced} />}
      {type === "info" && <InfoIcon />}
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
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
