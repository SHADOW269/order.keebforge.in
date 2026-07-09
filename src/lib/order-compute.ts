import { SERVICE_BY_ID, getServiceLineTotal } from "@/constants/services";
import type { BillingState, SelectedServices, BillingTotals } from "@/lib/types";

export function computeServicesSubtotal(
  selected: SelectedServices,
  quotePrices: Record<string, number> = {}
): {
  subtotal: number;
  hasQuoteItems: boolean;
} {
  let subtotal = 0;
  let hasQuoteItems = false;

  for (const [id, qty] of Object.entries(selected)) {
    const svc = SERVICE_BY_ID[id];
    if (!svc) continue;
    if (qty <= 0) continue;
    if (svc.unit === "quote") {
      const customPrice = quotePrices[id];
      if (customPrice != null && customPrice > 0) {
        subtotal += customPrice;
      } else {
        hasQuoteItems = true;
      }
    } else {
      const line = getServiceLineTotal(svc, qty);
      if (line !== null) subtotal += line;
    }
  }

  return { subtotal, hasQuoteItems };
}

export function computeBillingTotals(
  billing: BillingState,
  servicesSubtotal: number
): BillingTotals {
  const extraChargesTotal = billing.extraCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const subtotal =
    servicesSubtotal + (billing.shippingCost || 0) + (billing.packagingCost || 0) + extraChargesTotal;

  const discountAmount =
    (billing.flatDiscount || 0) + (subtotal * (billing.percentageDiscount || 0)) / 100;
  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const taxAmount = (afterDiscount * (billing.taxPercentage || 0)) / 100;
  const grandTotal = afterDiscount + taxAmount;
  const remainingBalance = Math.max(0, grandTotal - (billing.amountPaid || 0));

  return {
    servicesSubtotal,
    extraChargesTotal,
    subtotal,
    discountAmount,
    afterDiscount,
    taxAmount,
    grandTotal,
    remainingBalance,
  };
}
