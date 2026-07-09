"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { Cpu, Wrench, Hammer } from "lucide-react";
import OrderSearch from "@/components/ui/OrderSearch";

const NAV_LINKS = [
  { label: "Home", href: "https://keebforge.in/" },
  { label: "About", href: "https://keebforge.in/About/" },
  { label: "Services", href: "https://keebforge.in/#services" },
  { label: "Contact", href: "https://keebforge.in/contact" },
];

const STATS = [
  { icon: Cpu, label: "Switches Serviced", target: 600, suffix: "+" },
  { icon: Wrench, label: "Keyboard Repairs", target: 80, suffix: "+" },
  { icon: Hammer, label: "Custom Builds", target: 50, suffix: "+" },
];

function getShowSuccess() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("success") === "true";
}

export default function Home() {
  const [orderNumber, setOrderNumber] = useState("");
  const [showSuccess] = useState(getShowSuccess);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const router = useRouter();
  const reduced = useReducedMotion();

  const pageRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (reduced) return;

    const a = (el: HTMLElement | null, p: Parameters<typeof animate>[1]) => { if (el) animate(el, p); };

    a(badgeRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 500, easing: "easeOutExpo" });
    a(headingRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 200, easing: "easeOutExpo" });
    a(descRef.current, { opacity: [0, 1], translateY: [16, 0], duration: 500, delay: 300, easing: "easeOutExpo" });
    a(searchRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 450, easing: "easeOutExpo", scale: [0.98, 1] });
    a(hintRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 400, delay: 600, easing: "easeOutExpo" });
    a(footerRef.current, { opacity: [0, 1], duration: 800, delay: 800, easing: "easeOutExpo" });
  }, [reduced]);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible || reduced) return;

    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      animate(el, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: i * 100,
        easing: "easeOutExpo",
      });
    });

    STATS.forEach((stat, i) => {
      const counter = { value: 0 };
      animate(counter, {
        value: stat.target,
        duration: 1200,
        delay: 300 + i * 100,
        easing: "easeOutExpo",
        onUpdate: () => {
          setCounts((prev) => {
            if (prev[i] === Math.floor(counter.value)) return prev;
            const next = [...prev];
            next[i] = Math.floor(counter.value);
            return next;
          });
        },
      });
    });
  }, [statsVisible, reduced]);

  const handleSubmit = (order: string) => {
    router.push(`/track/${order}`);
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col bg-[#0a0910] text-[#f5f5fa] relative overflow-hidden font-sans antialiased"
    >
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#7c6ff2]/10 to-transparent blur-3xl pointer-events-none z-0" />

      <nav className="w-full h-16 border-b border-white/10 bg-[#0a0910]/80 backdrop-blur-md z-50 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <a
            href="https://keebforge.in/"
            className="text-sm font-bold tracking-wider uppercase transition-colors hover:text-[#c9f31d]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            KeebForge<span className="text-[#c9f31d]">.</span>in
          </a>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#9494a6]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="https://keebforge.in/order/"
            className={cn(
              "text-[10px] font-bold tracking-[0.15em] uppercase",
              "border border-[#c9f31d]/30 text-[#c9f31d] bg-[#c9f31d]/5",
              "px-4 py-2 rounded-full",
              "hover:bg-[#c9f31d] hover:text-black",
              "transition-all duration-300",
              "shadow-[0_0_15px_rgba(201,243,29,0.05)]",
              "text-center"
            )}
          >
            Place an Order
          </a>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 flex flex-col justify-center py-10 lg:py-20 relative z-10">
        {showSuccess && (
          <div
            ref={successRef}
            className="rounded-xl border border-[#c9f31d]/30 bg-[#c9f31d]/5 p-4"
            style={reduced ? {} : { opacity: 0 }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider text-[#c9f31d] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Build Registered
            </p>
            <p className="text-xs text-[#aeaebc] leading-relaxed">
              Your order receipt parameter is validated. Submit your system verification key code beneath to inspect performance metrics.
            </p>
          </div>
        )}

        <div className="space-y-5 mb-10">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1"
            style={reduced ? {} : { opacity: 0 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9f31d] animate-live-pulse" />
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#9494a6] font-mono">
              System Live // Diagnostic Node
            </p>
          </div>

          <h1
            ref={headingRef}
            className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-[#f5f5fa]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", ...(reduced ? {} : { opacity: 0 }) }}
          >
            Trace Your Custom Build<span className="text-[#c9f31d]">.</span>
          </h1>

          <p
            ref={descRef}
            className="text-sm text-[#aeaebc] leading-relaxed max-w-md"
            style={reduced ? {} : { opacity: 0 }}
          >
            Enter your order number to see real-time progress on your keyboard build, switch mod, or repair.
          </p>
        </div>

        <div ref={searchRef} style={reduced ? {} : { opacity: 0 }}>
          <OrderSearch
            value={orderNumber}
            onChange={setOrderNumber}
            onSubmit={handleSubmit}
          />
        </div>

        <p
          ref={hintRef}
          className="text-[11px] text-[#9494a6] leading-relaxed w-full font-mono mt-4"
          style={reduced ? {} : { opacity: 0 }}
        >
          Your order number is at the top of the confirmation email we sent you. It starts with <span className="text-[#c9f31d] font-bold">KF</span>.
        </p>

        <div
          ref={statsRef}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                ref={(el) => { if (el) cardsRef.current[i] = el; }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#0f0e17]/60 p-5",
                  "transition-all duration-300",
                  "hover:border-[#c9f31d]/20 hover:bg-[#0f0e17] hover:-translate-y-0.5",
                )}
                style={reduced ? {} : { opacity: 0 }}
              >
                <Icon className="w-5 h-5 text-[#c9f31d]/70" strokeWidth={1.5} />
                <span
                  className="text-2xl md:text-3xl font-bold text-[#c9f31d] tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {statsVisible ? counts[i] : 0}{stat.suffix}
                </span>
                <span className="text-[11px] text-[#9494a6] text-center leading-snug">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      <footer
        ref={footerRef as React.RefObject<HTMLElement>}
        className="w-full border-t border-white/5 py-4 mt-auto z-10 font-mono text-[9px] text-[#9494a6] text-center"
      >
        &copy; 2026 KEEBFORGE.in // ELECTRONICS ENGINEER // TRACK_ROUTER // END
      </footer>
    </div>
  );
}
