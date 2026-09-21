"use client";

import { useId, useState, type ReactNode } from "react";

interface Props {
  title: string;
  /** 주면 제목 옆에 ⓘ 버튼이 생기고, 누르면 제목 아래에 이 설명이 펼쳐진다 */
  info?: ReactNode;
  children: ReactNode;
}

export default function InfoCard({ title, info, children }: Props) {
  const [open, setOpen] = useState(false);
  const infoId = useId();
  return (
    <section className="mt-4 rounded-[20px] bg-soft p-4">
      <div className="flex items-center gap-1">
        <h3 className="text-[13px] font-semibold text-sub">{title}</h3>
        {info && (
          <button
            type="button"
            data-export-ignore="true"
            aria-expanded={open}
            aria-controls={infoId}
            aria-label={`${title} 보는 법 ${open ? "접기" : "펼치기"}`}
            onClick={() => setOpen((v) => !v)}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold transition hover:bg-chip-hover ${open ? "bg-chip-hover text-ink" : "text-sub"}`}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="4.9" r="0.9" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
      {info && open && (
        <div id={infoId} data-export-ignore="true" className="mt-2 rounded-[var(--radius-control)] bg-white px-3 py-2.5 text-[12px] leading-relaxed text-sub">
          {info}
        </div>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}
