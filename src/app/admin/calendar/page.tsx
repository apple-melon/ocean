import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminCalendarClient } from "@/components/admin/AdminCalendarClient";

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[var(--foam-light)]">달력 일정 관리</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin" className="text-[var(--text-muted)] hover:text-[var(--foam-light)]">
            ← 관리 홈
          </Link>
          <Link href="/calendar" className="text-[var(--text-muted)] hover:text-[var(--foam-light)]">
            달력 보기
          </Link>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        여기서 추가·수정한 일정은 학사 달력 페이지에 반영됩니다. Supabase에 <code className="rounded bg-black/30 px-1">002_calendar_events</code> 마이그레이션을 적용했는지 확인하세요.
      </p>
      <AdminCalendarClient />
    </div>
  );
}
