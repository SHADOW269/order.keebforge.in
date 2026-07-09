"use client";

import { useState } from "react";
import { genId, formatDateTime, dateLabel } from "@/lib/types";

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export function NoteTimeline({
  notes,
  onChange,
  placeholder = "Add a note...",
}: {
  notes: Note[];
  onChange: (notes: Note[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    const note: Note = { id: genId("note"), text, createdAt: new Date().toISOString() };
    onChange([note, ...notes]);
    setDraft("");
  }

  function startEdit(id: string, text: string) {
    setEditingId(id);
    setEditText(text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function saveEdit(id: string) {
    const text = editText.trim();
    if (!text) return;
    onChange(notes.map((n) => (n.id === id ? { ...n, text } : n)));
    setEditingId(null);
    setEditText("");
  }

  function deleteNote(id: string) {
    onChange(notes.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
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

      {/* Timeline */}
      <div className="relative pl-5">
        {notes.length === 0 ? (
          <p className="text-xs italic text-[var(--t3)]">No notes yet.</p>
        ) : (
          <ul className="space-y-4">
            {notes.map((note, idx) => (
              <li key={note.id} className="relative">
                {/* Timeline dot + line */}
                <span
                  className="absolute -left-5 top-1.5 h-2 w-2 rounded-full border-2"
                  style={{
                    borderColor: "var(--acc)",
                    backgroundColor: idx === 0 ? "var(--acc)" : "transparent",
                  }}
                />
                {idx < notes.length - 1 && (
                  <span
                    className="absolute -left-[13.5px] top-[18px] bottom-0 w-px"
                    style={{ backgroundColor: "var(--bdr)" }}
                  />
                )}

                {/* Card */}
                <div className="rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3.5 transition hover:border-[var(--bdr-h)]">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--acc)]">
                      {dateLabel(note.createdAt)}
                    </span>
                    <span className="text-[10px] text-[var(--t3)]">
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>

                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border border-[var(--bdr)] bg-[var(--bg1)] p-2.5 text-sm text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(note.id)}
                          disabled={!editText.trim()}
                          className="rounded-md border border-[var(--acc)]/30 bg-[var(--acc-dim)] px-3 py-1 text-[10px] font-bold text-[var(--acc)] transition hover:bg-[var(--acc)]/20 disabled:opacity-40"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md border border-[var(--bdr)] px-3 py-1 text-[10px] font-bold text-[var(--t3)] transition hover:bg-[var(--surf)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--t2)]">
                        {note.text}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(note.id, note.text)}
                          className="rounded-md border border-[var(--bdr)] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--t3)] transition hover:border-[var(--acc)]/30 hover:text-[var(--acc)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNote(note.id)}
                          className="rounded-md border border-[var(--bdr)] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--t3)] transition hover:border-red-500/30 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
