"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, type OrderStatus } from "@/constants/order-statuses";
import ProductsSection from "@/components/admin/order-form/ProductsSection";
import ServicesSection, {
  computeServicesSubtotal,
} from "@/components/admin/order-form/ServicesSection";
import BillingSection from "@/components/admin/order-form/BillingSection";
import LogisticsSection from "@/components/admin/order-form/LogisticsSection";
import NotesSection from "@/components/admin/order-form/NotesSection";
import CustomerMessageSection from "@/components/admin/order-form/CustomerMessageSection";
import AdminToCustomerSection from "@/components/admin/order-form/AdminToCustomerSection";
import CustomerInfoSection from "@/components/admin/order-form/CustomerInfoSection";
import ShippingAddressSection from "@/components/admin/order-form/ShippingAddressSection";
import { ButtonLoader } from "@/components/ui/Loading";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import { SectionCard } from "@/components/ui/Card";
import { computeBillingTotals } from "@/lib/order-compute";
import { withLoading } from "@/lib/api-mutation";
import { toast } from "@/lib/hooks/useToast";
import type {
  ProductEntry,
  SelectedServices,
  BillingState,
  LogisticsState,
  InternalNote,
  CustomerNote,
  CustomWorkItem,
  OrderTimelineRow,
} from "@/lib/types";
import {
  INITIAL_BILLING,
  INITIAL_LOGISTICS,
  formatDateTime,
} from "@/lib/types";

function extractObj(val: unknown): Record<string, unknown> | null {
  if (!val) return null;
  if (Array.isArray(val)) return (val[0] as Record<string, unknown>) ?? null;
  if (typeof val === "object") return val as Record<string, unknown>;
  return null;
}

function toInternalNote(n: { id: string; text: string; created_at: string }): InternalNote {
  return { id: n.id, text: n.text, createdAt: n.created_at };
}

function toCustomerNote(n: { id: string; text: string; created_at: string }): CustomerNote {
  return { id: n.id, text: n.text, createdAt: n.created_at };
}

function initFromOrder(order: Record<string, unknown>) {
  const customer = extractObj(order.customer);
  const address = extractObj(order.address);
  const shipping = extractObj(order.shipping);
  const billingDetails = (order.billing_details ?? {}) as Record<string, unknown>;
  const payments = (order.payments ?? []) as Array<Record<string, unknown>>;
  const paymentRecord = payments[0] ?? null;

  const products = ((order.products ?? []) as Array<Record<string, unknown>>).map(
    (p) => ({ id: p.id as string, type: p.type as ProductEntry["type"], name: p.name as string })
  );

  const svcMap: SelectedServices = {};
  for (const s of (order.services ?? []) as Array<Record<string, unknown>>) {
    svcMap[s.service_id as string] = s.quantity as number;
  }

  const customWork = (order.custom_work ?? []) as Array<Record<string, unknown>>;
  const kb: CustomWorkItem[] = [];
  const ms: CustomWorkItem[] = [];
  for (const item of customWork) {
    const cw: CustomWorkItem = {
      id: item.id as string,
      title: (item.title as string) || "",
      description: (item.description as string) || "",
      price: (item.price as number) || 0,
      quantity: (item.quantity as number) || 1,
      notes: (item.notes as string) || "",
    };
    if (item.category === "mouse") ms.push(cw);
    else kb.push(cw);
  }

  return {
    meta: {
      id: order.id as string,
      order_number: order.order_number as string,
      service_type: (order.service_type as string) || "Custom Build Service",
      created_at: order.created_at as string,
      updated_at: order.updated_at as string,
    },
    customerName: (customer?.name as string) || "",
    discordUsername: (customer?.discord_username as string) || "",
    customerEmail: (customer?.email as string) || "",
    customerPhone: ((customer?.phone as string) || "").replace(/^\+91/, ""),
    serviceType: (order.service_type as string) || "Custom Build Service",
    currentStatus: (order.current_status as string) || ORDER_STATUSES[0],
    orderSummary: (order.order_summary as string) || "",
    streetAddress: (address?.street_address as string) || "",
    city: (address?.city as string) || "",
    state: (address?.state as string) || "",
    pincode: (address?.pincode as string) || "",
    products,
    selectedServices: svcMap,
    billing: {
      ...INITIAL_BILLING,
      shippingCost: (shipping?.shipping_cost as number) ?? (billingDetails.shippingCost as number) ?? 0,
      packagingCost: (shipping?.packaging_cost as number) ?? (billingDetails.packagingCost as number) ?? 0,
      extraCharges: (billingDetails.extraCharges as Array<{ id: string; label: string; amount: number }>) || [],
      flatDiscount: (billingDetails.flatDiscount as number) || 0,
      percentageDiscount: (billingDetails.percentageDiscount as number) || 0,
      taxPercentage: (billingDetails.taxPercentage as number) || 0,
      amountPaid: (paymentRecord?.amount_paid as number) ?? 0,
      paymentStatus: ((paymentRecord?.payment_status as string) as BillingState["paymentStatus"]) || "Payment Pending",
    },
    logistics: {
      ...INITIAL_LOGISTICS,
      courier: (shipping?.courier as string) ?? "",
      trackingNumber: (shipping?.tracking_number as string) ?? "",
      trackingUrl: (shipping?.tracking_url as string) ?? "",
      estimatedDispatchDate: (shipping?.estimated_dispatch_date as string) ?? "",
      estimatedDeliveryDate: (shipping?.estimated_delivery_date as string) ?? "",
      shippingStatus: ((shipping?.shipping_status as string) as LogisticsState["shippingStatus"]) || "Not Dispatched",
    },
    notes: ((order.internal_notes ?? []) as Array<Record<string, unknown>>)
      .map((n) => toInternalNote(n as { id: string; text: string; created_at: string })),
    customerNotes: ((order.customer_notes ?? []) as Array<Record<string, unknown>>)
      .map((n) => toCustomerNote(n as { id: string; text: string; created_at: string })),
    customerMessage: (((order.customer_messages ?? []) as Array<Record<string, unknown>>)[0]?.message as string) || null,
    keyboardCustomWork: kb,
    mouseCustomWork: ms,
    timeline: (order.timeline ?? []) as OrderTimelineRow[],
  };
}

