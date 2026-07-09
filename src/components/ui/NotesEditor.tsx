"use client";

import { useState } from "react";
import { genId, formatDateTime } from "@/lib/types";

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export function NotesEditor({
  notes,
  onChange,
  placeholder = "Add a note...",
  badgeText,
  badgeClassName,
}: {
  notes: Note[];
  onChange: (notes: Note[]) => void;
  placeholder?: string;
  badgeText?: string;
  badgeClassName?: string;
}) {
  const [draft, setDraft] = useState("");

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    const note: Note = { id: genId("note"), text, createdAt: new Date().toISOString() };
    onChange([note, ...notes]);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      {badgeText && (
        <div className={`rounded-lg border p-3 text-xs ${badgeClassName || "border-[var(--bdr)] bg-[var(--surf)] text-[var(--t2)]"}`}>
          {badgeText}
        </div>
      )}

      <div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full resize-none rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3 text-sm text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={!draft.trim()}
          className="mt-2 rounded-lg border border-[var(--bdr)] bg-[var(--surf)] px-4 py-2 text-xs font-bold text-[var(--t1)] transition hover:bg-[var(--bg3)] disabled:opacity-40"
        >
          + Add Note
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--t3)]">
          Note History
        </p>
        {notes.length === 0 ? (
          <p className="text-xs italic text-[var(--t3)]">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3.5"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--acc)]">
                    Recorded
                  </span>
                  <span className="text-[10px] text-[var(--t3)]">
                    {formatDateTime(note.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--t2)]">
                  {note.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
