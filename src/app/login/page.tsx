"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function explainAuthError(msg: string): string {
    const lower = msg.toLowerCase();
    if (
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("load failed")
    ) {
      return [
        "Supabase 서버와 연결되지 않았습니다.",
        "① Vercel → Settings → Environment Variables에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY가 있는지 확인",
        "② 값 앞뒤 공백·오타 없는지 확인 (URL은 https://xxxx.supabase.co 형태)",
        "③ 변수를 새로 넣거나 바꿨다면 반드시 Redeploy(다시 배포)",
        "④ Supabase 대시보드에서 프로젝트가 일시정지(Paused)되지 않았는지 확인",
      ].join(" ");
    }
    return msg;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

    if (!url || !anon) {
      setMessage(
        "Supabase 주소/키가 없습니다. Vercel 환경 변수에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 넣은 뒤 다시 배포하세요."
      );
      setLoading(false);
      return;
    }

    if (url.includes("placeholder.supabase.co")) {
      setMessage(
        "아직 빌드용 placeholder 주소입니다. 실제 Supabase Project URL로 환경 변수를 바꾼 뒤 Vercel에서 Redeploy 하세요."
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) setMessage(explainAuthError(error.message));
        else
          setMessage(
            "가입 요청이 완료되었습니다. 이메일을 확인하거나 Supabase에서 이메일 확인을 비활성화한 경우 바로 로그인해 보세요."
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(explainAuthError(error.message));
        else {
          router.refresh();
          router.push("/");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(explainAuthError(msg));
    }
    setLoading(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md">
      <div className="glass-card p-8">
        <h1 className="mb-2 text-2xl font-bold text-[var(--foam-light)]">로그인</h1>
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          이메일로 계정을 만들거나 로그인하세요. 비공식 학생 허브입니다.
        </p>
        {message && (
          <p className="mb-4 rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
            {message}
          </p>
        )}
        <div className="mb-6 flex rounded-full bg-black/20 p-1">
          <button
            type="button"
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-[var(--foam)]/20 text-[var(--foam-light)]" : "text-[var(--text-muted)]"}`}
            onClick={() => setMode("login")}
          >
            로그인
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-[var(--foam)]/20 text-[var(--foam-light)]" : "text-[var(--text-muted)]"}`}
            onClick={() => setMode("signup")}
          >
            회원가입
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--text-muted)]">이메일</label>
            <input
              className="input-ocean"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--text-muted)]">비밀번호</label>
            <input
              className="input-ocean"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-ocean w-full justify-center">
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link href="/" className="text-[var(--foam-light)] hover:underline">
            홈으로
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
