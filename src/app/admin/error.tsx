"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error.message);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-scale-in rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg">
          ⚠
        </div>
        <p className="mb-2 text-lg font-semibold text-[var(--t1)]">
          Something went wrong
        </p>
        <p className="mb-6 text-sm text-[var(--t3)]">
          {error.message || "Failed to load dashboard."}
        </p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
