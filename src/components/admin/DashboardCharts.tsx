"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const ACCENT = "#c9f31d";
const GRID = "rgba(255,255,255,0.07)";
const TEXT = "#9a9aa8";

const tooltipStyle = {
  background: "#12151a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8,
  color: "#f0f0f5",
  fontSize: 12,
};

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export function RevenueSection({
  daily,
  weekly,
  monthly,
  yearly,
  totalRevenue,
  avgOrderValue,
  pendingPaymentsValue,
}: {
  daily: RevenueDataPoint[];
  weekly: RevenueDataPoint[];
  monthly: RevenueDataPoint[];
  yearly: RevenueDataPoint[];
  totalRevenue: number;
  avgOrderValue: number;
  pendingPaymentsValue: number;
}) {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const dataMap = { daily, weekly, monthly, yearly };
  const data = dataMap[range];

  const tabs = [
    { key: "daily" as const, label: "Daily" },
    { key: "weekly" as const, label: "Weekly" },
    { key: "monthly" as const, label: "Monthly" },
    { key: "yearly" as const, label: "Yearly" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setRange(t.key)}
            className={`rounded-lg px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition-all ${
              range === t.key
                ? "bg-[var(--acc)] text-black"
                : "text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--surf)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyChart label="No revenue data for this period." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.2} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: TEXT, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: TEXT, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={ACCENT}
              strokeWidth={2}
              fill="url(#revGrad)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-[var(--bg2)] p-4">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Total Revenue</p>
          <p
            className="mt-1 text-lg font-bold text-[var(--acc)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--bg2)] p-4">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">
            Avg Order Value
          </p>
          <p
            className="mt-1 text-lg font-bold text-[var(--t1)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            ₹{avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--bg2)] p-4">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">
            Pending Payments
          </p>
          <p
            className="mt-1 text-lg font-bold text-[var(--warning)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            ₹{pendingPaymentsValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-xs text-[var(--t3)]">
      {label}
    </div>
  );
}
