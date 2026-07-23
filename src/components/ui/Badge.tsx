import { STATUS_BADGE_COLORS } from "@/constants/order-statuses";

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
  const color = STATUS_BADGE_COLORS[status] ?? "bg-[var(--surf)] text-[var(--t2)] border-[var(--bdr)]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
