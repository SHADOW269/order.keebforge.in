import { createClient } from "@/lib/supabase/server";
import AllOrdersTable from "@/components/admin/AllOrdersTable";
import type { AdminOrdersListRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function AllOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { count } = await supabase
    .from("admin_orders_list")
    .select("id", { count: "exact", head: true });

  const { data: orders, error } = await supabase
    .from("admin_orders_list")
    .select("id, order_number, customer_name, customer_email, customer_phone, discord_username, service_type, current_status, estimated_total, created_at, updated_at, street_address, city, state, pincode, shipping_status, payment_status")
    .order("created_at", { ascending: false })
    .range(from, to);

  const allOrders = (orders ?? []) as AdminOrdersListRow[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] p-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--ff-d)" }}>
          All Orders
        </h1>
        <p className="mt-4 text-red-400">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)]">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 animate-fade-up">
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--acc)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            KeebForge Admin
          </p>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            All Orders<span className="text-[var(--acc)]">.</span>
          </h1>
        </div>

        <AllOrdersTable
          orders={allOrders}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </div>
    </main>
  );
}
