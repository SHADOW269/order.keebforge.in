"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ProductEntry, ProductType, genId } from "./types";

const PRODUCT_TYPE_META: Record<ProductType, { label: string; placeholder: string }> = {
  keyboard: { label: "Keyboard", placeholder: "e.g. Mode Sonnet, Neo65" },
  switch: { label: "Switch", placeholder: "e.g. Gateron Oil King" },
  keycap: { label: "Keycaps", placeholder: "e.g. GMK Olivia" },
  mouse: { label: "Mouse", placeholder: "e.g. Logitech G Pro X Superlight" },
  pcb: { label: "PCB", placeholder: "e.g. H87, ProjectKeyboard" },
  components: { label: "Components", placeholder: "e.g. Stabilizers, Foam, Cables" },
};

const PRODUCT_TYPES: ProductType[] = ["keyboard", "switch", "keycap", "mouse", "pcb", "components"];

export default function ProductsSection({
  products,
  onChange,
}: {
  products: ProductEntry[];
  onChange: (products: ProductEntry[]) => void;
}) {
  const reduced = useReducedMotion();
  const prevCountRef = useRef(products.length);

  useEffect(() => {
    if (reduced) return;
    const prev = prevCountRef.current;
    prevCountRef.current = products.length;
    if (products.length <= prev) return;

    const container = document.getElementById("products-list");
    if (!container) return;
    const cards = container.querySelectorAll("[data-product-card]");
    if (!cards.length) return;
    animate(cards[cards.length - 1], {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 350,
      easing: "easeOutExpo",
    });
  }, [products.length, reduced]);

  function addProduct(type: ProductType) {
    onChange([...products, { id: genId("prod"), type, name: "" }]);
  }

  function updateProduct(id: string, name: string) {
    onChange(products.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function removeProduct(id: string) {
    onChange(products.filter((p) => p.id !== id));
  }

  function toggleProduct(id: string) {
    const existing = products.find((p) => p.id === id);
    if (existing) {
      removeProduct(id);
    }
  }

  const grouped = PRODUCT_TYPES.map((type) => ({
    type,
    meta: PRODUCT_TYPE_META[type],
    entries: products.filter((p) => p.type === type),
  }));

  return (
    <div className="space-y-6">
      {/* Add buttons */}
      <div className="flex flex-wrap gap-2">
        {PRODUCT_TYPES.map((type) => {
          const meta = PRODUCT_TYPE_META[type];
          const count = products.filter((p) => p.type === type).length;
          return (
            <button
              key={type}
              type="button"
              onClick={() => addProduct(type)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bdr)] bg-[var(--bg2)] px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[var(--t2)] transition-all duration-200 hover:border-[var(--acc)]/40 hover:text-[var(--acc)] hover:bg-[var(--acc-dim)]"
            >
              + {meta.label}
              {count > 0 && (
                <span className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--acc-dim)] text-[0.5rem] font-bold text-[var(--acc)]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Product cards */}
      <div id="products-list" className="space-y-2">
        {grouped.map(({ type, meta, entries }) =>
          entries.map((entry) => (
            <div
              key={entry.id}
              data-product-card
              className="flex items-center gap-3 rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-3 transition-all duration-200 hover:border-[var(--bdr-h)] focus-within:border-[var(--acc)]/20 focus-within:shadow-[0_0_0_1.5px_var(--acc),0_8px_24px_rgba(0,0,0,0.3)]"
            >
              <span className="shrink-0 rounded-lg bg-[var(--acc-dim)]/60 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-[var(--acc)]">
                {meta.label}
              </span>
              <input
                value={entry.name}
                onChange={(e) => updateProduct(entry.id, e.target.value)}
                placeholder={meta.placeholder}
                className="flex-1 min-w-0 bg-transparent text-sm text-[var(--t1)] !outline-none border-none shadow-none placeholder-[var(--t3)]"
                autoFocus={entry.name === ""}
              />
              <button
                type="button"
                onClick={() => removeProduct(entry.id)}
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-[var(--bdr)] text-[0.6rem] text-[var(--t3)] transition-all duration-200 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5"
                aria-label={`Remove ${meta.label}`}
              >
                ✕
              </button>
            </div>
          ))
        )}
        {products.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--bdr)] p-8 text-center text-sm text-[var(--t3)]">
            No products added yet. Click a product type above to add one.
          </div>
        )}
      </div>
    </div>
  );
}
