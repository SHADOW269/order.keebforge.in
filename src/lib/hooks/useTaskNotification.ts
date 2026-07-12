"use client";

import { useCallback, useEffect, useState } from "react";

export type TaskStatus = "loading" | "success" | "error";

export interface TaskNotificationItem {
  id: string;
  status: TaskStatus;
  title: string;
  description: string;
  autoDismissMs?: number;
}

let taskListeners: Array<(tasks: TaskNotificationItem[]) => void> = [];
let activeTasks: TaskNotificationItem[] = [];
let taskId = 0;

function emit() {
  taskListeners.forEach((l) => l([...activeTasks]));
}

function upsert(task: Omit<TaskNotificationItem, "id"> & { id?: string }) {
  const id = task.id || `task_${++taskId}`;
  const existing = activeTasks.find((t) => t.id === id);
  if (existing) {
    existing.status = task.status;
    existing.title = task.title;
    existing.description = task.description;
    existing.autoDismissMs = task.autoDismissMs;
  } else {
    activeTasks.push({ ...task, id });
  }
  emit();
  return id;
}

function remove(id: string) {
  activeTasks = activeTasks.filter((t) => t.id !== id);
  emit();
}

export const taskNotification = {
  loading(title: string, description: string): string {
    return upsert({ status: "loading", title, description });
  },

  success(id: string, title: string, description: string) {
    upsert({ id, status: "success", title, description, autoDismissMs: 3000 });
  },

  error(id: string, title: string, description: string) {
    upsert({ id, status: "error", title, description, autoDismissMs: 5000 });
  },

  dismiss(id: string) {
    remove(id);
  },
};

export function useTaskNotification() {
  const [tasks, setTasks] = useState<TaskNotificationItem[]>(activeTasks);

  useEffect(() => {
    const listener = (t: TaskNotificationItem[]) => setTasks(t);
    taskListeners.push(listener);
    return () => {
      taskListeners = taskListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    taskNotification.dismiss(id);
  }, []);

  return { tasks, dismiss };
}
