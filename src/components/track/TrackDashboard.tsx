"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { formatDate as fmtDate, formatDateTime as fmtDateTime, dateLabel as dtLabel } from "@/lib/types";
import {
  Package, CheckCircle, CreditCard, Search, Clock, Wrench,
  Beaker, Truck, Shield, Award, MessageCircle, PackageCheck,
  ChevronRight, Droplets, Zap, Layers, Sparkles, Hammer,
  CircuitBoard, MousePointer2,
} from "lucide-react";
import { INITIAL_BILLING, type BillingState } from "@/lib/types";
import { computeBillingTotals, computeServicesSubtotal } from "@/lib/order-compute";
import { formatINR } from "@/lib/types";
import { SERVICE_BY_ID } from "@/constants/services";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Product {
  id: string; type: string; name: string;
}

interface TimelineEntry {
  status: string;
  note: string | null;
  created_at: string;
}

interface CustomerNote {
  id: string; text: string; createdAt: string;
}

interface Stage {
  label: string;
  statuses: readonly string[];
}

interface TrackDashboardProps {
  orderNumber: string;
  status: string;
  serviceType: string | null;
  products: Product[];
  selectedServices: Record<string, number>;
  billingSummary: Record<string, unknown> | null;
  paymentStatus: string | null;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippingStatus: string | null;
  estimatedDispatch: string | null;
  estimatedDelivery: string | null;
  customerNotes: CustomerNote[];
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const STAGES: Stage[] = [
  { label: "Order Received", statuses: ["Order Received"] },
  { label: "Order Confirmed", statuses: ["Order Confirmed"] },
  { label: "Payment", statuses: ["Payment Pending", "Payment Received"] },
  { label: "Parts Ordered", statuses: ["Parts Booked", "Parts Shipped", "Parts Received"] },
  { label: "In Queue", statuses: ["In Queue"] },
  { label: "Assembly", statuses: ["Work Started"] },
  { label: "Testing", statuses: ["Testing"] },
  { label: "Packing & Shipping", statuses: ["Completed", "Packing", "Shipment Booked", "Shipment Picked Up"] },
  { label: "In Transit", statuses: ["In Transit"] },
  { label: "Delivered", statuses: ["Delivered"] },
  { label: "Warranty", statuses: ["Testing Warranty Active"] },
  { label: "Completed", statuses: ["Order Completed"] },
];

const STAGE_ICONS = [
  Package, CheckCircle, CreditCard, Search, Clock, Wrench,
  Beaker, Package, Truck, PackageCheck, Shield, Award,
];

const STAGE_PROGRESS: Record<string, number> = {
  "Order Received": 5,
  "Order Confirmed": 10,
  "Payment Pending": 15,
  "Payment Received": 20,
  "Parts Booked": 28,
  "Parts Shipped": 33,
  "Parts Received": 38,
  "In Queue": 42,
  "Work Started": 50,
  "Testing": 75,
  "Completed": 80,
  "Packing": 85,
  "Shipment Booked": 88,
  "Shipment Picked Up": 90,
  "In Transit": 93,
  "Delivered": 100,
  "Testing Warranty Active": 100,
  "Order Completed": 100,
};

function getStageIndex(status: string): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if ((STAGES[i].statuses as readonly string[]).includes(status)) return i;
  }
  return -1;
}

function getStatusLabel(status: string): string {
  const i = getStageIndex(status);
  if (i < 0) return status;
  return STAGES[i].label;
}

function getServiceIcon(id: string) {
  if (id.startsWith("switch-lube") || id.includes("lube")) return Droplets;
  if (id.includes("film")) return Layers;
  if (id.includes("spring")) return Zap;
  if (id.includes("combo")) return Sparkles;
  if (id.startsWith("stab")) return Wrench;
  if (id.includes("build") || id.includes("solder") || id.includes("assembly") || id.includes("desolder") || id.includes("foam") || id.includes("weight") || id.includes("hotswap")) return Hammer;
  if (id.includes("pcb") || id.includes("case-design") || id.includes("firmware") || id.includes("qmk")) return CircuitBoard;
  if (id.includes("mouse")) return MousePointer2;
  return Wrench;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return fmtDate(dateStr);
}

