"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function togglePostLike(
  postId: string
): Promise<{ ok: true; liked: boolean; likeCount: number } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: row } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (row) {
    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    if (error) return { ok: false, error: error.message };
  }

  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");

  return {
    ok: true,
    liked: !row,
    likeCount: count ?? 0,
  };
}

export async function addPostComment(
  postId: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const t = body.trim().slice(0, 2000);
  if (!t) return { ok: false, error: "댓글 내용을 입력하세요." };

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    user_id: user.id,
    body: t,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/board/${postId}`);
  revalidatePath("/board");

  return { ok: true };
}
