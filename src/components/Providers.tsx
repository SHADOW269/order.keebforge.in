"use client";

import { useToast } from "@/lib/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

function ToastProvider() {
  const { toasts, dismiss } = useToast();
  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastProvider />
      {children}
    </>
  );
}
