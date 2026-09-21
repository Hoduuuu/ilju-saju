"use client";

import { useEffect, useRef } from "react";
import HorizontalScroll from "@/components/HorizontalScroll";
import type { SajuResult } from "@/lib/saju/types";
import { daeunMeaning, tenGodLabel } from "@/lib/view/tenGods";

export default function DaeunStrip({ result, accent }: { result: SajuResult; accent: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { daeun, currentDaeunIndex } = result;

  useEffect(() => {
    const list = rootRef.current?.querySelector("ol");
    const current = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (list && current) {
      // 지금 대운이 왼쪽 흐림(40px)에 덮이지 않도록, 앞 대운이 살짝 보이는 자리(왼쪽에서 56px)에 둔다
      list.scrollLeft = current.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - 56;
    }
  }, [currentDaeunIndex]);

  return (
    <div ref={rootRef}>
      <p className="text-[13px] font-medium text-sub">
        {daeun.forward ? "순행" : "역행"} · 대운수 {daeun.startAge}
      </p>
      {/* 카드(bg-soft) 좌우 끝까지 넓혀 넘기고, 더 있는 쪽 끝은 카드 배경색으로 흐리게 한다 */}
      <HorizontalScroll as="ol" wrapperClassName="-mx-4 mt-2" className="flex gap-2 px-4 pb-1" fadeColor="#f6f7f9">
        {daeun.pillars.map((pillar, index) => {
          const current = index === currentDaeunIndex;
          return (
            <li
              key={pillar.age}
              aria-current={current ? "true" : undefined}
              className={`w-[72px] shrink-0 rounded-2xl py-2.5 text-center ${current ? "text-white" : "bg-white text-ink"}`}
              style={current ? { background: accent } : undefined}
            >
              <p className={`text-[11px] font-semibold ${current ? "text-white" : "text-sub"}`}>
                {pillar.age}세{current && " · 지금"}
              </p>
              <p className="font-hanja text-[20px] font-bold leading-tight">{pillar.hanja}</p>
              {/* 읽는 법 대신 나(일간)와의 관계를 보여 준다 */}
              <p className={`text-[11px] font-semibold ${current ? "text-white" : "text-sub"}`}>
                {tenGodLabel(pillar.stemTenGod, pillar.branchTenGod)}
              </p>
            </li>
          );
        })}
      </HorizontalScroll>
      <CurrentDaeun result={result} />
    </div>
  );
}

/** 지금 대운 한 줄 풀이 */
function CurrentDaeun({ result }: { result: SajuResult }) {
  const { daeun, currentDaeunIndex } = result;
  if (currentDaeunIndex === null) {
    return <p className="mt-3 text-[13px] leading-relaxed text-sub">첫 대운은 {daeun.startAge}세에 시작해요.</p>;
  }
  const pillar = daeun.pillars[currentDaeunIndex];
  const next = daeun.pillars[currentDaeunIndex + 1];
  const endAge = next ? next.age - 1 : pillar.age + 9;
  return (
    <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-ink">
      <span className="font-bold">
        지금 {pillar.age}~{endAge}세 · <span className="font-hanja">{pillar.hanja}</span> {tenGodLabel(pillar.stemTenGod, pillar.branchTenGod)}
      </span>
      <br />
      {daeunMeaning(pillar.stemTenGod, pillar.branchTenGod)}
    </p>
  );
}