function buildSnapshot(opts: {
  customerName: string;
  discordUsername: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  currentStatus: string;
  orderSummary: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  products: ProductEntry[];
  selectedServices: SelectedServices;
  billing: BillingState;
  logistics: LogisticsState;
  notes: InternalNote[];
  customerNotes: CustomerNote[];
  customerMessage: string | null;
  quotePrices: Record<string, number>;
  keyboardCustomWork: CustomWorkItem[];
  mouseCustomWork: CustomWorkItem[];
  totals: number;
}) {
  return {
    customer_name: opts.customerName,
    discord_username: opts.discordUsername,
    customer_email: opts.customerEmail,
    customer_phone: opts.customerPhone,
    service_type: opts.serviceType,
    current_status: opts.currentStatus,
    order_summary: opts.orderSummary,
    street_address: opts.streetAddress,
    city: opts.city,
    state: opts.state,
    pincode: opts.pincode,
    products: opts.products,
    selected_services: opts.selectedServices,
    billing: opts.billing,
    estimated_total: opts.totals,
    courier: opts.logistics.courier,
    tracking_number: opts.logistics.trackingNumber,
    tracking_url: opts.logistics.trackingUrl,
    estimated_dispatch_date: opts.logistics.estimatedDispatchDate || null,
    estimated_delivery: opts.logistics.estimatedDeliveryDate || null,
    shipping_status: opts.logistics.shippingStatus,
    internal_notes: opts.notes,
    customer_notes: opts.customerNotes,
    notes: opts.customerMessage,
    quote_prices: opts.quotePrices,
    custom_work: [
      ...opts.keyboardCustomWork.map((i) => ({ ...i, category: "keyboard" })),
      ...opts.mouseCustomWork.map((i) => ({ ...i, category: "mouse" })),
    ],
  };
}

