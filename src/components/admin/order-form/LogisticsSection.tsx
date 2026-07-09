"use client";

import type { LogisticsState, ShippingStatus } from "@/lib/types";
import { SHIPPING_STATUSES } from "@/lib/types";
import { Field, inputClass } from "@/components/ui/Field";

export default function LogisticsSection({
  logistics,
  onChange,
}: {
  logistics: LogisticsState;
  onChange: (logistics: LogisticsState) => void;
}) {
  function update<K extends keyof LogisticsState>(key: K, value: LogisticsState[K]) {
    onChange({ ...logistics, [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Courier Partner">
          <input
            value={logistics.courier}
            onChange={(e) => update("courier", e.target.value)}
            placeholder="e.g. Delhivery, Bluedart"
            className={inputClass}
          />
        </Field>
        <Field label="Tracking Number">
          <input
            value={logistics.trackingNumber}
            onChange={(e) => update("trackingNumber", e.target.value)}
            placeholder="AWB Number"
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>

      <Field label="Tracking URL">
        <input
          value={logistics.trackingUrl}
          onChange={(e) => update("trackingUrl", e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      {logistics.trackingUrl && (
        <a
          href={logistics.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--acc)] px-4 py-2.5 text-xs font-bold text-black transition hover:brightness-110"
        >
          Track Shipment ↗
        </a>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Estimated Dispatch Date">
          <input
            type="date"
            value={logistics.estimatedDispatchDate}
            onChange={(e) => update("estimatedDispatchDate", e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        <Field label="Estimated Delivery Date (optional)">
          <input
            type="date"
            value={logistics.estimatedDeliveryDate}
            onChange={(e) => update("estimatedDeliveryDate", e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        <Field label="Shipping Status">
          <select
            value={logistics.shippingStatus}
            onChange={(e) => update("shippingStatus", e.target.value as ShippingStatus)}
            className={`${inputClass} appearance-none`}
          >
            {SHIPPING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}