"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { FullPageLoading } from "@/components/ui/Loading";

import { SectionCard } from "@/components/ui/Card";
import { computeBillingTotals } from "@/lib/order-compute";
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
interface OrderDetailData {
  id: string;
  order_number: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    discord_username: string | null;
  } | null;
  address: {
    id: string;
    street_address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  } | null;
  service_type: string | null;
  current_status: string;
  order_summary: string | null;
  estimated_total: number | null;
  billing_details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  products: Array<{ id: string; type: string; name: string }>;
  services: Array<{ service_id: string; quantity: number }>;
  custom_work: Array<{
    id: string;
    category: string;
    title: string;
    description: string | null;
    price: number;
    quantity: number;
    notes: string | null;
  }>;
  shipping: {
    courier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    shipping_status: string;
    shipping_cost: number;
    packaging_cost: number;
    estimated_dispatch_date: string | null;
    estimated_delivery_date: string | null;
  } | null;
  payments: Array<{
    amount_paid: number;
    payment_status: string;
    paid_at: string | null;
  }>;
  customer_messages: Array<{ message: string }>;
  admin_customer_notes: Array<{ id: string; text: string; created_at: string }>;
  admin_internal_notes: Array<{ id: string; text: string; created_at: string }>;
}

function toInternalNote(n: { id: string; text: string; created_at: string }): InternalNote {
  return { id: n.id, text: n.text, createdAt: n.created_at };
}

