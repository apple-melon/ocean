"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addPostComment, togglePostLike } from "@/app/board/actions";

export type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string;
};

export function PostDetailClient({
  postId,
  initialLikeCount,
  initialLiked,
  initialComments,
}: {
  postId: string;
  initialLikeCount: number;
  initialLiked: boolean;
  initialComments: CommentRow[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const [likeBusy, setLikeBusy] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refreshComments = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("post_comments")
      .select("id, body, created_at, user_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) return;
    if (!rows?.length) {
      setComments([]);
      return;
    }
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", ids);
    const map = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name ?? "학생"]));
    setComments(
      rows.map((r) => ({
        id: r.id,
        body: r.body,
        created_at: r.created_at,
        user_id: r.user_id,
        display_name: map[r.user_id] ?? "학생",
      }))
    );
  }, [postId, supabase]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setLiked(initialLiked);
  }, [initialLikeCount, initialLiked]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  async function toggleLike() {
    setErr(null);
    setLikeBusy(true);
    const res = await togglePostLike(postId);
    if (!res.ok) setErr(res.error);
    else {
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    }
    setLikeBusy(false);
    router.refresh();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const t = commentBody.trim();
    if (!t) return;
    setErr(null);
    setCommentBusy(true);
    const res = await addPostComment(postId, t);
    if (!res.ok) setErr(res.error);
    else {
      setCommentBody("");
      await refreshComments();
      router.refresh();
    }
    setCommentBusy(false);
  }

  return (
    <div className="space-y-6">
      {err && <p className="text-sm text-red-300">{err}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={likeBusy}
          onClick={() => void toggleLike()}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            liked
              ? "border-rose-400/50 bg-rose-500/15 text-rose-100"
              : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--foam)]/40 hover:text-[var(--foam-light)]"
          }`}
        >
          <span aria-hidden>♥</span>
          {liked ? "좋아요 취소" : "좋아요"} · {likeCount}
        </button>
        <Link href="/board" className="text-sm text-[var(--text-muted)] hover:text-[var(--foam-light)]">
          목록으로
        </Link>
      </div>

      <section className="glass-card space-y-4 p-5">
        <h2 className="text-lg font-semibold text-[var(--foam-light)]">댓글</h2>
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-[var(--surface-border)]/60 pb-3 last:border-0 last:pb-0">
              <p className="text-xs text-[var(--text-muted)]">
                {c.display_name} · {new Date(c.created_at).toLocaleString("ko-KR")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text)]">{c.body}</p>
            </li>
          ))}
        </ul>
        {comments.length === 0 && <p className="text-sm text-[var(--text-muted)]">아직 댓글이 없습니다.</p>}
        <form onSubmit={submitComment} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            className="input-ocean min-h-[80px] flex-1 resize-y"
            placeholder="댓글 (최대 2000자)"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            maxLength={2000}
          />
          <button type="submit" disabled={commentBusy} className="btn-ocean shrink-0">
            {commentBusy ? "등록 중..." : "댓글 달기"}
          </button>
        </form>
      </section>
    </div>
  );
}
