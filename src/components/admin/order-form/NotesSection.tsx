"use client";

import type { InternalNote } from "@/lib/types";
import { NoteTimeline } from "@/components/ui/NoteTimeline";

export default function NotesSection({
  notes,
  onChange,
}: {
  notes: InternalNote[];
  onChange: (notes: InternalNote[]) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
          Admin Internal Notes
        </p>
        <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-0.5 text-[9px] font-bold text-amber-300">
          Private
        </span>
      </div>
      <NoteTimeline
        notes={notes}
        onChange={onChange}
        placeholder="Add an internal note (build details, reminders, customer quirks...)"
      />
    </div>
  );
}
