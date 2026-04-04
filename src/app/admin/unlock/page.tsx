"use client";

import { useState } from "react";

export default function AdminUnlockPage() {
  const [passphrase, setPassphrase] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(data.error ?? "실패");
    else setMsg("어드민으로 승격되었습니다. 새로고침 후 상단 메뉴에서 관리를 확인하세요.");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foam-light)]">개발자 잠금 해제</h1>
      <p className="text-sm text-[var(--text-muted)]">
        로그인한 뒤, 사이트 운영자만 아는 시크릿을 입력하세요. 시크릿은 서버 환경변수 <code className="rounded bg-black/30 px-1">ADMIN_SETUP_SECRET</code> 과 일치해야 합니다.
      </p>
      <form onSubmit={submit} className="glass-card space-y-4 p-6">
        {msg && <p className="text-sm text-[var(--foam-light)]">{msg}</p>}
        <input
          className="input-ocean"
          type="password"
          autoComplete="off"
          placeholder="시크릿"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-ocean w-full justify-center">
          {loading ? "확인 중..." : "어드민 활성화"}
        </button>
      </form>
    </div>
  );
}