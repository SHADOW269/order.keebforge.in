import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RevenueSection } from "@/components/admin/DashboardCharts";
import type { RevenueDataPoint } from "@/components/admin/DashboardCharts";
import { computeDashboardStats } from "@/lib/stats";
import { formatINR } from "@/lib/types";
import type { AdminOrdersListRow, OrderTimelineRow } from "@/lib/types";
import {
  Package, Banknote, Clock, Wrench, CheckCircle2,
} from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function toNumber(v: number | string | null) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? (n as number) : 0;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: orders, error }, { data: timelineData }] = await Promise.all([
    supabase
      .from("admin_orders_list")
      .select("id, order_number, customer_name, customer_email, customer_phone, discord_username, service_type, current_status, estimated_total, created_at, updated_at, street_address, city, state, pincode, shipping_status, payment_status")
      .order("created_at", { ascending: false }),
    supabase
      .from("order_timeline")
      .select("id, order_id, status, created_at")
      .order("created_at", { ascending: true }),
  ]);

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] p-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--ff-d)" }}>Admin Dashboard</h1>
        <p className="mt-4 text-red-400">Error: {error.message}</p>
      </main>
    );
  }

  const allOrders = (orders ?? []) as AdminOrdersListRow[];
  const allUpdates = (timelineData ?? []) as OrderTimelineRow[];
  const stats = computeDashboardStats(allOrders, allUpdates);

  const stages = [
    { name: "Orders Received", value: 0, color: "#3b82f6" },
    { name: "In Queue", value: 0, color: "#9494a6" },
    { name: "Assembly", value: 0, color: "#c9f31d" },
    { name: "Testing", value: 0, color: "#f59e0b" },
    { name: "Packing & Shipping", value: 0, color: "#7c6ff2" },
    { name: "In Transit", value: 0, color: "#f97316" },
    { name: "Delivered", value: 0, color: "#22c55e" },
    { name: "Warranty", value: 0, color: "#14b8a6" },
    { name: "Completed", value: 0, color: "#10b981" },
  ];

  for (const o of allOrders) {
    const s = o.current_status;
    if (s === "Order Completed") stages[8].value++;
    else if (s === "Testing Warranty Active") stages[7].value++;
    else if (s === "Delivered") stages[6].value++;
    else if (s === "In Transit") stages[5].value++;
    else if (["Completed", "Packing", "Shipment Booked", "Shipment Picked Up"].includes(s)) stages[4].value++;
    else if (s === "Testing") stages[3].value++;
    else if (["Parts Booked", "Parts Shipped", "Parts Received", "Work Started"].includes(s)) stages[2].value++;
    else if (["In Queue", "Payment Pending", "Payment Received"].includes(s)) stages[1].value++;
    else stages[0].value++;
  }

  const now = new Date();

  const revenueByYM = new Map<string, number>();
  for (const o of allOrders) {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueByYM.set(key, (revenueByYM.get(key) || 0) + toNumber(o.estimated_total));
  }
  const monthlyRevenue: RevenueDataPoint[] = [...revenueByYM.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, revenue]) => {
      const [y, m] = key.split("-");
      return { label: `${monthNames[parseInt(m) - 1]} ${y.slice(2)}`, revenue };
    });

  const last30 = new Date(now.getTime() - 30 * 86400000);
  const revenueByDay = new Map<string, number>();
  for (const o of allOrders) {
    const d = new Date(o.created_at);
    if (d < last30) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    revenueByDay.set(key, (revenueByDay.get(key) || 0) + toNumber(o.estimated_total));
  }
  const dailyRevenue: RevenueDataPoint[] = [...revenueByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([key, revenue]) => {
      const [, m, d] = key.split("-");
      return { label: `${parseInt(d)} ${monthNames[parseInt(m) - 1]}`, revenue };
    });

  const last12Weeks = new Date(now.getTime() - 84 * 86400000);
  const revenueByWeek = new Map<string, number>();
  for (const o of allOrders) {
    const d = new Date(o.created_at);
    if (d < last12Weeks) continue;
    const key = `${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, "0")}`;
    revenueByWeek.set(key, (revenueByWeek.get(key) || 0) + toNumber(o.estimated_total));
  }
  const weeklyRevenue: RevenueDataPoint[] = [...revenueByWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, revenue]) => {
      const [, w] = key.split("-W");
      return { label: `Wk ${parseInt(w)}`, revenue };
    });

  const revenueByYear = new Map<string, number>();
  for (const o of allOrders) {
    const d = new Date(o.created_at);
    const key = String(d.getFullYear());
    revenueByYear.set(key, (revenueByYear.get(key) || 0) + toNumber(o.estimated_total));
  }
  const yearlyRevenue: RevenueDataPoint[] = [...revenueByYear.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => ({ label: key, revenue }));

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--acc)]" style={{ fontFamily: "var(--ff-d)" }}>
              KeebForge Admin
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--t1)] mt-1 leading-[1.2]" style={{ fontFamily: "var(--ff-d)" }}>
              {greeting()}, Hardik<span className="text-[var(--acc)]">.</span>
            </h1>
            <p className="text-sm text-[var(--t2)] mt-1">{stats.totalOrders} total orders</p>
          </div>
          <Link href="/admin/new" className="btn-primary text-[0.65rem] px-5 py-2">
            + Create Order
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
          {[
            { icon: Package, label: "Total Orders", value: String(stats.totalOrders), trend: `${stats.createdThisMonth} this month` },
            { icon: Banknote, label: "Revenue", value: formatINR(stats.totalRevenue), trend: `${formatINR(stats.revenueThisMonth)} this month`, accent: true },
            { icon: Clock, label: "Pending Orders", value: String(stats.pendingOrders), trend: `${stats.pendingPaymentsCount} unpaid` },
            { icon: Wrench, label: "Warranty Cases", value: String(stats.warrantyActive), trend: stats.avgCompletionDays !== null ? `${stats.avgCompletionDays.toFixed(1)}d avg` : "—" },
            { icon: CheckCircle2, label: "Completed Orders", value: String(stats.completedOrders), trend: stats.totalOrders > 0 ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}% completion rate` : "—" },
          ].map((m, i) => (
            <div key={m.label} className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] shadow-lg p-4 flex items-center gap-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--acc-dim)]/60 shrink-0">
                <m.icon className="w-[18px] h-[18px] text-[var(--acc)]" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">{m.label}</p>
                <p className={`text-lg font-bold tracking-tight ${m.accent ? "text-[var(--acc)]" : "text-[var(--t1)]"}`} style={{ fontFamily: "var(--ff-d)" }}>
                  {m.value}
                </p>
                <p className="text-[0.6rem] text-[var(--t3)] truncate">{m.trend}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] shadow-lg p-6 md:p-7">
            <div className="flex items-start justify-between mb-6">
              <h2
                className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--t3)]"
                style={{ fontFamily: "var(--ff-d)" }}
              >
                Production Overview
              </h2>
              <span className="text-[0.65rem] font-medium text-[var(--t3)]">
                {allOrders.length - stages[7].value - stages[8].value} active &middot; {allOrders.length > 0 ? Math.round((stages[8].value / allOrders.length) * 100) : 0}% complete
              </span>
            </div>
            <div className="space-y-5">
              {stages.map((s) => {
                const pct = allOrders.length > 0 ? (s.value / allOrders.length) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-sm font-medium text-[var(--t1)]">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[var(--t1)]" style={{ fontFamily: "var(--ff-d)" }}>{s.value}</span>
                        <span className="text-[0.6rem] text-[var(--t3)] w-8 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] shadow-lg p-6 md:p-7">
            <h2
              className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--t3)] mb-6"
              style={{ fontFamily: "var(--ff-d)" }}
            >
              Revenue Analytics
            </h2>
            <RevenueSection
              daily={dailyRevenue}
              weekly={weeklyRevenue}
              monthly={monthlyRevenue}
              yearly={yearlyRevenue}
              totalRevenue={stats.totalRevenue}
              avgOrderValue={stats.avgOrderValue}
              pendingPaymentsValue={stats.pendingPaymentsValue}
            />
          </div>
        </section>

      </div>
    </main>
  );
}
