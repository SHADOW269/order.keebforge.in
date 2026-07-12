"use client";

import { useEffect, useRef, useCallback } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ButtonLoader } from "@/components/ui/Loading";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const reduced = useReducedMotion();
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const animateOut = useCallback(() => {
    if (!cardRef.current || reduced) {
      onCancel();
      return;
    }
    animRef.current?.pause();
    animRef.current = animate(cardRef.current, {
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 200,
      easing: "easeInExpo",
      complete: () => onCancel(),
    });
  }, [onCancel, reduced]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        animateOut();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => confirmBtnRef.current?.focus(), 50);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, animateOut]);

  useEffect(() => {
    if (!open || !cardRef.current || reduced) return;
    animRef.current?.pause();
    animRef.current = animate(cardRef.current, {
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 300,
      easing: "easeOutExpo",
    });
  }, [open, reduced]);

  useEffect(() => {
    if (open && reduced) {
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      if (cardRef.current) cardRef.current.style.opacity = "1";
    }
  }, [open, reduced]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-desc" : undefined}
      style={reduced ? { opacity: 1 } : { opacity: 0 }}
      onClick={(e) => {
        if (e.target === backdropRef.current) animateOut();
      }}
    >
      <div
        ref={cardRef}
        className="mx-4 w-full max-w-md rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-6 shadow-2xl"
        style={reduced ? undefined : { opacity: 0 }}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-[var(--t1)]"
          style={{ fontFamily: "var(--ff-d)" }}
        >
          {title}
        </h2>
        {description && (
          <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-[var(--t2)]">
            {description}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={animateOut}
            disabled={loading}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <ButtonLoader
            ref={confirmBtnRef}
            variant={variant === "danger" ? "danger" : "primary"}
            loading={loading}
            loadingText={confirmLabel}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {confirmLabel}
          </ButtonLoader>
        </div>
      </div>
    </div>
  );
}
