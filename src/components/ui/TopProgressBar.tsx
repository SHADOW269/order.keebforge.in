"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useTopProgress } from "@/lib/hooks/useTopProgress";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export default function TopProgressBar() {
  const { phase } = useTopProgress();
  const reduced = useReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (reduced) return;

    if (phase === "loading") {
      if (!barRef.current || !containerRef.current) return;
      animRef.current?.pause();

      containerRef.current.style.opacity = "1";
      barRef.current.style.backgroundColor = "var(--acc)";

      animRef.current = animate(barRef.current, {
        scaleX: [0, 0.3],
        duration: 200,
        easing: "easeOutQuad",
        complete: () => {
          animRef.current = animate(barRef.current!, {
            scaleX: [0.3, 0.6],
            duration: 400,
            easing: "easeOutCubic",
            complete: () => {
              animRef.current = animate(barRef.current!, {
                scaleX: [0.6, 0.8],
                duration: 600,
                easing: "easeOutCubic",
                complete: () => {
                  animRef.current = animate(barRef.current!, {
                    scaleX: [0.8, 0.88],
                    duration: 2000,
                    easing: "easeInOutSine",
                  });
                },
              });
            },
          });
        },
      });
    } else if (phase === "complete" || phase === "error") {
      if (!barRef.current || !containerRef.current) return;
      animRef.current?.pause();

      if (phase === "error") {
        barRef.current.style.backgroundColor = "var(--error)";
      }

      animRef.current = animate(barRef.current, {
        scaleX: 1,
        duration: 300,
        easing: "easeOutCubic",
        complete: () => {
          setTimeout(() => {
            if (!containerRef.current || !barRef.current) return;
            animate(containerRef.current, {
              opacity: [1, 0],
              duration: 200,
              easing: "easeOutCubic",
              complete: () => {
                if (barRef.current) {
                  barRef.current.style.transform = "scaleX(0)";
                  barRef.current.style.backgroundColor = "var(--acc)";
                }
                if (containerRef.current) {
                  containerRef.current.style.opacity = "0";
                }
              },
            });
          }, 300);
        },
      });
    }

    return () => {
      animRef.current?.pause();
    };
  }, [phase, reduced]);

  if (reduced && phase === "loading") {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[200] h-[3px]"
        style={{ backgroundColor: "var(--acc)", opacity: 0.7 }}
        aria-hidden="true"
        role="presentation"
      />
    );
  }

  if (phase === "idle") return null;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 z-[200] h-[3px]"
      aria-hidden="true"
      role="presentation"
    >
      <div
        ref={barRef}
        className="h-full origin-left"
        style={{
          backgroundColor: "var(--acc)",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
