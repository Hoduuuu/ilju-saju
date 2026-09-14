import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import TabBar from "@/components/TabBar";

const notoSansKr = Noto_Sans_KR({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "일주 — 만세력 사주",
  description: "만세력으로 계산한 내 사주와 60일주 도감",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f5f8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <div className="mx-auto min-h-dvh max-w-[430px] bg-white pb-24 shadow-[0_0_0_1px_var(--color-line)]">
          {children}
        </div>
        <TabBar />
      </body>
    </html>
  );
}
