"use client";

import { useToast } from "@/lib/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { useTaskNotification } from "@/lib/hooks/useTaskNotification";
import { TaskNotificationContainer } from "@/components/ui/TaskNotification";
import TopProgressBar from "@/components/ui/TopProgressBar";
import NetworkIndicator from "@/components/ui/NetworkIndicator";

function ToastProvider() {
  const { toasts, dismiss } = useToast();
  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

function TaskNotificationProvider() {
  const { tasks, dismiss } = useTaskNotification();
  return <TaskNotificationContainer tasks={tasks} onDismiss={dismiss} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastProvider />
      <TopProgressBar />
      <TaskNotificationProvider />
      {children}
      <NetworkIndicator />
    </>
  );
}
