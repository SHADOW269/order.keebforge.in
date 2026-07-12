/* ─── Base Skeleton ─────────────────────────────────────────────────── */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`shimmer rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

/* ─── Stat Card Skeleton ───────────────────────────────────────────── */

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-6">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

/* ─── Table Row Skeleton ───────────────────────────────────────────── */

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-t border-[var(--bdr)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/* ─── Card Skeleton ────────────────────────────────────────────────── */

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-6">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/* ─── Form Section Skeleton ────────────────────────────────────────── */

function FormSectionSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-6 md:p-7">
      <Skeleton className="h-3 w-32 mb-4" />
      <div className="mt-4 pt-4 border-t border-[var(--bdr)] space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function FormSkeleton({ sections = 5 }: { sections?: number }) {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading form...">
      {Array.from({ length: sections }).map((_, i) => (
        <FormSectionSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Table Skeleton ───────────────────────────────────────────────── */

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)]" aria-busy="true" aria-label="Loading table...">
      <div className="border-b border-[var(--bdr)] p-6">
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg2)] text-left">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-4">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Order Detail Skeleton ────────────────────────────────────────── */

function OrderDetailSectionSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-6 md:p-7">
      <Skeleton className="h-3 w-40 mb-4" />
      <div className="mt-4 pt-4 border-t border-[var(--bdr)] space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] pb-32" aria-busy="true" aria-label="Loading order details">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 border-b border-[var(--bdr)] bg-[var(--bg1)]/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <OrderDetailSectionSkeleton key={i} />
          ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="space-y-5 rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-5 shadow-xl">
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Save bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center border-t border-[var(--bdr)] bg-[var(--bg1)]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard Skeleton ───────────────────────────────────────────── */

function ProductionBarSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] p-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Production overview */}
        <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] shadow-lg p-6 md:p-7">
          <div className="flex items-start justify-between mb-6">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="space-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductionBarSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Table */}
        <TableSkeleton rows={5} cols={6} />
      </div>
    </main>
  );
}
