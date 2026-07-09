"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { ORDER_STATUSES } from "@/constants/order-statuses";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export default function BuildProgress({ currentStatus }: { currentStatus: string }) {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus as (typeof ORDER_STATUSES)[number]);
  const listRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!listRef.current || reduced) return;
    const items = listRef.current.querySelectorAll("[data-step]");
    animate(items, {
      opacity: [0, 1],
      translateX: [-8, 0],
      duration: 400,
      delay: stagger(40, { start: 100 }),
      easing: "easeOutExpo",
    });
  }, [reduced]);

  return (
    <div ref={listRef} className="relative max-h-[50vh] overflow-y-auto pr-2 space-y-4">
      <div className="absolute left-[17px] top-3 bottom-3 w-[1px] bg-[var(--bdr)]" />
      {ORDER_STATUSES.map((status, index) => {
        const completed = index < currentIndex;
        const active = index === currentIndex;
        return (
          <div key={status} data-step className="relative flex items-center gap-4 group" style={reduced ? {} : { opacity: 0 }}>
            <div
              className="z-10 h-9 w-9 rounded-full border flex items-center justify-center font-bold text-sm transition-all duration-300"
              style={{
                backgroundColor: completed ? "var(--acc)" : "var(--bg2)",
                borderColor: completed || active ? "var(--acc)" : "var(--bdr)",
                boxShadow: active ? "0 0 0 4px var(--acc-dim)" : "none",
              }}
            >
              {completed ? (
                <span className="text-[#000] text-xs">✓</span>
              ) : (
                <span
                  className="text-xs font-sans transition-colors"
                  style={{ color: active ? "var(--acc)" : "var(--t3)" }}
                >
                  {index + 1}
                </span>
              )}
            </div>
            <span
              className="text-xs font-bold tracking-wide uppercase transition-colors"
              style={{
                fontFamily: "var(--ff-d)",
                color: active ? "var(--acc)" : completed ? "var(--t2)" : "var(--t3)",
              }}
            >
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
