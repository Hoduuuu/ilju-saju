import type { Ref } from "react";
import IljuVisual from "@/components/ilju/IljuVisual";
import { pillarColumns } from "@/lib/view/pillars";
import type { IljuEntry } from "@/lib/ilju/data";
import type { SajuResult } from "@/lib/saju/types";

interface Props {
  ref: Ref<HTMLDivElement>;
  result: SajuResult;
  ilju: IljuEntry;
  sentence: string;
  keywords: string[];
}

export default function SummaryCardExport({ ref, result, ilju, sentence, keywords }: Props) {
  return (
    <div aria-hidden className="pointer-events-none fixed top-0" style={{ left: -10_000 }}>
      <div ref={ref} className="flex flex-col bg-white" style={{ width: 1080, height: 1920 }}>
        <div style={{ width: 1080, height: 1440 }}>
          <IljuVisual ilju={ilju} rounded={false}>
            <div className="flex h-full flex-col px-[72px] pt-[80px] text-white">
              <ul className="flex flex-wrap gap-4">
                {keywords.map((keyword) => (
                  <li key={keyword} className="rounded-full bg-black/25 px-7 py-2.5 text-[34px] font-semibold">
                    #{keyword}
                  </li>
                ))}
              </ul>
              <p className="mt-10 font-hanja text-[200px] font-black leading-none tracking-[-0.04em]">{ilju.hanja}</p>
              <p className="mt-8 text-[52px] font-bold leading-tight">{ilju.symbol}</p>
            </div>
          </IljuVisual>
        </div>
        <div className="flex flex-1 flex-col justify-between px-[72px] py-[56px]">
          <p className="text-[44px] font-bold leading-[1.45] tracking-[-0.02em] text-ink">{sentence}</p>
          <div className="flex items-end justify-between">
            <div className="flex gap-5">
              {pillarColumns(result).map((col) => (
                <div
                  key={col.key}
                  className={`flex w-[120px] flex-col items-center rounded-[28px] py-4 font-hanja text-[60px] font-bold leading-tight ${col.highlight ? "text-white" : "bg-soft text-ink"}`}
                  style={col.highlight ? { background: ilju.palette.top } : undefined}
                >
                  <span>{col.pillar ? col.pillar.stemHanja : "?"}</span>
                  <span>{col.pillar ? col.pillar.branchHanja : "?"}</span>
                </div>
              ))}
            </div>
            <p className="text-[30px] font-semibold text-sub">일주 · 만세력</p>
          </div>
        </div>
      </div>
    </div>
  );
}