function toCustomerNote(n: { id: string; text: string; created_at: string }): CustomerNote {
  return { id: n.id, text: n.text, createdAt: n.created_at };
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const supabase = useMemo(() => createClient(), []);

  const [orderMeta, setOrderMeta] = useState<{ id: string; order_number: string; service_type: string; created_at: string; updated_at: string } | null>(null);

  const serverSnapshot = useRef<Record<string, unknown> | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<Record<string, unknown> | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [orderSummary, setOrderSummary] = useState("");

  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});
  const [billing, setBilling] = useState<BillingState>(INITIAL_BILLING);
  const [logistics, setLogistics] = useState<LogisticsState>(INITIAL_LOGISTICS);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [customerMessage, setCustomerMessage] = useState<string | null>(null);
  const [quotePrices, setQuotePrices] = useState<Record<string, number>>({});
  const [keyboardCustomWork, setKeyboardCustomWork] = useState<CustomWorkItem[]>([]);
  const [mouseCustomWork, setMouseCustomWork] = useState<CustomWorkItem[]>([]);

  const [timeline, setTimeline] = useState<OrderTimelineRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newTimelineStatus, setNewTimelineStatus] = useState<OrderStatus>(ORDER_STATUSES[0]);
  const [newTimelineNote, setNewTimelineNote] = useState("");
  const [insertingTimeline, setInsertingTimeline] = useState(false);

  const { subtotal: servicesSubtotal } = useMemo(
    () => computeServicesSubtotal(selectedServices, quotePrices),
    [selectedServices, quotePrices]
  );

  const customWorkSubtotal = useMemo(() => {
    const all = [...keyboardCustomWork, ...mouseCustomWork];
    return all.reduce((sum, item) => sum + (item.price || 0) * Math.max(1, item.quantity || 1), 0);
  }, [keyboardCustomWork, mouseCustomWork]);

  const totals = useMemo(
    () => computeBillingTotals(billing, servicesSubtotal + customWorkSubtotal),
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
        ...keyboardCustomWork.map(i => ({ ...i, category: "keyboard" })),
        ...mouseCustomWork.map(i => ({ ...i, category: "mouse" })),
      ],
    };
  }, [
    customerName, discordUsername, customerEmail, customerPhone, serviceType,
    currentStatus, orderSummary, streetAddress, city, state, pincode,
    products, selectedServices, billing, totals.grandTotal, logistics, notes, customerNotes, customerMessage, quotePrices, keyboardCustomWork, mouseCustomWork
  ]);

  const hasFormChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    return JSON.stringify(currentFormState) !== JSON.stringify(initialSnapshot);
  }, [currentFormState, initialSnapshot]);

  useEffect(() => {
    if (!orderNumber) return;

    async function fetchOrderData() {
      setLoading(true);
      setGlobalError(null);

      // Fetch order with all related data via joins
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          id, order_number, service_type, current_status, order_summary,
          estimated_total, billing_details, created_at, updated_at,
          customer_id,
          address_id,
          customer:customer_id(id, name, email, phone, discord_username),
          address:address_id(id, street_address, city, state, pincode)
        `)
        .eq("order_number", orderNumber.toUpperCase())
        .single();

      if (orderError || !orderData) {
        setGlobalError("Order not found.");
        setLoading(false);
        return;
      }

      const related$ = Promise.all([
        supabase.from("order_products").select("id, type, name, sort_order").eq("order_id", orderData.id).order("sort_order"),
        supabase.from("order_services").select("service_id, quantity").eq("order_id", orderData.id),
        supabase.from("order_custom_work").select("id, category, title, description, price, quantity, notes, sort_order").eq("order_id", orderData.id).order("sort_order"),
        supabase.from("shipping_info").select("courier, tracking_number, tracking_url, shipping_status, shipping_cost, packaging_cost, estimated_dispatch_date, estimated_delivery_date").eq("order_id", orderData.id).maybeSingle(),
        supabase.from("payments").select("amount_paid, payment_status, paid_at").eq("order_id", orderData.id).order("created_at", { ascending: false }),
        supabase.from("order_timeline").select("id, order_id, status, note, created_at").eq("order_id", orderData.id).order("created_at", { ascending: false }),
        supabase.from("customer_messages").select("message").eq("order_id", orderData.id).order("created_at", { ascending: false }),
        supabase.from("admin_customer_notes").select("id, text, created_at").eq("order_id", orderData.id).order("created_at", { ascending: false }),
        supabase.from("admin_internal_notes").select("id, text, created_at").eq("order_id", orderData.id).order("created_at", { ascending: false }),
      ]);

      const [
        { data: productsData },
        { data: servicesData },
        { data: customWorkData },
        { data: shippingData },
        { data: paymentsData },
        { data: timelineData },
        { data: messagesData },
        { data: customerNotesData },
        { data: internalNotesData },
      ] = await related$;

      const rawCustomer = orderData.customer as unknown;
      const rawAddress = orderData.address as unknown;
      const customer = (Array.isArray(rawCustomer) ? (rawCustomer as Array<OrderDetailData["customer"]>)[0] : rawCustomer) as OrderDetailData["customer"] | null;
      const address = (Array.isArray(rawAddress) ? (rawAddress as Array<OrderDetailData["address"]>)[0] : rawAddress) as OrderDetailData["address"] | null;
      const billingDetails = (orderData.billing_details ?? {}) as Record<string, unknown>;
      const paymentRecord = (paymentsData ?? [])[0] as OrderDetailData["payments"][number] | undefined;
      const shipping = shippingData as OrderDetailData["shipping"] | null;

      setOrderMeta({
        id: orderData.id,
        order_number: orderData.order_number,
        service_type: orderData.service_type || "Custom Build Service",
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
      });

      setCustomerName(customer?.name || "");
      setDiscordUsername(customer?.discord_username || "");
      setCustomerEmail(customer?.email || "");
      setCustomerPhone((customer?.phone || "").replace(/^\+91/, ""));
      setServiceType(orderData.service_type || "Custom Build Service");
      setCurrentStatus(orderData.current_status || ORDER_STATUSES[0]);
      setOrderSummary(orderData.order_summary || "");

      setStreetAddress(address?.street_address || "");
      setCity(address?.city || "");
      setState(address?.state || "");
      setPincode(address?.pincode || "");

      setProducts(Array.isArray(productsData) ? productsData.map((p: { id: string; type: string; name: string }) => ({ id: p.id, type: p.type as ProductEntry["type"], name: p.name })) : []);

      // Convert order_services -> SelectedServices
      const svcMap: SelectedServices = {};
      if (Array.isArray(servicesData)) {
        for (const s of servicesData as Array<{ service_id: string; quantity: number }>) {
          svcMap[s.service_id] = s.quantity;
        }
      }
      setSelectedServices(svcMap);

      setBilling({
        ...INITIAL_BILLING,
        shippingCost: shipping?.shipping_cost ?? (billingDetails.shippingCost as number) ?? 0,
        packagingCost: shipping?.packaging_cost ?? (billingDetails.packagingCost as number) ?? 0,
        extraCharges: (billingDetails.extraCharges as Array<{ id: string; label: string; amount: number }>) || [],
        flatDiscount: (billingDetails.flatDiscount as number) || 0,
        percentageDiscount: (billingDetails.percentageDiscount as number) || 0,
        taxPercentage: (billingDetails.taxPercentage as number) || 0,
        amountPaid: paymentRecord?.amount_paid ?? 0,
        paymentStatus: (paymentRecord?.payment_status as BillingState["paymentStatus"]) || "Payment Pending",
      });

      setLogistics({
        ...INITIAL_LOGISTICS,
        courier: shipping?.courier ?? "",
        trackingNumber: shipping?.tracking_number ?? "",
        trackingUrl: shipping?.tracking_url ?? "",
        estimatedDispatchDate: shipping?.estimated_dispatch_date ?? "",
        estimatedDeliveryDate: shipping?.estimated_delivery_date ?? "",
        shippingStatus: (shipping?.shipping_status as LogisticsState["shippingStatus"]) || "Not Dispatched",
      });

      setNotes(Array.isArray(internalNotesData) ? internalNotesData.map(toInternalNote) : []);
      setCustomerNotes(Array.isArray(customerNotesData) ? customerNotesData.map(toCustomerNote) : []);
      setCustomerMessage((messagesData as Array<{ message: string }> | null)?.[0]?.message || null);
      setQuotePrices({});

      // Split custom work by category
      const kb: CustomWorkItem[] = [];
      const ms: CustomWorkItem[] = [];
      if (Array.isArray(customWorkData)) {
        for (const item of customWorkData as Array<{
          id: string;
          category: string;
          title: string;
          description: string | null;
          price: number;
          quantity: number;
          notes: string | null;
        }>) {
          const cw: CustomWorkItem = {
            id: item.id,
            title: item.title || "",
            description: item.description || "",
            price: item.price || 0,
            quantity: item.quantity || 1,
            notes: item.notes || "",
          };
          if (item.category === "mouse") ms.push(cw);
          else kb.push(cw);
        }
      }
      setKeyboardCustomWork(kb);
      setMouseCustomWork(ms);

      setNewTimelineStatus(orderData.current_status || ORDER_STATUSES[0]);

      // Build snapshot
      const snapshot = {
        customer_name: customer?.name || "",
        discord_username: customer?.discord_username || "",
        customer_email: customer?.email || "",
        customer_phone: customer?.phone || "",
        service_type: orderData.service_type || "Custom Build Service",
        current_status: orderData.current_status || ORDER_STATUSES[0],
        order_summary: orderData.order_summary || "",
        street_address: address?.street_address || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.pincode || "",
        products: Array.isArray(productsData) ? productsData.map((p: { id: string; type: string; name: string }) => ({ id: p.id, type: p.type, name: p.name })) : [],
        selected_services: svcMap,
        billing: { ...INITIAL_BILLING, ...billingDetails, amountPaid: paymentRecord?.amount_paid ?? 0, paymentStatus: paymentRecord?.payment_status || "Payment Pending" },
        estimated_total: Number(orderData.estimated_total || 0),
        courier: shipping?.courier ?? "",
        tracking_number: shipping?.tracking_number ?? "",
        tracking_url: shipping?.tracking_url ?? "",
        estimated_dispatch_date: shipping?.estimated_dispatch_date || null,
        estimated_delivery: shipping?.estimated_delivery_date || null,
        shipping_status: shipping?.shipping_status || "Not Dispatched",
        internal_notes: Array.isArray(internalNotesData) ? internalNotesData.map(toInternalNote) : [],
        customer_notes: Array.isArray(customerNotesData) ? customerNotesData.map(toCustomerNote) : [],
        notes: (messagesData as Array<{ message: string }> | null)?.[0]?.message || null,
        quote_prices: {},
        custom_work: [
          ...kb.map(i => ({ ...i, category: "keyboard" })),
          ...ms.map(i => ({ ...i, category: "mouse" })),
        ],
      };
      serverSnapshot.current = snapshot as unknown as Record<string, unknown>;
      setInitialSnapshot(snapshot as unknown as Record<string, unknown>);

      if (Array.isArray(timelineData)) {
        setTimeline(timelineData as OrderTimelineRow[]);
      }

      setLoading(false);
    }

    fetchOrderData();
  }, [orderNumber, supabase]);

  const handleAddTimelineUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderMeta) return;

    setInsertingTimeline(true);

    try {
      const response = await fetch(`/api/orders/${orderMeta.id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newTimelineStatus,
          note: newTimelineNote || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to append update.");
        return;
      }

      setTimeline((prev) => [result.update as OrderTimelineRow, ...prev]);
      setCurrentStatus(newTimelineStatus);

      if (serverSnapshot.current) {
        (serverSnapshot.current as Record<string, unknown>).current_status = newTimelineStatus;
      }
      setInitialSnapshot((prev) => prev ? { ...prev, current_status: newTimelineStatus } : prev);

      setOrderMeta((prev) =>
        prev ? { ...prev, updated_at: new Date().toISOString() } : prev
      );

      setNewTimelineNote("");
      setSuccessMessage("Timeline updated.");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      console.error("[TimelineSubmit]", err);
      alert("Failed to add update.");
    } finally {
      setInsertingTimeline(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!orderMeta) return;

    if (!hasFormChanges) {
      setSuccessMessage("Changes saved successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setSaving(true);
    setGlobalError(null);
    setSuccessMessage(null);

    const deltaPayload: Record<string, unknown> = {};
    Object.keys(currentFormState).forEach((key) => {
      const currentVal = (currentFormState as unknown as Record<string, unknown>)[key];
      const snapshotVal = serverSnapshot.current![key];
      if (JSON.stringify(currentVal) !== JSON.stringify(snapshotVal)) {
        deltaPayload[key] = currentVal;
      }
    });

    try {
      const response = await fetch(`/api/orders/${orderMeta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deltaPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        setGlobalError(result.error || "Failed to save changes.");
        return;
      }

      serverSnapshot.current = JSON.parse(JSON.stringify(currentFormState));
      setInitialSnapshot(serverSnapshot.current);
      setSuccessMessage("Changes saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setGlobalError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderMeta) return;

    const confirmed = confirm(
      "Archive this order? It will be hidden but not permanently deleted."
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/orders/${orderMeta.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to archive order.");
        return;
      }

      router.push("/admin");
    } catch {
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return <FullPageLoading message="Loading order..." />;
  }

  if (globalError && !orderMeta) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <p className="mb-4 text-sm font-medium text-red-400">{globalError}</p>
          <button
            onClick={() => router.push("/admin")}
            className="text-xs font-bold text-[var(--acc)] hover:underline"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] pb-32">
      {successMessage && (
        <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--acc)] px-6 py-3 text-xs font-bold tracking-wide text-black shadow-2xl">
          ✓ {successMessage}
        </div>
      )}
      {globalError && orderMeta && (
        <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-xs font-bold tracking-wide text-white shadow-2xl">
          ⚠ {globalError}
        </div>
      )}

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
        hasChanges={hasFormChanges}
        orderNumber={orderMeta?.order_number ?? ""}
        onCancel={() => router.push("/admin")}
        onSave={handleSaveChanges}
        onDelete={handleDeleteOrder}
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
            <button
              type="submit"
              disabled={inserting}
              className="h-[38px] whitespace-nowrap rounded-lg border border-[var(--bdr)] bg-[var(--surf)] px-4 text-xs font-bold text-[var(--t1)] transition hover:bg-[var(--bg3)] disabled:opacity-40"
            >
              {inserting ? "..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </SectionCard>
  );
}

function SaveBar({
  saving, hasChanges, orderNumber, onCancel, onSave, onDelete,
}: {
  saving: boolean;
  hasChanges: boolean;
  orderNumber: string;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
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
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--bdr)] bg-[var(--bg2)]/40 px-4 py-2.5 text-xs font-bold text-[var(--t2)] transition hover:bg-[var(--surf)] hover:text-[var(--t1)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !hasChanges}
            className="min-w-[100px] rounded-lg bg-[var(--acc)] px-5 py-2.5 text-xs font-bold text-black transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
