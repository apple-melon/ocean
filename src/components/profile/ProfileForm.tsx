"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  display_name: string;
  avatar_url: string | null;
  grade: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [grade, setGrade] = useState(profile.grade ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || "학생",
        avatar_url: avatarUrl.trim() || null,
        grade: grade.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) setMsg(error.message);
    else {
      setMsg("저장되었습니다.");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={save} className="glass-card max-w-lg space-y-4 p-6">
      {msg && <p className="text-sm text-[var(--foam-light)]">{msg}</p>}
      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">표시 이름</label>
        <input className="input-ocean" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">아바타 URL (선택)</label>
        <input className="input-ocean" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">학년 (선택)</label>
        <input className="input-ocean" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="예: 2" />
      </div>
      <button type="submit" disabled={loading} className="btn-ocean">
        {loading ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
