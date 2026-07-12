import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

/** Admin routes must always fetch fresh data — no static generation. */
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[var(--bdr)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="text-sm font-bold tracking-tight text-[var(--t1)]"
              style={{ fontFamily: "var(--ff-d)" }}
            >
              KeebForge<span className="text-[var(--acc)]">.</span>in
            </Link>
            <div className="flex items-center gap-1">
              <NavLink href="/admin" exact>
                Dashboard
              </NavLink>
              <NavLink href="/admin/orders">
                All Orders
              </NavLink>
              <NavLink href="/admin/new">
                New Order
              </NavLink>
            </div>
          </div>
          <LogoutButton />
        </div>
      </nav>
      {children}
    </>
  );
}

function NavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--t2)] transition hover:bg-[var(--surf)] hover:text-[var(--t1)]"
    >
      {children}
    </Link>
  );
}
