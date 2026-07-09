"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search…",
  required,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between bg-transparent p-3 text-left text-sm outline-none transition ${
          value ? "text-[var(--t1)]" : "text-[var(--t3)]"
        }`}
      >
        <span>{value || "Select state / UT"}</span>
        <span className="text-[var(--t3)] text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full border-b border-[var(--bdr)] bg-[var(--bg3)] p-3 text-sm text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40 placeholder-[var(--t3)]"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-[var(--t3)]">No matches.</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-[var(--acc-dim)] hover:text-[var(--acc)] ${
                    opt === value ? "text-[var(--acc)]" : "text-[var(--t1)]"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}