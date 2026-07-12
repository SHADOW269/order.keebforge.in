"use client";

import { useToast } from "@/lib/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import TopProgressBar from "@/components/ui/TopProgressBar";
import NetworkIndicator from "@/components/ui/NetworkIndicator";

function ToastProvider() {
  const { toasts, dismiss } = useToast();
  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastProvider />
      <TopProgressBar />
      {children}
      <NetworkIndicator />
    </>
  );
}
