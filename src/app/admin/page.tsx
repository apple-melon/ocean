import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[var(--foam-light)]">관리</h1>
        <Link href="/admin/unlock" className="text-sm text-[var(--text-muted)] hover:text-[var(--foam-light)]">
          잠금 해제
        </Link>
      </div>
      <p className="text-sm text-[var(--text-muted)]">게시글 숨김/삭제. 채팅 메시지는 DB 대시보드에서 추가 정리할 수 있습니다.</p>
      <AdminClient />
    </div>
  );
}
