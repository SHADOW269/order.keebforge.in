"use client";

import { useMemo, useState } from "react";
import {
  SERVICE_CATALOG,
  SERVICE_BY_ID,
  type ServiceDefinition,
  getServiceLineTotal,
  unitLabel,
} from "@/constants/services";
import { formatINR } from "@/lib/types";
import { MiniBadge } from "@/components/ui/Badge";
import { computeServicesSubtotal } from "@/lib/order-compute";
import type { SelectedServices } from "@/lib/types";
import type { CustomWorkItem } from "@/lib/types";
import CustomWorkSection from "@/components/admin/order-form/CustomWorkSection";

export { computeServicesSubtotal };

export default function ServicesSection({
  selected,
  onChange,
  quotePrices = {},
  onQuotePriceChange,
  customWorkSections,
}: {
  selected: SelectedServices;
  onChange: (selected: SelectedServices) => void;
  quotePrices?: Record<string, number>;
  onQuotePriceChange?: (prices: Record<string, number>) => void;
  customWorkSections?: Record<string, { title: string; items: CustomWorkItem[]; onChange: (items: CustomWorkItem[]) => void }>;
}) {
  const disabledIds = useMemo(() => {
    const disabled = new Set<string>();
    for (const id of Object.keys(selected)) {
      const svc = SERVICE_BY_ID[id];
      if (!svc) continue;
      svc.replaces?.forEach((r) => disabled.add(r));
      svc.exclusiveWith?.forEach((r) => disabled.add(r));
    }
    return disabled;
  }, [selected]);

  function toggle(svc: ServiceDefinition) {
    if (disabledIds.has(svc.id)) return;

    const next = { ...selected };
    if (next[svc.id] != null) {
      delete next[svc.id];
    } else {
      next[svc.id] = svc.unit === "per_switch" || svc.unit === "per_stabilizer" ? 0 : 1;
      svc.replaces?.forEach((r) => delete next[r]);
      svc.exclusiveWith?.forEach((r) => delete next[r]);
    }
    onChange(next);
  }

  function setQuantity(id: string, quantity: number) {
    if (selected[id] == null) return;
    onChange({ ...selected, [id]: quantity });
  }

  return (
    <div className="space-y-8">
      {SERVICE_CATALOG.map((group) => (
        <div key={group.id}>
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--acc)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            {group.name}
          </p>
          <div className="space-y-3">
            {group.subcategories.map((sub) => (
              <ServiceSubcategoryCard
                key={sub.id}
                title={sub.name}
                services={sub.services}
                selected={selected}
                disabledIds={disabledIds}
                onToggle={toggle}
                onQuantity={setQuantity}
                quotePrices={quotePrices}
                onQuotePriceChange={onQuotePriceChange}
              />
            ))}
          </div>
          {customWorkSections?.[group.id] && (
            <div className="mt-3">
              <CustomWorkSection
                title={customWorkSections[group.id].title}
                items={customWorkSections[group.id].items}
                onChange={customWorkSections[group.id].onChange}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceSubcategoryCard({
  title,
  services,
  selected,
  disabledIds,
  onToggle,
  onQuantity,
  quotePrices,
  onQuotePriceChange,
}: {
  title: string;
  services: ServiceDefinition[];
  selected: SelectedServices;
  disabledIds: Set<string>;
  onToggle: (svc: ServiceDefinition) => void;
  onQuantity: (id: string, qty: number) => void;
  quotePrices?: Record<string, number>;
  onQuotePriceChange?: (prices: Record<string, number>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedCount = services.filter((s) => selected[s.id] != null).length;

  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)]/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left transition hover:bg-[var(--surf)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-[var(--t1)]">{title}</span>
          {selectedCount > 0 && (
            <span className="rounded-full bg-[var(--acc-dim)] px-2 py-0.5 text-[10px] font-bold text-[var(--acc)]">
              {selectedCount} selected
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
        <div className="space-y-2 border-t border-[var(--bdr)] p-4">
          {services.map((svc) => {
            const isSelected = selected[svc.id] != null;
            const isDisabled = disabledIds.has(svc.id) && !isSelected;
            const qty = selected[svc.id] ?? 1;
            const lineTotal = getServiceLineTotal(svc, qty);

            return (
              <label
                key={svc.id}
                className={`flex flex-col gap-2 rounded-lg border p-3.5 transition sm:flex-row sm:items-center sm:justify-between ${
                  isSelected
                    ? "border-[var(--acc)]/40 bg-[var(--acc-glow2)]"
                    : "border-[var(--bdr)] bg-[var(--bg1)]"
                } ${isDisabled ? "opacity-40" : "cursor-pointer"}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => onToggle(svc)}
                    className="mt-1 h-4 w-4 accent-[var(--acc)]"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-[var(--t1)]">
                        {svc.name}
                      </span>
                      {svc.popular && <MiniBadge label="Popular" tone="popular" />}
                      {svc.highlight && <MiniBadge label="Highlight" tone="highlight" />}
                      {svc.combo && <MiniBadge label="Combo" tone="combo" />}
                    </div>
                    <p className="mt-0.5 max-w-md text-xs text-[var(--t3)]">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-7 sm:pl-0">
                  {(svc.unit === "per_switch" || svc.unit === "per_stabilizer") &&
                    isSelected && (
                      <input
                        type="number"
                        min={1}
                        value={qty || ""}
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) => onQuantity(svc.id, Number(e.target.value) || 1)}
                        className="w-16 rounded border border-[var(--bdr)] bg-[var(--bg2)] p-1.5 text-center text-xs text-[var(--t1)] outline-none focus:border-[var(--acc)]/40"
                      />
                    )}

                  <div className="text-right">
                    {svc.unit === "quote" && isSelected ? (
                      <div className="relative flex items-center rounded border border-[var(--bdr)] bg-[var(--bg2)] transition-all duration-200 focus-within:border-[var(--acc)]/40">
                        <span className="absolute left-2 select-none text-xs text-[var(--t3)]">₹</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quotePrices?.[svc.id] ?? ""}
                          onChange={(e) => {
                            const next = { ...quotePrices };
                            const raw = e.target.value;
                            const cleaned = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                            if (cleaned === "") {
                              delete next[svc.id];
                            } else {
                              next[svc.id] = Number(cleaned);
                            }
                            onQuotePriceChange?.(next);
                          }}
                          placeholder="Enter price"
                          className="w-36 bg-transparent py-1.5 pl-5 pr-2 text-right text-xs text-[var(--t1)] outline-none border-none shadow-none"
                          onClick={(e) => e.stopPropagation()}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                      </div>
                    ) : svc.unit === "quote" ? (
                      <span className="text-xs font-bold uppercase tracking-wide text-amber-300">
                        Quotation Required
                      </span>
                    ) : (
                      <>
                        <span className="block text-sm font-bold text-[var(--t1)]">
                          {isSelected ? formatINR(lineTotal ?? 0) : formatINR(svc.price ?? 0)}
                        </span>
                        <span className="block text-[10px] text-[var(--t3)]">
                          {unitLabel(svc.unit)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
