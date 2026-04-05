import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BannedSignOut } from "@/components/banned/BannedSignOut";

export default async function BannedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("banned, ban_reason")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.banned) redirect("/");

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <h1 className="text-2xl font-bold text-[var(--foam-light)]">이용이 제한된 계정입니다</h1>
      <p className="text-sm text-[var(--text-muted)]">
        운영 정책에 따라 게시·채팅 등 서비스 이용이 일시적으로 또는 영구적으로 제한되었습니다.
      </p>
      {profile.ban_reason ? (
        <div className="rounded-lg border border-[var(--surface-border)] bg-black/20 p-4 text-left text-sm text-[var(--text)]">
          <p className="text-xs text-[var(--text-muted)]">사유</p>
          <p className="mt-1 whitespace-pre-wrap">{profile.ban_reason}</p>
        </div>
      ) : null}
      <p className="text-xs text-[var(--text-muted)]">문의는 학교·운영 측 안내에 따르세요.</p>
      <div className="flex justify-center">
        <BannedSignOut />
      </div>
    </div>
  );
}
