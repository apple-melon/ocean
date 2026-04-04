"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type LinkItem = { href: string; label: string };

export function NavClient({
  links,
  user,
  isAdmin,
}: {
  links: LinkItem[];
  user: User | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--foam-light)]"
          >
            {l.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link
              href="/profile"
              className="rounded-full px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--foam-light)]"
            >
              프로필
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-amber-200/90 hover:bg-white/5"
              >
                관리
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="ml-2 rounded-full border border-[var(--surface-border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--foam)]/40 hover:text-[var(--foam-light)]"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link href="/login" className="btn-ocean ml-2 text-sm">
            로그인
          </Link>
        )}
      </nav>

      <button
        type="button"
        className="rounded-lg p-2 text-[var(--foam-light)] md:hidden"
        aria-expanded={open}
        aria-label="메뉴"
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-30 border-b border-[var(--surface-border)] bg-[var(--ocean-deep)]/95 p-4 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-[var(--text)] hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">
                    프로필
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-amber-200 hover:bg-white/5">
                      관리
                    </Link>
                  )}
                  <button type="button" onClick={() => { setOpen(false); signOut(); }} className="rounded-lg px-3 py-2 text-left text-[var(--text-muted)] hover:bg-white/5">
                    로그아웃
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="btn-ocean mt-2 justify-center">
                  로그인
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
