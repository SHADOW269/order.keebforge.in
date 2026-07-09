// src/components/track/WarrantyCard.tsx
export default function WarrantyCard({
  status, start, end,
}: { status: string; start: string | null; end: string | null }) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--t3)]">Status</p>
        <p className="mt-0.5 font-semibold text-[var(--acc)]">{status}</p>
      </div>
      {start && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--t3)]">Warranty Start</p>
          <p className="mt-0.5 text-[var(--t1)]">{start}</p>
        </div>
      )}
      {end && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--t3)]">Warranty End</p>
          <p className="mt-0.5 text-[var(--t1)]">{end}</p>
        </div>
      )}
    </div>
  );
}