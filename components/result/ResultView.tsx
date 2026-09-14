"use client";

import type { ReactNode, RefObject } from "react";
import IljuVisual from "@/components/ilju/IljuVisual";
import InfoCard from "./InfoCard";
import PillarGrid from "./PillarGrid";
import ElementBar from "./ElementBar";
import DaeunStrip from "./DaeunStrip";
import SeunCard from "./SeunCard";
import { formatBirth } from "@/lib/view/birth";
import type { IljuEntry } from "@/lib/ilju/data";
import type { SajuResult } from "@/lib/saju/types";

interface Props {
  result: SajuResult;
  ilju: IljuEntry;
  onReset: () => void;
  /** AI 요약 키워드. 없으면 일주 기본 키워드를 쓴다 */
  heroKeywords?: string[];
  heroSentence?: ReactNode;
  exportRef?: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
}

export default function ResultView({ result, ilju, onReset, heroKeywords, heroSentence, exportRef, children }: Props) {
  const accent = ilju.palette.top;
  const keywords = heroKeywords && heroKeywords.length > 0 ? heroKeywords : ilju.keywords;
  return (
    <main>
      <div ref={exportRef} className="bg-white">
        <IljuVisual ilju={ilju} rounded={false}>
          <div className="fade-up flex h-full flex-col px-6 pt-6 text-white">
            <ul className="flex flex-wrap gap-1.5">
              {keywords.map((keyword) => (
                <li key={keyword} className="rounded-full bg-black/25 px-3 py-1 text-[12px] font-semibold">
                  #{keyword}
                </li>
              ))}
            </ul>
            <h1 className="mt-3">
              <span aria-hidden className="block font-hanja text-[clamp(52px,17vw,68px)] font-black leading-none tracking-[-0.04em]">
                {ilju.hanja}
              </span>
              <span className="mt-2.5 block text-[17px] font-bold leading-snug">{ilju.symbol}</span>
              <span className="sr-only">
                {ilju.korean}일주 사주 결과
              </span>
            </h1>
            <div className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-relaxed">{heroSentence}</div>
          </div>
        </IljuVisual>

        <section aria-labelledby="sheet-title" className="relative -mt-8 rounded-t-[28px] bg-white px-5 pb-8 pt-3">
          <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-line" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <h2 id="sheet-title" className="text-[18px] font-extrabold tracking-[-0.02em]">
              {ilju.korean}일주의 사주
            </h2>
            <button
              type="button"
              onClick={onReset}
              data-export-ignore="true"
              className="h-9 shrink-0 rounded-full px-3 text-[14px] font-semibold text-sub hover:bg-soft"
            >
              다시 입력
            </button>
          </div>
          <p className="mt-1 text-[13px] text-sub">{formatBirth(result)}</p>

          {result.warnings.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {result.warnings.map((warning) => (
                <li key={warning.kind} className="rounded-xl bg-[#fff4d6] px-4 py-3 text-[13px] font-medium leading-relaxed text-[#6b4a00]">
                  {warning.message}
                </li>
              ))}
            </ul>
          )}

          <InfoCard title="사주 원국">
            <PillarGrid result={result} accent={accent} />
          </InfoCard>
          <InfoCard title="오행 밸런스">
            <ElementBar counts={result.elementCounts} />
          </InfoCard>
          <InfoCard title="대운 흐름">
            <DaeunStrip result={result} accent={accent} />
          </InfoCard>
          <SeunCard seun={result.seun} />

          {children}
        </section>
      </div>
    </main>
  );
}
