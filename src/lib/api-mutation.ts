"use client";

import { topProgress } from "@/lib/hooks/useTopProgress";
import { taskNotification } from "@/lib/hooks/useTaskNotification";

interface MutationOptions<T = unknown> {
  action: (signal: AbortSignal) => Promise<Response>;
  onSuccess?: (result: T) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
  loadingTitle: string;
  loadingDescription?: string;
  successTitle?: string;
  successText: string;
  errorTitle?: string;
  errorPrefix?: string;
  minimumDuration?: number;
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
    loadingTitle,
    loadingDescription = "Please wait while your request is being processed.",
    successTitle = "Completed",
    successText,
    errorTitle = "Operation Failed",
    errorPrefix = "Failed",
    minimumDuration = 300,
  } = options;

  const controller = new AbortController();
  activeController = controller;

  const notificationId = taskNotification.loading(loadingTitle, loadingDescription);
  topProgress.start();
  const startTime = Date.now();

  try {
    let response: Response;
    try {
      response = await action(controller.signal);
    } catch {
      if (controller.signal.aborted) {
        taskNotification.dismiss(notificationId);
        return false;
      }
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDuration - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      topProgress.error();
      taskNotification.error(notificationId, errorTitle, "Network error. Please try again.");
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
      taskNotification.error(notificationId, errorTitle, "Unexpected server response. Please try again.");
      onError?.("Unexpected server response.");
      return false;
    }

    if (!response.ok) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDuration - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      topProgress.error();
      const message = (result as Record<string, unknown>).error as string || `${errorPrefix}. Please try again.`;
      taskNotification.error(notificationId, errorTitle, message);
      onError?.(message);
      return false;
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minimumDuration - elapsed);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    topProgress.complete();
    taskNotification.success(notificationId, successTitle, successText);
    onSuccess?.(result);
    return true;
  } catch {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minimumDuration - elapsed);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    topProgress.error();
    taskNotification.error(notificationId, errorTitle, "An unexpected error occurred.");
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
