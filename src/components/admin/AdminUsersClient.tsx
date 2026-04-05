"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  display_name: string;
  role: string;
  banned: boolean | null;
  ban_reason: string | null;
};

export function AdminUsersClient() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});
  const supabase = createClient();

  const load = useCallback(async () => {
    setErr(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, role, banned, ban_reason")
      .order("display_name", { ascending: true })
      .limit(500);
    if (error) setErr(error.message);
    else setRows((data as ProfileRow[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  async function setBanned(p: ProfileRow, banned: boolean) {
    const reason = (reasonDraft[p.id] ?? "").trim() || null;
    const { error } = await supabase
      .from("profiles")
      .update({
        banned,
        ban_reason: banned ? reason : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    if (error) alert(error.message);
    else void load();
  }

  return (
    <div className="space-y-4">
      {err && <p className="text-sm text-red-300">{err}</p>}
      <p className="text-xs text-[var(--text-muted)]">
        밴 시 해당 계정은 로그인 상태에서 대부분의 페이지로 이동할 수 없고 `/banned`로 안내됩니다. 해제하면 즉시 복구됩니다.
      </p>
      <ul className="space-y-3">
        {rows.map((p) => (
          <li key={p.id} className="glass-card space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-[var(--text)]">{p.display_name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {p.role === "admin" ? "관리자" : "일반"} · {p.id.slice(0, 8)}…
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.banned ? (
                  <button
                    type="button"
                    onClick={() => void setBanned(p, false)}
                    className="rounded-lg border border-emerald-400/40 px-3 py-1 text-sm text-emerald-100"
                  >
                    밴 해제
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void setBanned(p, true)}
                    className="rounded-lg border border-red-400/50 px-3 py-1 text-sm text-red-200"
                  >
                    밴
                  </button>
                )}
              </div>
            </div>
            {!p.banned && (
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">밴 시 사유 (선택, 저장 시 적용)</label>
                <input
                  className="input-ocean text-sm"
                  placeholder="예: 운영 정책 위반"
                  value={reasonDraft[p.id] ?? ""}
                  onChange={(e) => setReasonDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                />
              </div>
            )}
            {p.banned && p.ban_reason && (
              <p className="text-xs text-amber-100/90">
                사유: <span className="text-[var(--text)]">{p.ban_reason}</span>
              </p>
            )}
            {p.banned && <p className="text-xs font-medium text-rose-200">현재 밴 상태</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
