"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { Spinner } from "@/components/ui/Loading";
import type { TaskNotificationItem } from "@/lib/hooks/useTaskNotification";

/* ─── Icons ────────────────────────────────────────────────────────── */

function CheckmarkIcon({ reduced }: { reduced: boolean }) {
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
      className="h-5 w-5 shrink-0 text-[var(--success)]"
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
      <svg className="h-5 w-5 text-[var(--error)]" viewBox="0 0 20 20" fill="none">
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

/* ─── Single Task Card ─────────────────────────────────────────────── */

function TaskCard({
  task,
  onDismiss,
}: {
  task: TaskNotificationItem;
  onDismiss: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  // Auto-dismiss on success/error
  useEffect(() => {
    if (task.status === "loading" || !task.autoDismissMs) return;
    const timer = setTimeout(() => onDismiss(task.id), task.autoDismissMs);
    return () => clearTimeout(timer);
  }, [task.status, task.autoDismissMs, task.id, onDismiss]);

  // Slide in on mount
  useEffect(() => {
    if (!ref.current || reduced) return;
    animRef.current?.pause();
    animRef.current = animate(ref.current, {
      translateX: [60, 0],
      opacity: [0, 1],
      duration: 350,
      easing: "easeOutExpo",
    });
  }, [reduced]);

  // Slide out on dismiss
  const handleDismiss = () => {
    if (!ref.current || reduced) {
      onDismiss(task.id);
      return;
    }
    animRef.current?.pause();
    animRef.current = animate(ref.current, {
      translateX: [0, 60],
      opacity: [1, 0],
      duration: 250,
      easing: "easeInExpo",
      complete: () => onDismiss(task.id),
    });
  };

  const borderColor =
    task.status === "loading"
      ? "border-[var(--acc)]/30"
      : task.status === "success"
        ? "border-[var(--success)]/30"
        : "border-[var(--error)]/30";

  return (
    <div
      ref={ref}
      className={`w-[320px] rounded-xl border ${borderColor} bg-[var(--bg1)]/95 p-4 shadow-xl backdrop-blur-md`}
      style={reduced ? undefined : { opacity: 0 }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {task.status === "loading" && <Spinner className="h-5 w-5 border-[1.5px]" />}
          {task.status === "success" && <CheckmarkIcon reduced={reduced} />}
          {task.status === "error" && <ErrorIcon reduced={reduced} />}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold text-[var(--t1)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            {task.title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--t3)]">
            {task.description}
          </p>
        </div>
        {task.status !== "loading" && (
          <button
            onClick={handleDismiss}
            className="shrink-0 text-[var(--t3)] transition hover:text-[var(--t1)]"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Container ────────────────────────────────────────────────────── */

export function TaskNotificationContainer({
  tasks,
  onDismiss,
}: {
  tasks: TaskNotificationItem[];
  onDismiss: (id: string) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[160] flex flex-col gap-3">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
