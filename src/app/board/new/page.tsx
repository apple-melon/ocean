import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewPost from "@/components/board/NewPost";

export default async function BoardNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foam-light)]">글쓰기</h1>
      <NewPost />
    </div>
  );
}
