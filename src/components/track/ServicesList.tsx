"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { SERVICE_BY_ID } from "@/constants/services";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export default function ServicesList({
  selectedServices,
}: {
  selectedServices: Record<string, number>;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!listRef.current || reduced) return;
    const items = listRef.current.querySelectorAll("[data-service-item]");
    animate(items, {
      opacity: [0, 1],
      translateX: [-8, 0],
      duration: 400,
      delay: stagger(50),
      easing: "easeOutExpo",
    });
  }, [selectedServices, reduced]);

  const ids = Object.keys(selectedServices || {});
  if (ids.length === 0) {
    return <p className="text-xs italic text-[var(--t3)]">No services selected.</p>;
  }
  return (
    <ul ref={listRef} className="space-y-2.5">
      {ids.map((id) => {
        const svc = SERVICE_BY_ID[id];
        if (!svc) return null;
        const qty = selectedServices[id];
        return (
          <li key={id} data-service-item className="flex items-center gap-2 text-sm text-[var(--t1)]" style={reduced ? {} : { opacity: 0 }}>
            <span className="text-[var(--acc)]">✓</span>
            <span>{svc.name}</span>
            {(svc.unit === "per_switch" || svc.unit === "per_stabilizer") && qty > 1 && (
              <span className="text-xs text-[var(--t3)]">× {qty}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
