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

const SITE_TITLE = "나와 닮은 자연을 찾아볼까요";
const SITE_DESCRIPTION = "생년월일로 만세력 사주를 계산하고, 나를 닮은 자연(일주)과 AI 풀이를 알려 드려요.";

export const metadata: Metadata = {
  // 링크 미리보기 이미지 주소를 절대 주소로 만들 때 쓴다
  metadataBase: new URL(process.env.NEXT_PUBLIC_SHARE_BASE_URL || "https://ilju-saju.vercel.app"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION, siteName: "ILJU · 만세력", locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
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
