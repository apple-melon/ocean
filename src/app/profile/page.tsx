import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, grade")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="glass-card p-6">
        <p className="text-[var(--text-muted)]">프로필을 불러오지 못했습니다. DB 마이그레이션과 트리거를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foam-light)]">프로필</h1>
      <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
      <ProfileForm profile={profile} />
    </div>
  );
}
