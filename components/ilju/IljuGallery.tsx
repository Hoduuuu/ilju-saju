"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FiveElement } from "manseryeok";
import HorizontalScroll from "@/components/HorizontalScroll";
import IljuVisual from "./IljuVisual";
import { filterByElement, type IljuEntry } from "@/lib/ilju/data";
import { ELEMENTS, ELEMENT_HANJA } from "@/lib/saju/ganji";
import { ELEMENT_NAMES } from "@/lib/view/elements";
import { useStoredInput } from "@/lib/input/useStoredInput";
import { calculateSaju } from "@/lib/saju/calculate";

const FILTERS: { value: FiveElement | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "목", label: "木 나무" },
  { value: "화", label: "火 불" },
  { value: "토", label: "土 흙" },
  { value: "금", label: "金 쇠" },
  { value: "수", label: "水 물" },
];

export default function IljuGallery({ entries }: { entries: IljuEntry[] }) {
  const [filter, setFilter] = useState<FiveElement | "all">("all");
  const { input } = useStoredInput();
  const myIljuId = useMemo(() => {
    if (!input) return null;
    try {
      return calculateSaju(input).iljuId;
    } catch {
      return null;
    }
  }, [input]);

  const visible = filterByElement(entries, filter);

  return (
    <main className="px-5 pb-6 pt-8">
      <p className="text-[12px] font-bold tracking-[0.08em] text-sub">60일주 도감</p>
      <h1 className="mt-2 text-[22px] font-extrabold leading-[1.25] tracking-[-0.03em]">
        60가지 자연 중
        <br />
        나는 어디에 있을까요
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
        같은 자연이라도 시간에 따라 다른 모습이 돼요.
        <br />
        내 카드 말고 다른 순간들도 둘러보세요.
      </p>

      <HorizontalScroll role="group" aria-label="오행으로 거르기" wrapperClassName="-mx-5 mt-5" className="flex gap-2 px-5 pb-1">
        {FILTERS.map((item) => {
          const selected = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item.value)}
              className={`h-8 shrink-0 rounded-[var(--radius-control)] px-3 text-[13px] font-semibold transition ${
                selected ? "bg-key text-white hover:bg-key-hover" : "bg-chip text-ink hover:bg-chip-hover"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </HorizontalScroll>

      {filter === "all" ? (
        // 전체: 오행별로 묶어 한 줄씩 가로로 넘겨 본다
        <div className="mt-6 flex flex-col gap-7">
          {ELEMENTS.map((element) => {
            const group = filterByElement(entries, element);
            return (
              <section key={element} aria-labelledby={`element-${element}`}>
                <h2 id={`element-${element}`} className="flex items-baseline gap-1.5 text-[16px] font-extrabold tracking-[-0.02em]">
                  <span className="font-hanja">{ELEMENT_HANJA[element]}</span>
                  {ELEMENT_NAMES[element]}
                  <span className="text-[12px] font-semibold text-sub">{group.length}</span>
                </h2>
                {/* 위아래 여백은 카드가 떠오를 때 그림자·테두리가 잘리지 않게 하려는 것 */}
                <HorizontalScroll as="ul" wrapperClassName="-mx-5 mt-1" className="flex snap-x snap-mandatory scroll-px-5 gap-4 px-5 py-2">
                  {group.map((entry) => (
                    <li key={entry.id} className="w-[42%] shrink-0 snap-start">
                      <IljuCard entry={entry} mine={myIljuId === entry.id} />
                    </li>
                  ))}
                </HorizontalScroll>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4">
          {visible.map((entry) => (
            <li key={entry.id}>
              <IljuCard entry={entry} mine={myIljuId === entry.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function IljuCard({ entry, mine }: { entry: IljuEntry; mine: boolean }) {
  return (
    <Link
      href={`/ilju/${entry.id}`}
      aria-label={`${entry.korean}일주, ${entry.symbol}${mine ? ", 내 일주" : ""}`}
      /* 내 일주는 배지 대신 키컬러 테두리로 표시한다 */
      className={`block rounded-[var(--radius-card)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98] ${
        mine ? "outline outline-2 outline-offset-0 outline-key" : ""
      }`}
    >
      <IljuVisual ilju={entry}>
        {/* 글자는 오른쪽에 좌우 여백의 2배를 남긴다(우측 상단 마커 자리) */}
        <div className="flex flex-1 flex-col pb-3 pl-3 pr-6 pt-3 text-ink">
          <p className="shrink-0 font-hanja text-[20px] font-black leading-[1.2] tracking-[-0.03em]">{entry.hanja}</p>
          <p className="mt-0.5 shrink-0 text-[11px] font-semibold leading-snug">{entry.symbol}</p>
        </div>
      </IljuVisual>
    </Link>
  );
}
