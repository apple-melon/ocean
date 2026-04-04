"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      body: body.trim(),
      author_id: user.id,
      anonymous,
    });
    if (error) setErr(error.message);
    else {
      setTitle("");
      setBody("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="glass-card mb-8 space-y-4 p-5">
      <h2 className="text-lg font-semibold text-[var(--foam-light)]">새 글</h2>
      {err && <p className="text-sm text-red-300">{err}</p>}
      <input
        className="input-ocean"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={200}
      />
      <textarea
        className="input-ocean min-h-[120px] resize-y"
        placeholder="내용"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={4000}
      />
      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
        익명으로 표시 (운영자는 내부 기록으로 식별 가능)
      </label>
      <button type="submit" disabled={loading} className="btn-ocean">
        {loading ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}
