"use client";

import type { ReactNode, RefObject } from "react";
import IljuVisual from "@/components/ilju/IljuVisual";
import KeywordRow from "@/components/ilju/KeywordRow";
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
  const accent = ilju.palette.ink;
  const keywords = heroKeywords && heroKeywords.length > 0 ? heroKeywords : ilju.keywords;
  return (
    <main>
      <div ref={exportRef} className="bg-white">
        {/* 아래 흰 시트가 32px(-mt-8) 겹쳐 올라온다 */}
        <IljuVisual ilju={ilju} rounded={false} sheetOverlap={32} marker={false}>
          <div className="fade-up flex flex-1 flex-col px-6 pt-5 text-ink">
            <KeywordRow keywords={keywords} branch={ilju.branch} />
            {/* 글자는 오른쪽에 좌우 여백의 2배(48px)를 남기고, 넘치면 단어 단위로 줄바꿈한다 */}
            <h1 className="mt-6 shrink-0 pr-6">
              <span aria-hidden className="block font-hanja text-[clamp(52px,17vw,68px)] font-black leading-[1.2] tracking-[-0.04em]">
                {ilju.hanja}
              </span>
              <span className="mt-1 block text-[17px] font-bold leading-snug">{ilju.symbol}</span>
              <span className="sr-only">
                {ilju.korean}일주 사주 결과
              </span>
            </h1>
            <div className="mt-1 line-clamp-2 pr-6 text-[14px] font-medium leading-snug text-ink/80">{heroSentence}</div>
          </div>
        </IljuVisual>

        <section aria-labelledby="sheet-title" className="relative -mt-8 rounded-t-[28px] bg-white px-5 pb-8 pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="sheet-title" className="text-[18px] font-extrabold tracking-[-0.02em]">
              {ilju.korean}일주의 사주
            </h2>
            <button
              type="button"
              onClick={onReset}
              data-export-ignore="true"
              className="h-9 shrink-0 rounded-[var(--radius-control)] px-3 text-[14px] font-semibold text-sub transition hover:bg-chip hover:text-ink"
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
          <SeunCard seun={result.seun} />
          <InfoCard
            title="대운 흐름"
            info={
              <ul className="flex flex-col gap-1">
                <li>대운은 10년마다 바뀌는 인생의 큰 흐름이에요. 올해의 기운이 그해의 날씨라면, 대운은 10년 동안 이어지는 계절이에요.</li>
                <li>· 카드 위 숫자는 그 대운이 시작하는 나이예요. 32세라면 32~41세예요.</li>
                <li>· 대운수는 첫 대운이 시작하는 나이예요. 순행·역행은 태어난 달의 간지에서 앞으로 또는 거꾸로 짚어 간다는 뜻이에요.</li>
                <li>· 한자 아래 이름(정관, 편재 등)은 그 10년의 기운이 나에게 어떤 역할인지 보여 줘요.</li>
              </ul>
            }
          >
            <DaeunStrip result={result} accent={accent} />
          </InfoCard>

          {children}
        </section>
      </div>
    </main>
  );
}
