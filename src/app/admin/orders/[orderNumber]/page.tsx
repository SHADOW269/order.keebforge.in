import { createClient } from "@/lib/supabase/server";
import AdminOrderClient from "@/components/admin/AdminOrderClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, service_type, current_status, order_summary,
      estimated_total, billing_details, created_at, updated_at,
      customer:customer_id(id, name, email, phone, discord_username),
      address:address_id(id, street_address, city, state, pincode),
      products:order_products(id, type, name, sort_order),
      services:order_services(service_id, quantity),
      custom_work:order_custom_work(id, category, title, description, price, quantity, notes, sort_order),
      shipping:shipping_info(courier, tracking_number, tracking_url, shipping_status, shipping_cost, packaging_cost, estimated_dispatch_date, estimated_delivery_date),
      payments:payments(amount_paid, payment_status, paid_at),
      timeline:order_timeline(id, order_id, status, note, created_at),
      customer_messages:customer_messages(message),
      customer_notes:admin_customer_notes(id, text, created_at),
      internal_notes:admin_internal_notes(id, text, created_at)
    `
    )
    .eq("order_number", orderNumber.toUpperCase())
    .single();

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <p className="mb-4 text-sm font-medium text-red-400">Order not found.</p>
          <a
            href="/admin"
            className="text-xs font-bold text-[var(--acc)] hover:underline"
          >
            &larr; Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <AdminOrderClient order={order as unknown as Record<string, unknown>} />;
}
