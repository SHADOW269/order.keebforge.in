"use client";

import { useRef } from "react";
import { animate } from "animejs";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
}

export default function OrderSearch({
  value,
  onChange,
  onSubmit,
  loading = false,
  error,
  placeholder = "ENTER ORDER NUMBER",
}: OrderSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = value.trim().toUpperCase();
    if (!clean) {
      if (inputRef.current) {
        animate(inputRef.current as HTMLElement, {
          translateX: [0, -6, 6, -4, 4, 0],
          duration: 400,
          easing: "easeInOutSine",
        });
      }
      return;
    }
    animate(buttonRef.current as HTMLElement, {
      scale: [1, 0.95, 1],
      duration: 300,
      easing: "easeOutExpo",
    });
    onSubmit(clean);
  };

  const handleMouseEnter = () => {
    if (buttonRef.current && !loading) {
      animate(buttonRef.current, {
        scale: 1.02,
        duration: 200,
        easing: "easeOutExpo",
      });
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      animate(buttonRef.current, {
        scale: 1,
        duration: 200,
        easing: "easeOutExpo",
      });
    }
  };

  const handlePaste = () => {
    setTimeout(() => {
      if (inputRef.current && inputRef.current.value.trim().toUpperCase() !== value) {
        onChange(inputRef.current.value.trim().toUpperCase());
        if (buttonRef.current) {
          animate(buttonRef.current as HTMLElement, {
            scale: [1, 1.05, 1],
            duration: 300,
            easing: "easeOutExpo",
          });
        }
      }
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "flex items-stretch rounded-full border transition-all duration-200",
          "bg-[#111118] shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
          "focus-within:border-[var(--acc)]/20 focus-within:shadow-[0_0_0_1.5px_var(--acc),0_10px_30px_rgba(0,0,0,0.35)]",
          error
            ? "border-red-500/30"
            : "border-white/[0.08] hover:border-white/[0.12]",
        )}
      >
        <div className="flex items-center gap-3 flex-1 pl-5">
          <Search
            className="w-4 h-4 text-white/30 shrink-0"
            strokeWidth={1.5}
          />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={loading}
            autoComplete="off"
            className={cn(
              "w-full bg-transparent h-[62px] text-sm font-mono text-[var(--t1)] tracking-wider",
              "!outline-none",
              "placeholder-white/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>
        <button
          ref={buttonRef}
          type="submit"
          disabled={loading || !value.trim()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "my-1.5 mr-1.5 px-5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] whitespace-nowrap",
            "bg-[var(--acc)] text-black",
            "transition-colors duration-150",
            "hover:brightness-110",
            "active:brightness-90",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100",
          )}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Track"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[11px] text-red-400 font-mono">{error}</p>
      )}
    </form>
  );
}
