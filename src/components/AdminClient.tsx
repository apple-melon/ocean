"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  hidden: boolean;
  created_at: string;
};

export function AdminClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, hidden, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setPosts((data as Post[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function toggleHidden(p: Post) {
    const { error } = await supabase.from("posts").update({ hidden: !p.hidden }).eq("id", p.id);
    if (error) alert(error.message);
    else void load();
  }

  async function removePost(id: string) {
    if (!confirm("삭제할까요?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) alert(error.message);
    else void load();
  }

  return (
    <div className="space-y-4">
      {err && <p className="text-sm text-red-300">{err}</p>}
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-[var(--text)]">{p.title}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {new Date(p.created_at).toLocaleString("ko-KR")} · {p.hidden ? "숨김" : "표시"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleHidden(p)} className="rounded-lg border border-[var(--surface-border)] px-3 py-1 text-sm">
                {p.hidden ? "표시" : "숨김"}
              </button>
              <button type="button" onClick={() => removePost(p.id)} className="rounded-lg border border-red-400/40 px-3 py-1 text-sm text-red-200">
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}