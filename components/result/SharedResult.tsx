"use client";

import Link from "next/link";
import { useMemo } from "react";
import ResultView from "./ResultView";
import InterpretationSections from "./InterpretationSections";
import { calculateSaju } from "@/lib/saju/calculate";
import { getIlju } from "@/lib/ilju/data";
import { parseSections, parseSummary } from "@/lib/interpret/sections";
import type { SajuInput } from "@/lib/saju/types";

/** 공유 링크로 연 결과. 저장된 입력으로 사주를 다시 계산하고, 저장된 풀이 글을 그대로 보여 준다(읽기 전용) */
export default function SharedResult({ input, interpretation }: { input: SajuInput; interpretation: string }) {
  const result = useMemo(() => calculateSaju(input), [input]);
  const sections = useMemo(() => parseSections(interpretation), [interpretation]);
  const summary = sections.summary ? parseSummary(sections.summary) : null;
  const ilju = getIlju(result.iljuId);
  if (!ilju) return null;

  return (
    <ResultView result={result} ilju={ilju} heroKeywords={summary?.keywords} heroSentence={summary?.sentence}>
      <InterpretationSections
        state={{ status: "done", text: interpretation, error: null }}
        sections={sections}
        timeKnown={input.time !== null}
        accent={ilju.palette.ink}
        onRetry={() => {}}
      />
      <Link
        href="/"
        className="mt-6 flex h-12 items-center justify-center rounded-[var(--radius-control)] bg-key text-[15px] font-bold text-white transition hover:bg-key-hover"
      >
        나와 닮은 자연도 찾아보기
      </Link>
    </ResultView>
  );
}
