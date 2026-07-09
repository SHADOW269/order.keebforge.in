import { StatCardSkeleton, CardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] p-8">
      <div className="mx-auto max-w-7xl space-y-10 animate-pulse-slow">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded bg-[var(--bg3)]" />
            <div className="h-8 w-56 rounded bg-[var(--bg3)]" />
            <div className="h-4 w-40 rounded bg-[var(--bg3)]" />
          </div>
          <div className="h-10 w-40 rounded-lg bg-[var(--bg3)]" />
        </div>

        <div className="space-y-6">
          <div className="h-4 w-20 rounded bg-[var(--bg3)]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-4 w-24 rounded bg-[var(--bg3)]" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] overflow-hidden">
          <div className="border-b border-[var(--bdr)] p-6">
            <div className="h-6 w-32 rounded bg-[var(--bg3)]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg2)] text-left">
                <tr>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="p-4">
                      <div className="h-3 w-16 rounded bg-[var(--bg3)]" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={6} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
