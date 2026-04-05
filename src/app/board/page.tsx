import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type Post = {
  id: string;
  created_at: string;
  title: string;
};

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, created_at, title")
    .order("created_at", { ascending: false })
    .limit(80);

  const list = (posts as Post[] | null) ?? [];
  const ids = list.map((p) => p.id);
  const likeCounts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: likes } = await supabase.from("post_likes").select("post_id").in("post_id", ids);
    for (const row of likes ?? []) {
      const pid = row.post_id as string;
      likeCounts[pid] = (likeCounts[pid] ?? 0) + 1;
    }
  }

  return (
    <div className="relative space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foam-light)]">게시판</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            글 제목을 누르면 본문·좋아요·댓글을 볼 수 있습니다. 우측 하단 아이콘으로 새 글을 씁니다.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-500/15 p-4 text-sm text-amber-100">
          게시글을 불러오지 못했습니다. Supabase 마이그레이션과 환경 변수를 확인하세요.
        </p>
      )}

      <ul className="divide-y divide-[var(--surface-border)]/80 rounded-xl border border-[var(--surface-border)] bg-black/15">
        {list.map((p) => (
          <li key={p.id}>
            <Link
              href={`/board/${p.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-white/5"
            >
              <span className="font-medium text-[var(--text)]">{p.title}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(p.created_at).toLocaleString("ko-KR")} · ♥ {likeCounts[p.id] ?? 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && !error && (
        <p className="text-sm text-[var(--text-muted)]">아직 글이 없습니다. 첫 글을 남겨 보세요.</p>
      )}

      <Link
        href="/board/new"
        aria-label="새 글 작성"
        className="fixed bottom-8 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--foam)]/90 text-2xl font-light text-[var(--ocean-deep)] shadow-lg ring-2 ring-[var(--ocean-deep)]/40 transition hover:bg-[var(--foam-light)] hover:scale-105"
      >
        +
      </Link>
    </div>
  );
}