function formatDateTime(dateStr: string): string {
  return fmtDateTime(dateStr);
}

function dateLabel(dateStr: string): string {
  return dtLabel(dateStr);
}

function groupByDate(entries: TimelineEntry[]): Map<string, TimelineEntry[]> {
  const groups = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const key = dateLabel(e.created_at);
    const arr = groups.get(key) || [];
    arr.push(e);
    groups.set(key, arr);
  }
  return groups;
}

/* ─── Reusable card wrapper ──────────────────────────────────────────── */

function CardWrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-[var(--bdr)] bg-[var(--surf)] shadow-lg transition-all duration-300 hover:border-[var(--bdr-h)] hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--acc)] mb-2"
      style={{ fontFamily: "var(--ff-d)" }}
    >
      {children}
    </p>
  );
}

function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--t3)] mb-5"
      style={{ fontFamily: "var(--ff-d)" }}
    >
      {children}
    </p>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function TrackDashboard(props: TrackDashboardProps) {
  const {
    orderNumber, status, serviceType, products, selectedServices,
    billingSummary, paymentStatus,
    courier, trackingNumber, trackingUrl, shippingStatus,
    estimatedDispatch, estimatedDelivery,
    customerNotes, timeline,
    createdAt, updatedAt,
  } = props;

  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  const stageIdx = getStageIndex(status);
  const progress = STAGE_PROGRESS[status] ?? (stageIdx >= 0 ? Math.round((stageIdx / (STAGES.length - 1)) * 100) : 0);
  const hasProducts = products?.length > 0;
  const hasServices = selectedServices && Object.keys(selectedServices).length > 0;
  const hasShipping = courier || trackingNumber || shippingStatus;
  const timelineGroups = groupByDate(timeline);

  const { subtotal: servicesSubtotal } = computeServicesSubtotal(selectedServices || {});
  const billing = { ...INITIAL_BILLING, ...((billingSummary ?? {}) as Partial<BillingState>) } as BillingState;
  const totals = computeBillingTotals(billing, servicesSubtotal);

  useEffect(() => {
    if (reduced) return;
    const el = containerRef.current;
    if (!el) return;

    const anims = el.querySelectorAll("[data-anim]");
    if (anims.length) {
      animate(anims, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        delay: stagger(90, { start: 100 }),
        easing: "easeOutExpo",
      });
    }

    if (barRef.current) {
      animate(barRef.current, {
        width: [`0%`, `${progress}%`],
        duration: 1400,
        easing: "easeOutExpo",
        delay: 500,
      });
    }

    if (pctRef.current) {
      const counter = { v: 0 };
      animate(counter, {
        v: progress,
        duration: 1200,
        delay: 500,
        easing: "easeOutExpo",
        onUpdate: () => {
          if (pctRef.current) pctRef.current.textContent = `${Math.round(counter.v)}%`;
        },
      });
    }

    const tsteps = el.querySelectorAll("[data-tstep]");
    if (tsteps.length) {
      animate(tsteps, {
        opacity: [0, 1],
        translateX: [-8, 0],
        duration: 400,
        delay: stagger(35, { start: 700 }),
        easing: "easeOutExpo",
      });
    }

    const side = el.querySelectorAll("[data-side]");
    if (side.length) {
      animate(side, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 600,
        delay: stagger(70, { start: 300 }),
        easing: "easeOutExpo",
      });
    }
  }, [reduced, progress]);

  return (
    <div ref={containerRef} className="space-y-12 lg:space-y-16">

      {/* ═══ Hero Section ═══ */}
      <section data-anim style={reduced ? {} : { opacity: 0 }}>
        <SectionTitle>Status Centre</SectionTitle>
        <CardWrap className="overflow-hidden">
          <div className="p-7 md:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1
                    className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--t1)] leading-[1.15]"
                    style={{ fontFamily: "var(--ff-d)" }}
                  >
                    {orderNumber}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-[var(--acc-dim)] text-[var(--acc)] border border-[var(--acc)]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc)] animate-live-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-sm text-[var(--t2)] leading-relaxed">{serviceType || "Custom Build"}</p>
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-3">
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--t3)]" style={{ fontFamily: "var(--ff-d)" }}>Current Status</p>
                  <p className="text-base md:text-lg font-bold text-[var(--acc)] mt-1" style={{ fontFamily: "var(--ff-d)" }}>{getStatusLabel(status)}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--t3)]" style={{ fontFamily: "var(--ff-d)" }}>Last Updated</p>
                  <p className="text-base md:text-lg font-semibold text-[var(--t1)] mt-1">{timeAgo(updatedAt)}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--t3)]" style={{ fontFamily: "var(--ff-d)" }}>Order Date</p>
                  <p className="text-base md:text-lg font-semibold text-[var(--t1)] mt-1">{formatDate(createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--bdr)] px-7 md:px-8 lg:px-10 py-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]" style={{ fontFamily: "var(--ff-d)" }}>Build Progress</span>
              <span ref={pctRef} className="text-base font-bold text-[var(--acc)]" style={{ fontFamily: "var(--ff-d)" }}>
                {reduced ? `${progress}%` : "0%"}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg3)] overflow-hidden">
              <div
                ref={barRef}
                className="h-full rounded-full bg-[var(--acc)] shadow-[0_0_12px_var(--acc-dim)]"
                style={{ width: reduced ? `${progress}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[0.7rem] text-[var(--t3)]">Order Placed</span>
              <span className="text-[0.7rem] text-[var(--t3)]">Delivered</span>
            </div>
          </div>
        </CardWrap>
      </section>

      {/* ═══ Main Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-7 space-y-8 lg:space-y-10">

          {/* ─── Timeline ─── */}
          <section data-anim style={reduced ? {} : { opacity: 0 }}>
            <SectionTitle>Progress</SectionTitle>
            <CardWrap>
              <div className="p-7 md:p-8 lg:p-10">
                <div className="relative">
                  <div className="absolute left-[15px] top-1 bottom-1 w-px bg-[var(--bdr)]" />
                  <div className="space-y-0">
                    {STAGES.map((stage, i) => {
                      const Icon = STAGE_ICONS[i];
                      const completed = i < stageIdx;
                      const active = i === stageIdx;

                      return (
                        <div key={stage.label} data-tstep className="relative flex gap-4 py-2" style={reduced ? {} : { opacity: 0 }}>
                          <div
                            className="z-10 w-[30px] h-[30px] rounded-full border flex items-center justify-center shrink-0 transition-all duration-500"
                            style={{
                              backgroundColor: completed ? "var(--acc)" : "var(--bg2)",
                              borderColor: completed || active ? "var(--acc)" : "var(--bdr)",
                              boxShadow: active
                                ? "0 0 0 4px var(--acc-dim), 0 0 14px var(--acc-glow)"
                                : "none",
                            }}
                          >
                            {completed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-[#000]" />
                            ) : active ? (
                              <Icon className="w-3.5 h-3.5 text-[var(--acc)]" />
                            ) : (
                              <Icon className="w-3.5 h-3.5 text-[var(--t3)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p
                              className="text-sm font-semibold transition-colors"
                              style={{
                                fontFamily: "var(--ff-d)",
                                color: active ? "var(--acc)" : completed ? "var(--t1)" : "var(--t3)",
                              }}
                            >
                              {stage.label}
                            </p>
                            {active && status !== stage.label && (
                              <p className="text-[0.7rem] text-[var(--t2)] mt-0.5">{status}</p>
                            )}
                          </div>
                          {active && (
                            <span className="shrink-0 self-center w-2 h-2 rounded-full bg-[var(--acc)] animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardWrap>
          </section>

          {/* ─── Activity Feed ─── */}
          <section data-anim style={reduced ? {} : { opacity: 0 }}>
            <SectionTitle>Activity</SectionTitle>
            <CardWrap>
              <div className="p-7 md:p-8 lg:p-10">
                {timeline.length === 0 ? (
                  <p className="text-sm text-[var(--t3)] italic">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-10">
                    {Array.from(timelineGroups.entries()).map(([dateLabelText, entries]) => (
                      <div key={dateLabelText}>
                        <p
                          className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)] mb-5"
                          style={{ fontFamily: "var(--ff-d)" }}
                        >
                          {dateLabelText}
                        </p>
                        <div className="space-y-4">
                          {entries.map((e, ei) => (
                            <div
                              key={`${e.created_at}-${ei}`}
                              className="relative border-l border-[var(--bdr)] pl-5"
                            >
                              <span className="absolute left-[-4px] top-[7px] w-2 h-2 rounded-full bg-[var(--acc)] border-2 border-[var(--bg)]" />
                              <p
                                className="text-sm font-semibold text-[var(--t1)]"
                                style={{ fontFamily: "var(--ff-d)" }}
                              >
                                {e.status}
                              </p>
                              {e.note && (
                                <p className="text-sm text-[var(--t2)] mt-1 leading-relaxed">{e.note}</p>
                              )}
                              <p className="text-[0.7rem] text-[var(--t3)] mt-1.5">
                                {formatDateTime(e.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardWrap>
          </section>

          {/* ─── Products ─── */}
          {hasProducts && (
            <section data-anim style={reduced ? {} : { opacity: 0 }}>
              <SectionTitle>Included</SectionTitle>
              <CardWrap>
                <div className="p-7 md:p-8 lg:p-10">
                  <CardHeading>Products</CardHeading>
                  <div className="flex flex-wrap gap-3">
                    {products.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center rounded-full border border-[var(--bdr)] bg-[var(--bg2)] px-4 py-2 text-sm font-medium text-[var(--t1)]"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardWrap>
            </section>
          )}

        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 lg:space-y-8">

          {/* ─── Services Included ─── */}
          <section data-side style={reduced ? {} : { opacity: 0 }}>
            <CardWrap>
              <div className="p-7 md:p-8">
                <CardHeading>Services Included</CardHeading>
                {hasServices ? (
                  <div className="divide-y divide-[var(--bdr)]">
                    {Object.entries(selectedServices).map(([id, qty]) => {
                      const svc = SERVICE_BY_ID[id];
                      if (!svc) return null;
                      const Icon = getServiceIcon(id);
                      const showQty = svc.unit === "per_switch" || svc.unit === "per_stabilizer";
                      return (
                        <div key={id} className="flex items-center justify-between gap-8 py-5 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--acc-dim)]/60 shrink-0">
                              <Icon className="w-[18px] h-[18px] text-[var(--acc)]" />
                            </span>
                            <span className="text-sm font-semibold text-[var(--t1)] truncate">{svc.name}</span>
                          </div>
                          {showQty && (
                            <span className="text-sm font-semibold text-[var(--t3)] border border-[var(--bdr)] rounded-full px-2.5 py-0.5 shrink-0">
                              ×{qty}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--t3)] italic">No services have been added yet.</p>
                )}
              </div>
            </CardWrap>
          </section>

          {/* ─── Workshop Updates ─── */}
          <section data-side style={reduced ? {} : { opacity: 0 }}>
            <CardWrap>
              <div className="p-7 md:p-8">
                <CardHeading>Workshop Updates</CardHeading>
                {customerNotes.length === 0 ? (
                  <p className="text-sm text-[var(--t3)] italic">No workshop updates yet.</p>
                ) : (
                  <div className="space-y-5">
                    {[...customerNotes].reverse().map((n) => (
                      <div key={n.id}>
                        <div className="border-l-2 border-[var(--acc)]/30 pl-4">
                          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)] mb-1.5">
                            {formatDateTime(n.createdAt)}
                          </p>
                          <p className="text-sm text-[var(--t2)] leading-relaxed">
                            {n.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardWrap>
          </section>

          {/* ─── Payment ─── */}
          <section data-side style={reduced ? {} : { opacity: 0 }}>
            <CardWrap>
              <div className="p-7 md:p-8">
                <CardHeading>Payment</CardHeading>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Total</span>
                      <span className="text-lg font-bold text-[var(--t1)]" style={{ fontFamily: "var(--ff-d)" }}>
                        {formatINR(totals.grandTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Paid</span>
                      <span className="text-sm font-medium text-[var(--t1)]">{formatINR(billing.amountPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--bdr)]">
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Remaining</span>
                      <span className="text-sm font-bold text-[var(--acc)]" style={{ fontFamily: "var(--ff-d)" }}>
                        {formatINR(totals.remainingBalance)}
                      </span>
                    </div>
                  </div>
                {paymentStatus && (
                  <div className="mt-4 pt-4 border-t border-[var(--bdr)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Status</span>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{
                          fontFamily: "var(--ff-d)",
                          color: paymentStatus === "Paid" ? "var(--success)"
                            : paymentStatus === "Partially Paid" ? "var(--warning)"
                            : "var(--t3)",
                        }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          paymentStatus === "Paid" ? "bg-[var(--success)]"
                            : paymentStatus === "Partially Paid" ? "bg-[var(--warning)]"
                            : "bg-[var(--t3)]"
                        }`} />
                        {paymentStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardWrap>
          </section>

          {/* ─── Shipping ─── */}
          {hasShipping && (
            <section data-side style={reduced ? {} : { opacity: 0 }}>
              <CardWrap>
                <div className="p-7 md:p-8">
                  <CardHeading>Shipping</CardHeading>
                  <div className="space-y-4">
                    {courier && (
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Courier</p>
                        <p className="text-sm font-medium text-[var(--t1)] mt-0.5">{courier}</p>
                      </div>
                    )}
                    {trackingNumber && (
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Tracking Number</p>
                        <p className="text-sm font-mono text-[var(--t1)] mt-0.5">{trackingNumber}</p>
                      </div>
                    )}
                    {shippingStatus && (
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Status</p>
                        <p className="text-sm font-medium text-[var(--t1)] mt-0.5">{shippingStatus}</p>
                      </div>
                    )}
                    {estimatedDispatch && (
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Dispatch Date</p>
                        <p className="text-sm font-medium text-[var(--t1)] mt-0.5">{estimatedDispatch}</p>
                      </div>
                    )}
                    {estimatedDelivery && (
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Estimated Delivery</p>
                        <p className="text-sm font-medium text-[var(--t1)] mt-0.5">{estimatedDelivery}</p>
                      </div>
                    )}
                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[var(--acc)]/30 text-[var(--acc)] bg-[var(--acc)]/5 px-6 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-all duration-300 hover:bg-[var(--acc)] hover:text-black hover:shadow-[0_0_20px_var(--acc-glow)] w-full"
                        style={{ fontFamily: "var(--ff-d)" }}
                      >
                        Track Shipment
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardWrap>
            </section>
          )}

          {/* ─── Need Help ─── */}
          <section data-side style={reduced ? {} : { opacity: 0 }}>
            <CardWrap>
              <div className="p-7 md:p-8">
                <CardHeading>Need Help</CardHeading>
                <a
                  href="https://discord.com/users/@hardy_022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--bg2)] shrink-0 group-hover:bg-[var(--acc-dim)] transition-colors">
                    <MessageCircle className="w-4 h-4 text-[var(--t2)] group-hover:text-[var(--acc)] transition-colors" />
                  </span>
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--t3)]">Discord</p>
                    <p className="text-sm font-medium text-[var(--t1)] group-hover:text-[var(--acc)] transition-colors">
                      @hardy_022
                    </p>
                  </div>
                </a>
                <p className="text-[0.7rem] text-[var(--t3)] mt-4 pt-4 border-t border-[var(--bdr)]">
                  Reach out anytime for order inquiries.
                </p>
              </div>
            </CardWrap>
          </section>

        </div>
      </div>
    </div>
  );
}
