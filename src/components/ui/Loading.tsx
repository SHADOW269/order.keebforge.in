export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-[var(--bdr)] border-t-[var(--acc)] ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

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
