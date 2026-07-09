import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--t1)] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1
          className="text-6xl font-black tracking-tight text-[var(--acc)]"
          style={{ fontFamily: "var(--ff-d)" }}
        >
          404
        </h1>
        <p className="mt-4 text-lg text-[var(--t2)]">
          Page not found.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-[var(--acc)] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