export default function AdminOrderClient({
  order,
}: {
  order: Record<string, unknown>;
}) {
  const router = useRouter();

  const init = useMemo(() => initFromOrder(order), [order]);

  const [orderMeta, setOrderMeta] = useState(init.meta);

  const [customerName, setCustomerName] = useState(init.customerName);
  const [discordUsername, setDiscordUsername] = useState(init.discordUsername);
  const [customerEmail, setCustomerEmail] = useState(init.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(init.customerPhone);
  const [serviceType] = useState(init.serviceType);
  const [currentStatus, setCurrentStatus] = useState(init.currentStatus);
  const [orderSummary] = useState(init.orderSummary);

  const [streetAddress, setStreetAddress] = useState(init.streetAddress);
  const [city, setCity] = useState(init.city);
  const [state, setState] = useState(init.state);
  const [pincode, setPincode] = useState(init.pincode);

  const [products, setProducts] = useState<ProductEntry[]>(init.products);
  const [selectedServices, setSelectedServices] = useState<SelectedServices>(init.selectedServices);
  const [billing, setBilling] = useState<BillingState>(init.billing);
  const [logistics, setLogistics] = useState<LogisticsState>(init.logistics);
  const [notes, setNotes] = useState<InternalNote[]>(init.notes);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>(init.customerNotes);
  const [customerMessage] = useState<string | null>(init.customerMessage);
  const [quotePrices, setQuotePrices] = useState<Record<string, number>>({});
  const [keyboardCustomWork, setKeyboardCustomWork] = useState<CustomWorkItem[]>(init.keyboardCustomWork);
  const [mouseCustomWork, setMouseCustomWork] = useState<CustomWorkItem[]>(init.mouseCustomWork);

  const [timeline, setTimeline] = useState<OrderTimelineRow[]>(init.timeline);

  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const [newTimelineStatus, setNewTimelineStatus] = useState<OrderStatus>(init.currentStatus as OrderStatus);
  const [newTimelineNote, setNewTimelineNote] = useState("");
  const [insertingTimeline, setInsertingTimeline] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { subtotal: servicesSubtotal } = useMemo(
    () => computeServicesSubtotal(selectedServices, quotePrices),
    [selectedServices, quotePrices]
  );

  const customWorkSubtotal = useMemo(() => {
    const all = [...keyboardCustomWork, ...mouseCustomWork];
    return all.reduce((sum, item) => sum + (item.price || 0) * Math.max(1, item.quantity || 1), 0);
  }, [keyboardCustomWork, mouseCustomWork]);

  const totals = useMemo(
    () => computeBillingTotals(billing, servicesSubtotal, customWorkSubtotal),
    [billing, servicesSubtotal, customWorkSubtotal]
  );

  const currentFormState = useMemo(() => {
    return {
      customer_name: customerName,
      discord_username: discordUsername,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      service_type: serviceType,
      current_status: currentStatus,
      order_summary: orderSummary,
      street_address: streetAddress,
      city,
      state,
      pincode,
      products,
      selected_services: selectedServices,
      billing,
      estimated_total: totals.grandTotal,
      courier: logistics.courier,
      tracking_number: logistics.trackingNumber,
      tracking_url: logistics.trackingUrl,
      estimated_dispatch_date: logistics.estimatedDispatchDate || null,
      estimated_delivery: logistics.estimatedDeliveryDate || null,
      shipping_status: logistics.shippingStatus,
      internal_notes: notes,
      customer_notes: customerNotes,
      notes: customerMessage,
      quote_prices: quotePrices,
      custom_work: [
        ...keyboardCustomWork.map((i) => ({ ...i, category: "keyboard" })),
        ...mouseCustomWork.map((i) => ({ ...i, category: "mouse" })),
      ],
    };
  }, [
    customerName, discordUsername, customerEmail, customerPhone, serviceType,
    currentStatus, orderSummary, streetAddress, city, state, pincode,
    products, selectedServices, billing, totals.grandTotal, logistics, notes, customerNotes, customerMessage, quotePrices, keyboardCustomWork, mouseCustomWork,
  ]);

  const [serverSnapshot, setServerSnapshot] = useState<Record<string, unknown>>(() => {
    const svcSub = computeServicesSubtotal(init.selectedServices, {}).subtotal;
    const cwSub = [...init.keyboardCustomWork, ...init.mouseCustomWork].reduce(
      (s, i) => s + (i.price || 0) * Math.max(1, i.quantity || 1), 0
    );
    return buildSnapshot({
      ...init,
      totals: computeBillingTotals(init.billing, svcSub, cwSub).grandTotal,
      quotePrices: {},
    });
  });

  const hasFormChanges = useMemo(() => {
    return JSON.stringify(currentFormState) !== JSON.stringify(serverSnapshot);
  }, [currentFormState, serverSnapshot]);

  const handleAddTimelineUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderMeta) return;

    setInsertingTimeline(true);

    await withLoading({
      action: (signal) =>
        fetch(`/api/orders/${orderMeta.id}/timeline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newTimelineStatus,
            note: newTimelineNote || null,
          }),
          signal,
        }),
      loadingTitle: "Adding Timeline Update...",
      loadingDescription: "Adding status update to the order timeline.",
      successText: "Timeline updated.",
      onSuccess: (result: Record<string, unknown>) => {
        setTimeline((prev) => [result.update as OrderTimelineRow, ...prev]);
        setCurrentStatus(newTimelineStatus);

        setServerSnapshot((prev) => ({ ...prev, current_status: newTimelineStatus }));

        setOrderMeta((prev) =>
          prev ? { ...prev, updated_at: new Date().toISOString() } : prev
        );

        setNewTimelineNote("");
      },
      onSettled: () => setInsertingTimeline(false),
    });
  };

  const handleSaveChanges = async () => {
    if (!orderMeta) return;

    if (!hasFormChanges) {
      toast.info("No changes to save.");
      return;
    }

    // Validate phone format if changed
    if (customerPhone) {
      const digits = customerPhone.replace(/\D/g, "");
      if (digits && digits.length !== 10) {
        toast.error("Phone / WhatsApp must be exactly 10 digits.");
        return;
      }
    }

    // Validate pincode format if changed
    if (pincode && pincode.length !== 6) {
      toast.error("Pincode must be exactly 6 digits.");
      return;
    }

    // Validate email
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error("Invalid email address.");
      return;
    }

    setSaving(true);

    const deltaPayload: Record<string, unknown> = {};
    Object.keys(currentFormState).forEach((key) => {
      const currentVal = (currentFormState as unknown as Record<string, unknown>)[key];
      const snapshotVal = serverSnapshot[key];
      if (JSON.stringify(currentVal) !== JSON.stringify(snapshotVal)) {
        deltaPayload[key] = currentVal;
      }
    });

    await withLoading({
      action: (signal) =>
        fetch(`/api/orders/${orderMeta.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deltaPayload),
          signal,
        }),
      loadingTitle: "Saving Changes...",
      loadingDescription: "Updating order details, please wait.",
      successText: "Changes saved successfully.",
      errorPrefix: "Failed to save",
      onSuccess: () => {
        setServerSnapshot(JSON.parse(JSON.stringify(currentFormState)));
      },
      onSettled: () => setSaving(false),
    });
  };

  const handleDeleteOrder = async () => {
    if (!orderMeta) return;

    setArchiving(true);

    await withLoading({
      action: (signal) =>
        fetch(`/api/orders/${orderMeta.id}`, {
          method: "DELETE",
          signal,
        }),
      loadingTitle: "Archiving Order...",
      loadingDescription: "Moving order to archive.",
      successTitle: "Archived",
      successText: "Order has been archived.",
      onSuccess: () => router.push("/admin"),
      onSettled: () => setArchiving(false),
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] pb-32">

      <header className="sticky top-0 z-40 border-b border-[var(--bdr)] bg-[var(--bg1)]/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bdr)] text-[var(--t2)] transition hover:bg-[var(--surf)] hover:text-[var(--t1)]"
              aria-label="Back to dashboard"
            >
              ←
            </button>
            <div className="space-y-0.5">
              <h1
                className="font-mono text-base font-bold text-[var(--t1)] leading-none"
                style={{ fontFamily: "var(--ff-d)" }}
              >
                {orderMeta?.order_number}
              </h1>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[var(--t3)] font-medium">{serviceType}</span>
                <span className="inline-flex items-center gap-1 rounded bg-[var(--acc-dim)] border border-[var(--acc)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--acc)]">
                  <span className="h-1 w-1 rounded-full bg-[var(--acc)]" />
                  {currentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="1. Customer Information">
            <CustomerInfoSection
              customer={{
                customer_name: customerName,
                discord_username: discordUsername,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                customer_message: customerMessage || "",
              }}
              onChange={(patch) => {
                if (patch.customer_name !== undefined) setCustomerName(patch.customer_name);
                if (patch.discord_username !== undefined) setDiscordUsername(patch.discord_username);
                if (patch.customer_email !== undefined) setCustomerEmail(patch.customer_email);
                if (patch.customer_phone !== undefined) setCustomerPhone(patch.customer_phone);
              }}
            />
          </SectionCard>

          <SectionCard title="2. Shipping Address">
            <ShippingAddressSection
              shipping={{
                street_address: streetAddress,
                city,
                pincode,
                state,
              }}
              onChange={(patch) => {
                if (patch.street_address !== undefined) setStreetAddress(patch.street_address);
                if (patch.city !== undefined) setCity(patch.city);
                if (patch.pincode !== undefined) setPincode(patch.pincode);
                if (patch.state !== undefined) setState(patch.state);
              }}
              pincodeError={pincode.length > 0 && pincode.length !== 6 ? "Must be exactly 6 digits" : undefined}
            />
          </SectionCard>

          <SectionCard title="3. Product Details">
            <ProductsSection products={products} onChange={setProducts} />
          </SectionCard>

          <SectionCard title="4. Services">
            <ServicesSection
              selected={selectedServices}
              onChange={setSelectedServices}
              quotePrices={quotePrices}
              onQuotePriceChange={setQuotePrices}
              customWorkSections={{
                keyboard: {
                  title: "Custom Keyboard Work",
                  items: keyboardCustomWork,
                  onChange: setKeyboardCustomWork,
                },
                mouse: {
                  title: "Custom Mouse Work",
                  items: mouseCustomWork,
                  onChange: setMouseCustomWork,
                },
              }}
            />
          </SectionCard>

          <SectionCard title="5. Costing / Billing">
            <BillingSection
              billing={billing}
              onChange={setBilling}
              selectedServices={selectedServices}
              quotePrices={quotePrices}
              customWorkSubtotal={customWorkSubtotal}
            />
          </SectionCard>

          <SectionCard title="6. Logistics">
            <LogisticsSection logistics={logistics} onChange={setLogistics} />
          </SectionCard>

          <SectionCard title="7. Customer → Admin">
            <CustomerMessageSection message={customerMessage} />
          </SectionCard>

          <SectionCard title="8. Admin → Customer">
            <AdminToCustomerSection notes={customerNotes} onChange={setCustomerNotes} />
          </SectionCard>

          <SectionCard title="9. Internal Notes">
            <NotesSection notes={notes} onChange={setNotes} />
          </SectionCard>

          <TimelineCard
            timeline={timeline}
            newStatus={newTimelineStatus}
            newNote={newTimelineNote}
            inserting={insertingTimeline}
            onStatusChange={setNewTimelineStatus}
            onNoteChange={setNewTimelineNote}
            onSubmit={handleAddTimelineUpdate}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="space-y-5 rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-5 shadow-xl">
            <h3 className="border-b border-[var(--bdr)] pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--t3)]">
              Order Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="mb-0.5 block text-[var(--t3)]">Order ID</span>
                <span className="select-all font-mono text-[10px] text-[var(--t2)] break-all">
                  {orderMeta?.id}
                </span>
              </div>
              <div>
                <span className="mb-0.5 block text-[var(--t3)]">Order Number</span>
                <span className="font-mono text-[var(--t2)]">{orderMeta?.order_number}</span>
              </div>
              <div className="col-span-2">
                <span className="mb-1 block text-[var(--t3)]">Status</span>
                <span className="inline-flex items-center gap-1.5 rounded border border-[var(--acc)]/30 bg-[var(--acc-dim)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--acc)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--acc)]" />
                  {currentStatus}
                </span>
              </div>
              <div className="col-span-2">
                <span className="mb-0.5 block text-[var(--t3)]">Email</span>
                <span className="block truncate text-[var(--t2)]">
                  {customerEmail || "—"}
                </span>
              </div>
              <div className="col-span-2 space-y-1 border-t border-[var(--bdr)] pt-3 text-[11px] text-[var(--t3)]">
                <div>
                  Created:{" "}
                  <span className="font-mono text-[var(--t2)]">
                    {orderMeta ? formatDateTime(orderMeta.created_at) : ""}
                  </span>
                </div>
                <div>
                  Updated:{" "}
                  <span className="font-mono text-[var(--t2)]">
                    {orderMeta ? formatDateTime(orderMeta.updated_at) : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <SaveBar
        saving={saving}
        archiving={archiving}
        hasChanges={hasFormChanges}
        orderNumber={orderMeta?.order_number ?? ""}
        onCancel={() => router.push("/admin")}
        onSave={handleSaveChanges}
        onArchiveClick={() => setConfirmOpen(true)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Archive Order?"
        description={`Order ${orderMeta?.order_number} will be hidden from the dashboard. It can be restored later.`}
        confirmLabel="Archive"
        variant="danger"
        loading={archiving}
        onConfirm={() => {
          setConfirmOpen(false);
          handleDeleteOrder();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function TimelineCard({
  timeline, newStatus, newNote, inserting, onStatusChange, onNoteChange, onSubmit,
}: {
  timeline: OrderTimelineRow[];
  newStatus: OrderStatus;
  newNote: string;
  inserting: boolean;
  onStatusChange: (val: OrderStatus) => void;
  onNoteChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <SectionCard title="Order Timeline">
      <div className="max-h-[320px] space-y-4 overflow-y-auto pr-2">
        {timeline.length === 0 ? (
          <p className="py-2 text-xs italic text-[var(--t3)]">No updates yet.</p>
        ) : (
          timeline.map((item) => (
            <div key={item.id} className="relative border-l border-[var(--bdr)] py-1 pl-5 text-xs">
              <div className="absolute left-[-4.5px] top-2 h-2 w-2 rounded-full border border-[var(--bg1)] bg-[var(--acc)]" />
              <div className="flex items-center justify-between gap-4 font-mono">
                <span className="rounded border border-[var(--bdr)] bg-[var(--bg2)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--t1)]">
                  {item.status}
                </span>
                <span className="text-[10px] text-[var(--t3)]">
                  {formatDateTime(item.created_at)}
                </span>
              </div>
              {item.note && (
                <p className="mt-1.5 leading-relaxed text-[var(--t2)]">{item.note}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 border-t border-[var(--bdr)] pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--t3)]">
          Add Timeline Update
        </p>
        <form onSubmit={onSubmit} className="grid items-start gap-3 sm:grid-cols-3">
          <div>
            <select
              value={newStatus}
              onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
              className="h-[38px] w-full rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-2.5 text-xs text-[var(--t1)] outline-none focus:border-[var(--acc)]/40"
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <input
              value={newNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Customer message (optional)"
              className="h-[38px] flex-1 rounded-lg border border-[var(--bdr)] bg-[var(--bg2)] p-2.5 text-xs text-[var(--t1)] outline-none focus:border-[var(--acc)]/40"
            />
            <ButtonLoader
              type="submit"
              variant="secondary"
              loading={inserting}
              loadingText="Adding..."
              className="h-[38px] whitespace-nowrap px-4 text-xs"
            >
              Add
            </ButtonLoader>
          </div>
        </form>
      </div>
    </SectionCard>
  );
}

function SaveBar({
  saving, archiving, hasChanges, orderNumber, onCancel, onSave, onArchiveClick,
}: {
  saving: boolean;
  archiving: boolean;
  hasChanges: boolean;
  orderNumber: string;
  onCancel: () => void;
  onSave: () => void;
  onArchiveClick: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center border-t border-[var(--bdr)] bg-[var(--bg1)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => window.open(`/track/${orderNumber}`, "_blank")}
          disabled={!orderNumber}
          className="text-xs text-[var(--t3)] transition hover:text-[var(--acc)] disabled:opacity-40"
        >
          View tracking page ↗
        </button>
        <div className="flex items-center gap-3">
          <ButtonLoader
            variant="danger"
            loading={archiving}
            loadingText="Archiving..."
            onClick={onArchiveClick}
          >
            Archive
          </ButtonLoader>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <ButtonLoader
            variant="primary"
            loading={saving}
            loadingText="Saving..."
            disabled={!hasChanges}
            onClick={onSave}
            className="min-w-[100px] justify-center"
          >
            Save Changes
          </ButtonLoader>
        </div>
      </div>
    </div>
  );
}
