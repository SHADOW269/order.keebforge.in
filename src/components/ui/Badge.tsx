export function MiniBadge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "popular" | "highlight" | "combo";
}) {
  const toneClass =
    tone === "popular"
      ? "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30"
      : tone === "highlight"
        ? "bg-sky-500/10 text-sky-300 border-sky-500/25"
        : tone === "combo"
          ? "bg-violet-500/10 text-violet-300 border-violet-500/25"
          : "bg-[var(--surf)] text-[var(--t2)] border-[var(--bdr)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${toneClass}`}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    "Order Received": "bg-sky-500/15 text-sky-300 border-sky-500/25",
    "Order Confirmed": "bg-sky-500/15 text-sky-300 border-sky-500/25",
    "Payment Pending": "bg-amber-500/15 text-amber-300 border-amber-500/25",
    "Payment Received": "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    "In Queue": "bg-violet-500/15 text-violet-300 border-violet-500/25",
    "Work Started": "bg-orange-500/15 text-orange-300 border-orange-500/25",
    Testing: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    Completed: "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30",
    "In Transit": "bg-sky-500/15 text-sky-300 border-sky-500/25",
    Delivered: "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30",
    "Testing Warranty Active": "bg-lime-500/15 text-lime-300 border-lime-500/25",
    "Order Completed": "bg-[var(--acc-dim)] text-[var(--acc)] border-[var(--acc)]/30",
  };

  const color =
    colorMap[status] ?? "bg-[var(--surf)] text-[var(--t2)] border-[var(--bdr)]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
