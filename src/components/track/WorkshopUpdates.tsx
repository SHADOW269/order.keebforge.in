"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { formatDateTime } from "@/lib/types";

interface CustomerNote { id: string; text: string; createdAt: string; }

export default function WorkshopUpdates({ notes }: { notes: CustomerNote[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!listRef.current || reduced) return;
    const items = listRef.current.querySelectorAll("[data-note-item]");
    animate(items, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 500,
      delay: stagger(70),
      easing: "easeOutExpo",
    });
  }, [notes, reduced]);

  if (notes.length === 0) {
    return <p className="text-xs italic text-[var(--t3)]">No updates yet.</p>;
  }
  return (
    <ul ref={listRef} className="space-y-3">
      {notes.map((n) => (
        <li key={n.id} data-note-item className="rounded-lg border border-[var(--bdr)] bg-[var(--bg3)] p-3.5" style={reduced ? {} : { opacity: 0 }}>
          <p className="mb-1 text-[10px] text-[var(--t3)]">{formatDateTime(n.createdAt)}</p>
          <p className="whitespace-pre-wrap text-xs text-[var(--t2)] leading-relaxed">{n.text}</p>
        </li>
      ))}
    </ul>
  );
}
