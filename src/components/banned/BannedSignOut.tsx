"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BannedSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button type="button" disabled={loading} onClick={() => void signOut()} className="btn-ocean">
      {loading ? "처리 중..." : "로그아웃"}
    </button>
  );
}
