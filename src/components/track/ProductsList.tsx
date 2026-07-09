"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Product { id: string; type: string; name: string; }

const LABELS: Record<string, string> = {
  keyboard: "Keyboard",
  switch: "Switches",
  keycap: "Keycaps",
  mouse: "Mouse",
};

export default function ProductsList({ products }: { products: Product[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!gridRef.current || reduced) return;
    const items = gridRef.current.querySelectorAll("[data-product-card]");
    animate(items, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 400,
      delay: stagger(60),
      easing: "easeOutExpo",
    });
  }, [products, reduced]);

  const grouped = products.reduce<Record<string, string[]>>((acc, p) => {
    (acc[p.type] ||= []).push(p.name || "—");
    return acc;
  }, {});

  return (
    <div ref={gridRef} className="grid gap-4 sm:grid-cols-2">
      {Object.entries(grouped).map(([type, names]) => (
        <div key={type} data-product-card className="rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-4" style={reduced ? {} : { opacity: 0 }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--t3)]">
            {LABELS[type] ?? type}
          </p>
          <p className="mt-1 text-sm text-[var(--t1)] font-medium">{names.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
