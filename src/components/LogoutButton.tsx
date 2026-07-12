"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ButtonLoader } from "@/components/ui/Loading";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  return (
    <ButtonLoader
      variant="secondary"
      loading={loading}
      loadingText="Signing out..."
      onClick={handleLogout}
    >
      Sign out
    </ButtonLoader>
  );
}
