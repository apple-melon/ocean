import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewPost from "@/components/board/NewPost";
import Link from "next/link";

type Post = {
  id: string;
  created_at: string;
  title: string;
  body: string;
  anonymous: boolean;
};

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, created_at, title, body, anonymous")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foam-light)]">익명 게시판</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            욕설·개인정보·악의적 글은 삭제될 수 있습니다. 완전 익명이 아닙니다.
          </p>
        </div>
        <Link href="/" className="text-sm text-[var(--foam-light)] hover:underline">
          홈
        </Link>
      </div>

      <NewPost />

      {error && (
        <p className="rounded-lg bg-amber-500/15 p-4 text-sm text-amber-100">
          게시글을 불러오지 못했습니다. Supabase에 마이그레이션을 적용하고 환경변수를 확인하세요.
        </p>
      )}

      <ul className="space-y-4">
        {(posts as Post[] | null)?.map((p) => (
          <li key={p.id} className="glass-card p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-[var(--text)]">{p.title}</h2>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(p.created_at).toLocaleString("ko-KR")} · {p.anonymous ? "익명" : "닉네임 공개"}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">{p.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
