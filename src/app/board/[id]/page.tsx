import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PostDetailClient, type CommentRow } from "@/components/board/PostDetailClient";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function BoardPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select("id, title, body, created_at, author_id, anonymous")
    .eq("id", id)
    .maybeSingle();

  if (postErr || !post) notFound();

  const { data: authorProf } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", post.author_id)
    .maybeSingle();
  const authorLabel = post.anonymous ? "익명" : (authorProf?.display_name ?? "학생");

  const { count: likeCount } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  const { data: myLike } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: rawComments } = await supabase
    .from("post_comments")
    .select("id, body, created_at, user_id")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const commentUserIds = [...new Set((rawComments ?? []).map((c) => c.user_id))];
  let nameMap: Record<string, string> = {};
  if (commentUserIds.length > 0) {
    const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", commentUserIds);
    nameMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name ?? "학생"]));
  }

  const initialComments: CommentRow[] =
    rawComments?.map((c) => ({
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      user_id: c.user_id,
      display_name: nameMap[c.user_id] ?? "학생",
    })) ?? [];

  return (
    <div className="space-y-8">
      <article className="glass-card space-y-4 p-6">
        <h1 className="text-2xl font-bold text-[var(--foam-light)]">{post.title}</h1>
        <p className="text-xs text-[var(--text-muted)]">
          {new Date(post.created_at).toLocaleString("ko-KR")} · {authorLabel}
        </p>
        <div className="whitespace-pre-wrap border-t border-[var(--surface-border)]/80 pt-4 text-sm text-[var(--text)]">
          {post.body}
        </div>
      </article>

      <PostDetailClient
        postId={id}
        initialLikeCount={likeCount ?? 0}
        initialLiked={!!myLike}
        initialComments={initialComments}
      />
    </div>
  );
}
