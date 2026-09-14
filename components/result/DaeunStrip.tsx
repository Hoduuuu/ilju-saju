"use client";

import { useEffect, useRef } from "react";
import type { SajuResult } from "@/lib/saju/types";

export default function DaeunStrip({ result, accent }: { result: SajuResult; accent: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { daeun, currentDaeunIndex } = result;

  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (list && current) list.scrollLeft = current.offsetLeft - 20;
  }, [currentDaeunIndex]);

  return (
    <div>
      <p className="text-[13px] font-medium text-sub">
        {daeun.forward ? "순행" : "역행"} · 대운수 {daeun.startAge}
      </p>
      <ol ref={listRef} className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        {daeun.pillars.map((pillar, index) => {
          const current = index === currentDaeunIndex;
          return (
            <li
              key={pillar.age}
              aria-current={current ? "true" : undefined}
              className={`w-[68px] shrink-0 rounded-2xl py-2.5 text-center ${current ? "text-white" : "bg-white text-ink"}`}
              style={current ? { background: accent } : undefined}
            >
              <p className={`text-[11px] font-semibold ${current ? "text-white" : "text-sub"}`}>{pillar.age}세</p>
              <p className="font-hanja text-[20px] font-bold leading-tight">{pillar.hanja}</p>
              <p className={`text-[11px] font-medium ${current ? "text-white" : "text-sub"}`}>{current ? "지금" : pillar.korean}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
