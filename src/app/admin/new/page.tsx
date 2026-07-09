"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerInfoSection from "@/components/admin/order-form/CustomerInfoSection";
import ShippingAddressSection from "@/components/admin/order-form/ShippingAddressSection";
import ProductsSection from "@/components/admin/order-form/ProductsSection";
import ServicesSection, {
  computeServicesSubtotal,
} from "@/components/admin/order-form/ServicesSection";
import BillingSection from "@/components/admin/order-form/BillingSection";
import LogisticsSection from "@/components/admin/order-form/LogisticsSection";
import NotesSection from "@/components/admin/order-form/NotesSection";
import CustomerMessageSection from "@/components/admin/order-form/CustomerMessageSection";
import AdminToCustomerSection from "@/components/admin/order-form/AdminToCustomerSection";
import type {
  ProductEntry,
  SelectedServices,
  BillingState,
  LogisticsState,
  InternalNote,
  CustomerNote,
  CustomWorkItem,
} from "@/lib/types";
import {
  INITIAL_BILLING,
  INITIAL_LOGISTICS,
  formatINR,
} from "@/lib/types";
import { computeBillingTotals } from "@/lib/order-compute";

/* ─── Types ──────────────────────────────────────────────────────── */

interface CustomerForm {
  customer_name: string;
  discord_username: string;
  customer_email: string;
  customer_phone: string;
  customer_message: string;
}

interface ShippingForm {
  street_address: string;
  city: string;
  pincode: string;
  state: string;
}

const INITIAL_CUSTOMER: CustomerForm = {
  customer_name: "",
  discord_username: "",
  customer_email: "",
  customer_phone: "",
  customer_message: "",
};

const INITIAL_SHIPPING: ShippingForm = {
  street_address: "",
  city: "",
  pincode: "",
  state: "",
};

