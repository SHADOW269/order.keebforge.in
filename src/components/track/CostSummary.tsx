// src/components/track/CostSummary.tsx
import { computeBillingTotals, computeServicesSubtotal } from "@/lib/order-compute";
import type { BillingState } from "@/lib/types";
import { formatINR } from "@/lib/types";

export default function CostSummary({
  billing,
  selectedServices,
}: {
  billing: BillingState;
  selectedServices: Record<string, number>;
}) {
  const { subtotal: servicesSubtotal } = computeServicesSubtotal(selectedServices || {});
  const totals = computeBillingTotals(billing, servicesSubtotal);

  return (
    <div className="space-y-1.5 text-sm">
      <Row label="Services" value={formatINR(servicesSubtotal)} />
      <Row label="Shipping" value={formatINR(billing.shippingCost || 0)} />
      <Row label="Packaging" value={formatINR(billing.packagingCost || 0)} />
      {totals.discountAmount > 0 && (
        <Row label="Discount" value={`− ${formatINR(totals.discountAmount)}`} muted />
      )}
      {totals.taxAmount > 0 && <Row label="Tax" value={formatINR(totals.taxAmount)} muted />}
      <div className="my-2 border-t border-[var(--bdr)]" />
      <Row label="Grand Total" value={formatINR(totals.grandTotal)} bold accent />
    </div>
  );
}

function Row({
  label, value, bold, muted, accent,
}: { label: string; value: string; bold?: boolean; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-[var(--t3)]" : "text-[var(--t2)]"}>{label}</span>
      <span
        className={`${bold ? "text-base font-bold" : "font-medium"} ${
          accent ? "text-[var(--acc)]" : muted ? "text-[var(--t3)]" : "text-[var(--t1)]"
        }`}
        style={bold ? { fontFamily: "var(--ff-d)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}