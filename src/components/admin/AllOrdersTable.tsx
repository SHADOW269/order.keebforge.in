"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/types";
import type { AdminOrdersListRow } from "@/lib/types";

interface AllOrdersTableProps {
  orders: AdminOrdersListRow[];
}

export default function AllOrdersTable({ orders }: AllOrdersTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.order_number.toLowerCase().includes(q),
    );
  }, [orders, query]);

  return (
    <>
      <div className="mb-6 flex items-center gap-3 animate-fade-up">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--t3)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name or order number…"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-[var(--bdr)] bg-[var(--bg1)] pl-11 pr-10 text-sm text-[var(--t1)] transition focus:border-[var(--acc)]/30 focus:outline-none focus:shadow-[0_0_0_1.5px_var(--acc-dim)] placeholder:text-[var(--t3)]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--t3)] transition hover:text-[var(--t1)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="shrink-0 text-xs text-[var(--t3)]">
          {filtered.length === orders.length
            ? `${orders.length} order${orders.length !== 1 ? "s" : ""}`
            : `${filtered.length} of ${orders.length}`}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] animate-fade-up">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg2)] text-left">
                <tr>
                  {["Order", "Customer", "Service", "Status", "Created", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--t3)]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr
                    key={order.id}
                    className="border-t border-[var(--bdr)] transition-all hover:bg-[var(--surf)]"
                    style={{
                      animation: `fadeUp 0.4s var(--ease-out) ${0.3 + i * 0.03}s both`,
                    }}
                  >
                    <td className="p-4 font-mono font-semibold text-[var(--t1)]">
                      {order.order_number}
                    </td>
                    <td className="p-4 text-[var(--t1)]">{order.customer_name}</td>
                    <td className="p-4 text-[var(--t2)]">{order.service_type}</td>
                    <td className="p-4">
                      <StatusBadge status={order.current_status} />
                    </td>
                    <td className="p-4 text-[var(--t3)]">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.order_number}`}
                        className="font-semibold text-[var(--acc)] transition hover:brightness-110"
                      >
                        Edit &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-[var(--t3)]">
            {query.trim()
              ? "No orders match your search."
              : "No orders yet."}
          </div>
        )}
      </div>
    </>
  );
}
