"use client";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "https://keebforge.in/" },
  { label: "About", href: "https://keebforge.in/About/" },
  { label: "Services", href: "https://keebforge.in/#services" },
  { label: "Contact", href: "https://keebforge.in/contact" },
];

export default function SiteNav() {
  return (
    <nav className="w-full h-16 border-b border-white/10 bg-[#0a0910]/80 backdrop-blur-md z-50 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <a
          href="https://keebforge.in/"
          className="text-sm font-bold tracking-wider transition-colors hover:text-[var(--acc)]"
          style={{ fontFamily: "var(--ff-d)" }}
        >
          KeebForge<span className="text-[var(--acc)]">.</span>in
        </a>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--t3)]">
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
            "border border-[var(--acc)]/30 text-[var(--acc)] bg-[var(--acc)]/5",
            "px-4 py-2 rounded-full",
            "hover:bg-[var(--acc)] hover:text-black",
            "transition-all duration-300",
            "shadow-[0_0_15px_rgba(201,243,29,0.05)]",
            "text-center"
          )}
        >
          Place an Order
        </a>
      </div>
    </nav>
  );
}
