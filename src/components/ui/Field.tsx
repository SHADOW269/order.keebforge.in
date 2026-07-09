export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--t3)]">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <div className="rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] transition-all duration-200 focus-within:border-[var(--acc)]/20 focus-within:shadow-[0_0_0_1.5px_var(--acc),0_8px_24px_rgba(0,0,0,0.3)]">
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full bg-transparent p-3 text-sm text-[var(--t1)] !outline-none border-none shadow-none";
