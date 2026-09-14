"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ResultView from "@/components/result/ResultView";
import InterpretationSections from "@/components/result/InterpretationSections";
import { clearSaju } from "@/lib/input/storage";
import { useStoredInput } from "@/lib/input/useStoredInput";
import { calculateSaju } from "@/lib/saju/calculate";
import { getIlju } from "@/lib/ilju/data";
import { parseSections, parseSummary } from "@/lib/interpret/sections";
import { useInterpretation } from "@/lib/interpret/useInterpretation";

export default function ResultPage() {
  const router = useRouter();
  const stored = useStoredInput();
  const input = stored.input;

  const result = useMemo(() => {
    if (!input) return null;
    try {
      return calculateSaju(input);
    } catch {
      return null;
    }
  }, [input]);

  useEffect(() => {
    if (!stored.ready) return;
    if (!result) {
      if (stored.raw) clearSaju();
      router.replace("/");
    }
  }, [stored.ready, stored.raw, result, router]);

  const { state, retry } = useInterpretation(result ? input : null);
  const sections = useMemo(() => parseSections(state.text), [state.text]);
  const summary = sections.summary ? parseSummary(sections.summary) : null;

  if (!result || !input) return <div className="min-h-dvh" aria-busy="true" />;
  const ilju = getIlju(result.iljuId);
  if (!ilju) return null;

  const heroSentence =
    summary?.sentence ||
    (state.status === "streaming" ? <span aria-label="한 줄 요약을 쓰는 중" className="inline-block h-4 w-44 animate-pulse rounded bg-white/30" /> : null);

  return (
    <ResultView
      result={result}
      ilju={ilju}
      heroKeywords={summary?.keywords}
      heroSentence={heroSentence}
      onReset={() => {
        clearSaju();
        router.push("/");
      }}
    >
      <InterpretationSections state={state} sections={sections} timeKnown={input.time !== null} accent={ilju.palette.top} onRetry={retry} />
    </ResultView>
  );
}
