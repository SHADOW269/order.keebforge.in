export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] border border-[var(--bdr)] bg-[var(--surf)] shadow-2xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  orderNumber,
  serviceType,
  status,
}: {
  orderNumber: string;
  serviceType: string | null;
  status: string;
}) {
  return (
    <div className="bg-[var(--bg2)] border-b border-[var(--bdr)] p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span
            className="text-lg font-black tracking-wider text-[var(--t1)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            {orderNumber}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-[var(--acc-dim)] text-[var(--acc)] border border-[var(--bdr)]"
            style={{ fontFamily: "var(--ff-d)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--acc)] animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-xs text-[var(--t2)]">{serviceType || "Custom Bench Build"}</p>
      </div>
      <div className="sm:text-right">
        <p className="text-sm font-bold text-[var(--t1)]" style={{ fontFamily: "var(--ff-d)" }}>
          {status}
        </p>
        <p className="text-[11px] text-[var(--t3)] mt-0.5">Current Status</p>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-5 shadow-md">
      <h2
        className="mb-4 text-base font-semibold tracking-tight text-[var(--t1)]"
        style={{ fontFamily: "var(--ff-d)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--bdr)] bg-[var(--bg1)] p-6">
      <h3
        className="mb-4 text-sm font-semibold tracking-tight text-[var(--t1)]"
        style={{ fontFamily: "var(--ff-d)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
