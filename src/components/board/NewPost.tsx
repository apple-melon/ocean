"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErr("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        body: body.trim(),
        author_id: user.id,
        anonymous: false,
      })
      .select("id")
      .single();
    if (error) setErr(error.message);
    else if (data?.id) router.push(`/board/${data.id}`);
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="glass-card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--foam-light)]">새 글</h2>
        <Link href="/board" className="text-sm text-[var(--text-muted)] hover:text-[var(--foam-light)]">
          목록
        </Link>
      </div>
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
        className="input-ocean min-h-[160px] resize-y"
        placeholder="내용"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={4000}
      />
      <p className="text-xs text-[var(--text-muted)]">작성자는 프로필 닉네임으로 표시됩니다.</p>
      <button type="submit" disabled={loading} className="btn-ocean">
        {loading ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}
