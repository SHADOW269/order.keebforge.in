export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--t3)] mb-4 border-b border-[var(--bdr)] pb-2.5"
      style={{ fontFamily: "var(--ff-d)" }}
    >
      {children}
    </div>
  );
}
