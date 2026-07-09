"use client";

import { formatDateTime } from "@/lib/types";

interface CustomerMessage {
  id: string;
  text: string;
  createdAt: string;
}

export default function CustomerMessageSection({
  messages,
  message,
  editable,
  onMessageChange,
}: {
  messages?: CustomerMessage[];
  message?: string | null;
  editable?: boolean;
  onMessageChange?: (val: string) => void;
}) {
  const hasMessage = message?.trim();
  const hasMessages = messages && messages.length > 0;

  if (editable) {
    return (
      <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 p-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--t3)]">
          Customer &rarr; Admin
        </p>
        <textarea
          value={message || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= 2000) {
              onMessageChange?.(val);
            }
          }}
          rows={3}
          className="w-full resize-none overflow-hidden rounded-lg border border-[var(--bdr)] bg-[var(--bg1)] p-3 text-sm text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40"
          placeholder="Build preferences, shipping instructions, special requests..."
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
          }}
        />
      </div>
    );
  }

  if (!hasMessage && !hasMessages) {
    return (
      <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 p-5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--t3)]">
          Customer &rarr; Admin
        </p>
        <p className="text-sm italic text-[var(--t3)]">No customer message.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 p-5 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--t3)]">
        Customer &rarr; Admin
      </p>
      {hasMessage && (
        <div className="rounded-lg border border-[var(--bdr)] bg-[var(--bg1)] p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--t1)] italic">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      )}
      {hasMessages &&
        messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-lg border border-[var(--bdr)] bg-[var(--bg1)] p-4"
          >
            <div className="mb-2 text-[10px] text-[var(--t3)]">
              {formatDateTime(msg.createdAt)}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--t1)] italic">
              &ldquo;{msg.text}&rdquo;
            </p>
          </div>
        ))}
    </div>
  );
}

export type { CustomerMessage };
