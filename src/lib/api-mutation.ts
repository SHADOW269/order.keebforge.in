"use client";

import { topProgress } from "@/lib/hooks/useTopProgress";
import { toast } from "@/lib/hooks/useToast";

interface MutationOptions<T = unknown> {
  action: (signal: AbortSignal) => Promise<Response>;
  onSuccess?: (result: T) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
  successText: string;
  errorPrefix?: string;
  minimumDuration?: number;
  destructive?: boolean;
}

let running = false;
let activeController: AbortController | null = null;

export async function withLoading<T = unknown>(options: MutationOptions<T>): Promise<boolean> {
  if (running) return false;
  running = true;

  const {
    action,
    onSuccess,
    onError,
    onSettled,
    successText,
    errorPrefix = "Failed",
    minimumDuration = 300,
    destructive = false,
  } = options;

  const controller = new AbortController();
  activeController = controller;

  topProgress.start();
  const startTime = Date.now();

  try {
    let response: Response;
    try {
      response = await action(controller.signal);
    } catch {
      if (controller.signal.aborted) {
        return false;
      }
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDuration - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      topProgress.error();
      toast.error("Network error. Please try again.", destructive ? 5000 : undefined);
      onError?.("Network error. Please try again.");
      return false;
    }

    let result: T;
    try {
      result = await response.json();
    } catch {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDuration - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      topProgress.error();
      toast.error("Unexpected server response. Please try again.", destructive ? 5000 : undefined);
      onError?.("Unexpected server response.");
      return false;
    }

    if (!response.ok) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDuration - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      topProgress.error();
      const message = (result as Record<string, unknown>).error as string || `${errorPrefix}. Please try again.`;
      toast.error(message, destructive ? 5000 : undefined);
      onError?.(message);
      return false;
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minimumDuration - elapsed);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    topProgress.complete();
    toast.success(successText, destructive ? 5000 : undefined);
    onSuccess?.(result);
    return true;
  } catch {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minimumDuration - elapsed);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    topProgress.error();
    toast.error("An unexpected error occurred.", destructive ? 5000 : undefined);
    onError?.("An unexpected error occurred.");
    return false;
  } finally {
    running = false;
    activeController = null;
    onSettled?.();
  }
}

export function cancelCurrentMutation() {
  activeController?.abort();
}
