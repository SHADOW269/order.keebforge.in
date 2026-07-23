"use client";

import { SERVICE_BY_ID, getServiceLineTotal, unitLabel } from "@/constants/services";
import { computeServicesSubtotal, computeBillingTotals } from "@/lib/order-compute";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  BillingState,
  ExtraCharge,
  PAYMENT_STATUSES,
  SelectedServices,
  genId,
  formatINR,
} from "@/lib/types";

export default function BillingSection({
  billing,
  onChange,
  selectedServices,
  quotePrices = {},
  customWorkSubtotal = 0,
}: {
  billing: BillingState;
  onChange: (billing: BillingState) => void;
  selectedServices: SelectedServices;
  quotePrices?: Record<string, number>;
  customWorkSubtotal?: number;
}) {
  const { subtotal: servicesSubtotal, hasQuoteItems } = computeServicesSubtotal(selectedServices, quotePrices);
  const totals = computeBillingTotals(billing, servicesSubtotal, customWorkSubtotal);
  const serviceEntries = Object.entries(selectedServices)
    .map(([id, qty]) => ({ svc: SERVICE_BY_ID[id], qty }))
    .filter((e) => e.svc);

  function update<K extends keyof BillingState>(key: K, value: BillingState[K]) {
    onChange({ ...billing, [key]: value });
  }

  function addExtraCharge() {
    const next: ExtraCharge = { id: genId("charge"), label: "", amount: 0 };
    update("extraCharges", [...billing.extraCharges, next]);
  }

  function updateExtraCharge(id: string, patch: Partial<ExtraCharge>) {
    update(
      "extraCharges",
      billing.extraCharges.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }

  function removeExtraCharge(id: string) {
    update(
      "extraCharges",
      billing.extraCharges.filter((c) => c.id !== id)
    );
  }

  return (
    <div className="space-y-6">
      {hasQuoteItems && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-300">
          One or more selected services require a custom quotation and are not
          included in the totals below.
        </div>
      )}

      <div>
        <SectionLabel>Service Charges</SectionLabel>
        {serviceEntries.length === 0 ? (
          <p className="text-xs text-[var(--t3)]">No services selected yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--bdr)]">
            <table className="w-full text-xs">
              <thead className="bg-[var(--bg2)] text-left text-[10px] uppercase tracking-wider text-[var(--t3)]">
                <tr>
                  <th className="p-2.5">Service</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Unit Price</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceEntries.map(({ svc, qty }) => {
                  const quotePrice = svc.unit === "quote" ? quotePrices[svc.id] : undefined;
                  const line = quotePrice != null && quotePrice > 0
                    ? quotePrice
                    : getServiceLineTotal(svc, qty);
                  return (
                    <tr key={svc.id} className="border-t border-[var(--bdr)]">
                      <td className="p-2.5 text-[var(--t1)]">{svc.name}</td>
                      <td className="p-2.5 text-[var(--t2)]">
                        {svc.unit === "per_switch" || svc.unit === "per_stabilizer" ? qty : "—"}
                      </td>
                      <td className="p-2.5 text-[var(--t2)]">
                        {quotePrice != null && quotePrice > 0
                          ? `${formatINR(quotePrice)}`
                          : svc.unit === "quote"
                            ? "Quote"
                            : `${formatINR(svc.price ?? 0)} ${unitLabel(svc.unit)}`}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-[var(--t1)]">
                        {line === null ? "Quotation Required" : formatINR(line)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <SectionLabel>Additional Charges</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            label="Shipping Cost"
            value={billing.shippingCost}
            onChange={(v) => update("shippingCost", v)}
          />
          <MoneyField
            label="Packaging Cost"
            value={billing.packagingCost}
            onChange={(v) => update("packagingCost", v)}
          />
        </div>

        <div className="mt-3 space-y-2">
          {billing.extraCharges.map((charge) => (
            <div key={charge.id} className="flex gap-2">
              <input
                value={charge.label}
                onChange={(e) => updateExtraCharge(charge.id, { label: e.target.value })}
                placeholder="Charge label (e.g. Rush fee)"
                className="flex-1 rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-2.5 text-sm text-[var(--t1)] outline-none focus:border-[var(--acc)]/40"
              />
              <input
                type="number"
                value={charge.amount || ""}
                onChange={(e) =>
                  updateExtraCharge(charge.id, { amount: Number(e.target.value) || 0 })
                }
                className="w-28 rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-2.5 text-sm text-[var(--t1)] outline-none focus:border-[var(--acc)]/40"
              />
              <button
                type="button"
                onClick={() => removeExtraCharge(charge.id)}
                className="rounded-lg border border-[var(--bdr)] px-3 text-xs text-[var(--t3)] transition hover:border-red-500/40 hover:text-red-400"
                aria-label="Remove charge"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExtraCharge}
            className="text-xs font-bold text-[var(--acc)] hover:underline"
          >
            + Add extra charge
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Discounts</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            label="Flat Discount"
            value={billing.flatDiscount}
            onChange={(v) => update("flatDiscount", v)}
          />
          <MoneyField
            label="Percentage Discount"
            value={billing.percentageDiscount}
            onChange={(v) => update("percentageDiscount", v)}
            suffix="%"
          />
        </div>
      </div>

      <div>
        <SectionLabel>Tax (optional)</SectionLabel>
        <div className="sm:w-1/2">
          <MoneyField
            label="Tax Percentage"
            value={billing.taxPercentage}
            onChange={(v) => update("taxPercentage", v)}
            suffix="%"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--bdr)] bg-[var(--bg2)] p-5">
        <InvoiceRow label="Services" value={formatINR(totals.servicesSubtotal)} />
        {totals.customWorkSubtotal > 0 && (
          <InvoiceRow label="Custom Work" value={formatINR(totals.customWorkSubtotal)} />
        )}
        <InvoiceRow label="Shipping & Packaging" value={formatINR((billing.shippingCost || 0) + (billing.packagingCost || 0))} muted />
        {totals.extraChargesTotal > 0 && (
          <InvoiceRow label="Extra Charges" value={formatINR(totals.extraChargesTotal)} muted />
        )}
        <InvoiceRow label="Subtotal" value={formatINR(totals.subtotal)} />
        <InvoiceRow label="Discount" value={`− ${formatINR(totals.discountAmount)}`} muted />
        <InvoiceRow label="After discount" value={formatINR(totals.afterDiscount)} />
        <InvoiceRow label="Tax" value={formatINR(totals.taxAmount)} muted />
        <div className="my-3 border-t border-[var(--bdr)]" />
        <InvoiceRow label="Grand Total" value={formatINR(totals.grandTotal)} bold accent />
      </div>

      <div>
        <SectionLabel>Payment</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            label="Amount Paid"
            value={billing.amountPaid}
            onChange={(v) => update("amountPaid", v)}
          />
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--t3)]">
              Payment Status
            </label>
            <select
              value={billing.paymentStatus}
              onChange={(e) => update("paymentStatus", e.target.value as BillingState["paymentStatus"])}
              className="w-full appearance-none rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3 text-sm text-[var(--t1)] outline-none focus:border-[var(--acc)]/40"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-[var(--bdr)] bg-[var(--bg1)] p-4">
          <InvoiceRow label="Remaining Balance" value={formatINR(totals.remainingBalance)} bold />
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({
  label,
  value,
  bold,
  muted,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
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

function MoneyField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--t3)]">
        {label}
      </label>
      <div className="relative flex items-center">
        {!suffix && (
          <span className="absolute left-3 select-none text-xs text-[var(--t3)]">₹</span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-3 text-sm text-[var(--t1)] outline-none transition focus:border-[var(--acc)]/40 ${
            suffix ? "pr-8" : "pl-7"
          }`}
        />
        {suffix && (
          <span className="absolute right-3 select-none text-xs text-[var(--t3)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}
