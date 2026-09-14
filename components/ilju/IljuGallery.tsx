"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FiveElement } from "manseryeok";
import IljuVisual from "./IljuVisual";
import { filterByElement, type IljuEntry } from "@/lib/ilju/data";
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
    <main className="px-5 pb-10 pt-8">
      <p className="text-[12px] font-bold tracking-[0.08em] text-sub">60일주 도감</p>
      <h1 className="mt-2 text-[22px] font-extrabold leading-[1.25] tracking-[-0.03em]">
        60가지 자연 중
        <br />
        나는 어디에 있을까요
      </h1>

      <div role="group" aria-label="오행으로 거르기" className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((item) => {
          const selected = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item.value)}
              className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition ${
                selected ? "bg-ink text-white" : "bg-soft text-sub"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2.5">
        {visible.map((entry) => (
          <li key={entry.id}>
            <Link href={`/ilju/${entry.id}`} aria-label={`${entry.korean}일주, ${entry.symbol}${myIljuId === entry.id ? ", 내 일주" : ""}`} className="block">
              <IljuVisual ilju={entry} radius="8px">
                <div className="relative flex h-full flex-col p-3 text-ink">
                  {myIljuId === entry.id && (
                    <span className="absolute right-3 top-3 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">나</span>
                  )}
                  <p className="font-hanja text-[20px] font-black leading-none tracking-[-0.03em]">{entry.hanja}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-snug">{entry.symbol}</p>
                </div>
              </IljuVisual>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
