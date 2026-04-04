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
});

export const metadata: Metadata = {
  title: "?ㅼ뀡以??숈깮 ?덈툕",
  description: "?ㅼ뀡以묓븰援??숈깮???꾪븳 鍮꾧났???덈툕 ???쇱젙, 湲됱떇, 怨쇱젣, 寃뚯떆?? 梨꾪똿",
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
            <p>鍮꾧났???숈깮???ъ씠?몄엯?덈떎. ?숆탳 怨듭떇 ?낆옣怨?臾닿??⑸땲??</p>
            <p className="mt-2">
              <Link href="/admin/unlock" aria-label="운영자 잠금 해제" className="text-[var(--text-muted)]/30 hover:text-[var(--text-muted)]">
                쨌
              </Link>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}