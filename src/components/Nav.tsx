import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavClient } from "@/components/NavClient";

const links = [
  { href: "/", label: "홈" },
  { href: "/calendar", label: "달력" },
  { href: "/meals", label: "급식" },
  { href: "/homework", label: "과제" },
  { href: "/board", label: "게시판" },
  { href: "/chat", label: "채팅" },
];

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="relative sticky top-0 z-20 border-b border-[var(--surface-border)] bg-[var(--ocean-deep)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--foam-light)]">
          오션중 허브
        </Link>
        <NavClient links={links} user={user} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
