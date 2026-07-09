"use client";

import type { CustomerNote } from "@/lib/types";
import { NoteTimeline } from "@/components/ui/NoteTimeline";

export default function AdminToCustomerSection({
  notes,
  onChange,
}: {
  notes: CustomerNote[];
  onChange: (notes: CustomerNote[]) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--acc)]">
          Admin &rarr; Customer
        </p>
        <span className="rounded-full border border-[var(--acc)]/20 bg-[var(--acc-dim)] px-2.5 py-0.5 text-[9px] font-bold text-[var(--acc)]">
          Visible on Tracking Page
        </span>
      </div>
      <NoteTimeline
        notes={notes}
        onChange={onChange}
        placeholder="Add a public update (visible to customer)..."
      />
    </div>
  );
}
