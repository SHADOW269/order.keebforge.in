"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    btnRef.current && (btnRef.current.style.transform = "scale(0.95)");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-[var(--bdr)] bg-[var(--surf)] px-4 py-2 text-sm font-medium text-[var(--t2)] transition hover:border-[var(--bdr-h)] hover:text-[var(--t1)] disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
