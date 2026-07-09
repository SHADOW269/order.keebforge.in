"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface TimelineEntry {
  status: string;
  note: string | null;
  created_at: string;
}

function relativeLabel(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOf(now).getTime() - startOf(date).getTime()) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} Days Ago`;
}

export default function RealTimeline({ entries }: { entries: TimelineEntry[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!listRef.current || reduced) return;
    const items = listRef.current.querySelectorAll("[data-timeline-item]");
    animate(items, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 500,
      delay: stagger(80, { start: 50 }),
      easing: "easeOutExpo",
    });
  }, [entries, reduced]);

  if (entries.length === 0) {
    return <p className="text-xs italic text-[var(--t3)]">No updates yet.</p>;
  }
  return (
    <ol ref={listRef} className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
      {entries.map((e) => (
        <li
          key={`${e.created_at}-${e.status}`}
          data-timeline-item
          className="relative border-l border-[var(--bdr)] pl-5"
          style={reduced ? {} : { opacity: 0 }}
        >
          <span className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-[var(--acc)] border border-[var(--bg1)]" />
          <p
            className="text-[10px] font-bold uppercase tracking-wider text-[var(--acc)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            {relativeLabel(e.created_at)}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[var(--t1)]">{e.status}</p>
          {e.note && <p className="mt-1 text-xs text-[var(--t2)] leading-relaxed">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}
