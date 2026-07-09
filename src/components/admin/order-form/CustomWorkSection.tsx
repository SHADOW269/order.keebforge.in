"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { Field, inputClass } from "@/components/ui/Field";
import type { CustomWorkItem } from "@/lib/types";

export function createCustomWorkItem(): CustomWorkItem {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    price: 0,
    quantity: 1,
    notes: "",
  };
}

export default function CustomWorkSection({
  title,
  items,
  onChange,
}: {
  title: string;
  items: CustomWorkItem[];
  onChange: (items: CustomWorkItem[]) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const reduced = useReducedMotion();
  const prevCountRef = useRef(items.length);

  useEffect(() => {
    if (reduced) return;
    const prev = prevCountRef.current;
    prevCountRef.current = items.length;
    if (items.length <= prev) return;

    const container = document.getElementById(`cw-list-${title.replace(/\s+/g, "-")}`);
    if (!container) return;
    const cards = container.querySelectorAll("[data-cw-card]");
    if (!cards.length) return;
    animate(cards[cards.length - 1], {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 350,
      easing: "easeOutExpo",
    });
  }, [items.length, reduced, title]);

  function addItem() {
    onChange([...items, createCustomWorkItem()]);
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function updateItem(id: string, patch: Partial<CustomWorkItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  const listId = `cw-list-${title.replace(/\s+/g, "-")}`;

  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left transition hover:bg-[var(--surf)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-[var(--t1)]">{title}</span>
          {items.length > 0 && (
            <span className="rounded-full bg-[var(--acc-dim)] px-2 py-0.5 text-[10px] font-bold text-[var(--acc)]">
              {items.length} added
            </span>
          )}
        </div>
        <span
          className="text-[var(--t3)] text-xs transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--bdr)] p-4">
          <button
            type="button"
            onClick={addItem}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--bdr)] bg-[var(--surf)] px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[var(--t2)] transition-all duration-200 hover:border-[var(--acc)]/40 hover:text-[var(--acc)] hover:bg-[var(--acc-dim)]"
          >
            + Add Custom Work
          </button>

          <div id={listId} className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                data-cw-card
                className="rounded-xl border border-[var(--bdr)] bg-[var(--bg1)] p-5 space-y-4 transition-all duration-200 hover:border-[var(--bdr-h)]"
                style={reduced ? {} : { opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--t3)]">
                    Custom Work #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 rounded-full border border-[var(--bdr)] px-3 py-1 text-[10px] font-bold text-[var(--t3)] transition-all duration-200 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5"
                  >
                    Remove
                  </button>
                </div>

                <Field label="Work Title" required>
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Hand-wired Matrix Repair"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Brief description of the work"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Price">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-xs text-[var(--t3)]">₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.price || ""}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                          updateItem(item.id, { price: cleaned === "" ? 0 : Number(cleaned) });
                        }}
                        className={`${inputClass} pl-7`}
                        placeholder="0"
                      />
                    </div>
                  </Field>
                  <Field label="Quantity">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Notes">
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Any additional notes about this work"
                  />
                </Field>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-center text-xs text-[var(--t3)] py-6">
                No custom work added yet. Click &ldquo;+ Add Custom Work&rdquo; to add one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
