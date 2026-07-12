"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/* ─── Spinner ──────────────────────────────────────────────────────── */

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-[var(--bdr)] border-t-[var(--acc)] ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ─── FullPageLoading (server-compatible, no "use client") ─────────── */

export function FullPageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex flex-col items-center justify-center gap-3">
      <Spinner />
      <p className="font-mono text-xs tracking-wider text-[var(--t3)]">
        {message}
      </p>
    </div>
  );
}

/* ─── ButtonLoader ─────────────────────────────────────────────────── */

interface ButtonLoaderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export const ButtonLoader = forwardRef<HTMLButtonElement, ButtonLoaderProps>(
  function ButtonLoader(
    {
      loading = false,
      loadingText,
      variant = "primary",
      children,
      className,
      disabled,
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(variantClasses[variant], className)}
        {...rest}
      >
        {loading && loadingText ? (
          <>
            <Spinner className="h-4 w-4 border-[1.5px]" />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

/* ─── LoadingOverlay ───────────────────────────────────────────────── */

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

export function LoadingOverlay({ loading, message = "Please wait while we process your request." }: LoadingOverlayProps) {
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const showScheduled = useRef(false);

  useEffect(() => {
    if (loading && !showScheduled.current) {
      showScheduled.current = true;
      timeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, 700);
    }

    if (!loading) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (showScheduled.current) {
        showScheduled.current = false;
        setVisible(false);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading]);

  useEffect(() => {
    if (!visible || !overlayRef.current || reduced) return;
    animate(overlayRef.current, {
      opacity: [0, 1],
      scale: [0.97, 1],
      duration: 300,
      easing: "easeOutExpo",
    });
  }, [visible, reduced]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[140] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      style={reduced ? undefined : { opacity: 0 }}
    >
      <Spinner className="h-10 w-10 border-[3px]" />
      <p className="mt-4 max-w-xs text-center font-mono text-xs leading-relaxed tracking-wider text-[var(--t2)]">
        {message}
      </p>
    </div>
  );
}
