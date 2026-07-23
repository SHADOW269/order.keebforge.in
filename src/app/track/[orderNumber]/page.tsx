import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import TrackDashboard from "@/components/track/TrackDashboard";
import SiteNav from "@/components/SiteNav";

const getTrackingRecord = cache(async (orderNumber: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_tracking")
    .select(
      "order_number, status, service_type, products, selected_services, billing_summary, estimated_total, payment_status, shipping_status, tracking_number, tracking_url, courier, estimated_dispatch, estimated_delivery, customer_notes, timeline, warranty_status, warranty_start, warranty_end, created_at, updated_at"
    )
    .eq("order_number", orderNumber.toUpperCase())
    .single();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  const record = await getTrackingRecord(orderNumber);
  return {
    title: record ? `${record.order_number} — ${record.status}` : "Order Not Found",
    description: "Track your custom keyboard build progress with KeebForge.",
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const record = await getTrackingRecord(orderNumber);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0910] text-[var(--t1)] relative overflow-hidden font-sans antialiased">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#7c6ff2]/10 to-transparent blur-3xl pointer-events-none z-0" />

      <SiteNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-16 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--t3)] hover:text-[var(--acc)] transition-colors duration-300 mb-8 w-fit cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {!record ? (
          <div className="animate-scale-in rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm font-medium text-red-400 flex items-center gap-3" role="alert">
            <span aria-hidden>⚠️</span>
            <span>
              No order found for <span className="font-mono">{orderNumber}</span>.
              Double-check the number from your confirmation email.
            </span>
          </div>
        ) : (
          <TrackDashboard
            orderNumber={record.order_number}
            status={record.status}
            serviceType={record.service_type}
            products={record.products ?? []}
            selectedServices={record.selected_services ?? {}}
            billingSummary={record.billing_summary}
            estimatedTotal={record.estimated_total}
            paymentStatus={record.payment_status}
            courier={record.courier}
            trackingNumber={record.tracking_number}
            trackingUrl={record.tracking_url}
            shippingStatus={record.shipping_status}
            estimatedDispatch={record.estimated_dispatch}
            estimatedDelivery={record.estimated_delivery}
            customerNotes={record.customer_notes ?? []}
            timeline={record.timeline ?? []}
            createdAt={record.created_at}
            updatedAt={record.updated_at}
          />
        )}
      </main>
    </div>
  );
}
