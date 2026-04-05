"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type UpcomingItem = { key: string; date: string; title: string };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function HomeClient({ upcoming }: { upcoming: UpcomingItem[] }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.section variants={item} className="text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[var(--foam)]">Ocean Middle School</p>
        <h1 className="mb-4 text-4xl font-bold text-[var(--foam-light)] sm:text-5xl">오션중 학생 허브</h1>
        <p className="mx-auto max-w-xl text-[var(--text-muted)]">
          일정·급식·과제를 한곳에서 보고, 익명 게시판과 채팅으로 소통하세요. 로그인 후 이용할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="btn-ocean">
            시작하기
          </Link>
          <Link
            href="/calendar"
            className="rounded-full border border-[var(--surface-border)] px-5 py-2.5 text-sm font-medium text-[var(--foam-light)] transition-colors hover:bg-white/5"
          >
            학사 달력
          </Link>
        </div>
      </motion.section>

      <motion.section variants={item} className="glass-card p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foam-light)]">다가오는 일정</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">예정된 일정이 없습니다. 달력 페이지에서 전체 일정을 확인하세요.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((e) => (
              <li
                key={e.key}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--surface-border)] pb-3 last:border-0 last:pb-0"
              >
                <span className="font-medium text-[var(--text)]">{e.title}</span>
                <span className="text-sm text-[var(--text-muted)]">{e.date}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <motion.section variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/meals", t: "급식", d: "이번 주 메뉴 확인" },
          { href: "/homework", t: "과제", d: "기기에 저장되는 체크리스트" },
          { href: "/board", t: "익명 게시판", d: "로그인 후 익명으로 글쓰기" },
          { href: "/chat", t: "채팅", d: "실시간 방" },
          { href: "/profile", t: "프로필", d: "닉네임·학년 설정" },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="glass-card group block p-5 transition-transform hover:-translate-y-0.5">
            <h3 className="mb-1 font-semibold text-[var(--foam-light)] group-hover:text-white">{card.t}</h3>
            <p className="text-sm text-[var(--text-muted)]">{card.d}</p>
          </Link>
        ))}
      </motion.section>
    </motion.div>
  );
}