/* ─── Section Card ───────────────────────────────────────────────── */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] shadow-lg">
      <div className="p-6 md:p-7">
        <p
          className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--t3)]"
          style={{ fontFamily: "var(--ff-d)" }}
        >
          {title}
        </p>
        <div className="mt-4 pt-4 border-t border-[var(--bdr)]">
          {children}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function NewOrderPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerForm>(INITIAL_CUSTOMER);
  const [shipping, setShipping] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});
  const [quotePrices, setQuotePrices] = useState<Record<string, number>>({});
  const [billing, setBilling] = useState<BillingState>(INITIAL_BILLING);
  const [logistics, setLogistics] = useState<LogisticsState>(INITIAL_LOGISTICS);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);

  const [keyboardCustomWork, setKeyboardCustomWork] = useState<CustomWorkItem[]>([]);
  const [mouseCustomWork, setMouseCustomWork] = useState<CustomWorkItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (submittingRef.current) return;
    submittingRef.current = true;

    if (!shipping.state) {
      setFormError("State / Union Territory is required.");
      submittingRef.current = false;
      return;
    }

    if (shipping.pincode.length > 0 && shipping.pincode.length !== 6) {
      setFormError("Pincode must be exactly 6 digits.");
      submittingRef.current = false;
      return;
    }

    const missing: string[] = [];
    if (!customer.customer_name.trim()) missing.push("Customer Name");
    if (!customer.customer_email.trim()) missing.push("Email");
    const phoneDigits = customer.customer_phone.replace(/\D/g, "");
    if (!phoneDigits) {
      missing.push("Phone / WhatsApp");
    } else if (phoneDigits.length !== 10) {
      setFormError("Phone / WhatsApp must be exactly 10 digits.");
      submittingRef.current = false;
      return;
    }
    if (missing.length > 0) {
      setFormError(`${missing.join(" & ")} ${missing.length === 1 ? "is" : "are"} required.`);
      submittingRef.current = false;
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customer.customer_name.trim(),
        discord_username: customer.discord_username.trim(),
        customer_email: customer.customer_email.trim(),
        customer_phone: `+91${customer.customer_phone.replace(/\D/g, "")}`,
        street_address: shipping.street_address.trim(),
        city: shipping.city.trim(),
        pincode: shipping.pincode.trim(),
        state: shipping.state,
        products,
        selected_services: selectedServices,
        quote_prices: quotePrices,
        custom_work: [
          ...keyboardCustomWork.map((i) => ({ ...i, category: "keyboard" })),
          ...mouseCustomWork.map((i) => ({ ...i, category: "mouse" })),
        ],
        billing,
        estimated_total: totals.grandTotal,
        courier: logistics.courier.trim(),
        tracking_number: logistics.trackingNumber.trim(),
        tracking_url: logistics.trackingUrl.trim(),
        estimated_dispatch_date: logistics.estimatedDispatchDate || null,
        estimated_delivery: logistics.estimatedDeliveryDate || null,
        shipping_status: logistics.shippingStatus,
        internal_notes: notes,
        customer_notes: customerNotes,
        notes: customer.customer_message.trim() || null,
        current_status: "Order Received",
        service_type: "Custom",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result: Record<string, unknown>;
      try {
        result = await response.json();
      } catch {
        setFormError("Unexpected server response. Please try again.");
        return;
      }

      if (!response.ok) {
        setFormError((result.error as string) || "Failed to create order.");
        return;
      }

      router.push("/admin");
    } catch (err) {
      console.error("[NewOrderPage]", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] pb-28">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ═══ Header ═══ */}
        <div className="mb-10 animate-fade-up">
          <p
            className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--acc)] mb-2"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            New Order
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--t1)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            Create New Order<span className="text-[var(--acc)]">.</span>
          </h1>
        </div>

        {/* ═══ Error Alert ═══ */}
        {formError && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 animate-slide-down" role="alert">
            {formError}
          </div>
        )}

        {/* ═══ Form ═══ */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ─── Customer Information ─── */}
          <SectionCard title="Customer Information">
            <CustomerInfoSection
              customer={customer}
              onChange={(patch) => setCustomer((prev) => ({ ...prev, ...patch }))}
            />
          </SectionCard>

          {/* ─── Shipping Address ─── */}
          <SectionCard title="Shipping Address">
            <ShippingAddressSection
              shipping={shipping}
              onChange={(patch) => setShipping((prev) => ({ ...prev, ...patch }))}
              pincodeError={shipping.pincode.length > 0 && shipping.pincode.length !== 6 ? "Must be exactly 6 digits" : undefined}
            />
          </SectionCard>

          {/* ─── Products ─── */}
          <SectionCard title="Products">
            <ProductsSection products={products} onChange={setProducts} />
          </SectionCard>

          {/* ─── Services ─── */}
          <SectionCard title="Services">
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

          {/* ─── Pricing ─── */}
          <SectionCard title="Pricing">
            <BillingSection
              billing={billing}
              onChange={setBilling}
              selectedServices={selectedServices}
              quotePrices={quotePrices}
            />
          </SectionCard>

          {/* ─── Logistics ─── */}
          <SectionCard title="Logistics">
            <LogisticsSection logistics={logistics} onChange={setLogistics} />
          </SectionCard>

          {/* ─── Customer → Admin ─── */}
          <SectionCard title="Customer Message">
            <CustomerMessageSection
              message={customer.customer_message || null}
              editable
              onMessageChange={(val) => setCustomer((prev) => ({ ...prev, customer_message: val }))}
            />
          </SectionCard>

          {/* ─── Admin → Customer ─── */}
          <SectionCard title="Updates">
            <AdminToCustomerSection notes={customerNotes} onChange={setCustomerNotes} />
          </SectionCard>

          {/* ─── Admin Internal Notes ─── */}
          <SectionCard title="Internal Notes">
            <NotesSection notes={notes} onChange={setNotes} />
          </SectionCard>

        </form>
      </div>

      {/* ═══ Sticky Action Bar ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--bdr)] bg-[var(--bg1)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <span className="block text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">
              Grand Total
            </span>
            <span
              className="text-xl font-bold text-[var(--acc)]"
              style={{ fontFamily: "var(--ff-d)" }}
            >
              {formatINR(totals.grandTotal)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-full border border-[var(--bdr)] px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--t2)] transition-all duration-200 hover:bg-[var(--surf)] hover:text-[var(--t1)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              onClick={(e) => {
                const form = (e.target as HTMLElement).closest("main")?.querySelector("form");
                if (form) form.requestSubmit();
              }}
              className="rounded-full bg-[var(--acc)] px-6 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-black transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_var(--acc-glow)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
