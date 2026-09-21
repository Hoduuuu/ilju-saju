"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/result", label: "내 사주", match: (p: string) => p === "/" || p.startsWith("/result") },
  { href: "/ilju", label: "일주 도감", match: (p: string) => p.startsWith("/ilju") },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-40">
      <div
        className="mx-auto flex max-w-[430px] border-t border-line bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[13px] font-semibold ${
                active ? "text-ink" : "text-sub transition hover:text-ink"
              }`}
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${active ? "bg-ink" : "bg-transparent"}`} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
