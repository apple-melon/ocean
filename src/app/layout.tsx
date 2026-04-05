import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { OceanBackdrop } from "@/components/OceanBackdrop";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "오션중 학생 허브",
  description:
    "오션중학교 학생을 위한 비공식 허브 — 일정, 급식, 과제, 게시판, 실시간 채팅",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full relative ocean-gradient text-[var(--text)]">
        <OceanBackdrop />
        <div className="relative z-10 flex min-h-dvh flex-col">
          <Nav />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="relative z-10 border-t border-[var(--surface-border)] py-6 text-center text-sm text-[var(--text-muted)]">
            <p>비공식 학생용 사이트입니다. 학교 공식 입장과 무관합니다.</p>
            <p className="mt-2">
              <Link
                href="/admin/unlock"
                aria-label="운영자 잠금 해제"
                className="text-[var(--text-muted)]/30 hover:text-[var(--text-muted)]"
              >
                ·
              </Link>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
