"use client";

export default function TrackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="mb-4 text-sm font-medium text-red-400">
          {error.message || "Failed to load order."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--acc)] px-6 py-2.5 text-xs font-bold text-black transition hover:brightness-110"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
