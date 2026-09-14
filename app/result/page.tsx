"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ResultView from "@/components/result/ResultView";
import InterpretationSections from "@/components/result/InterpretationSections";
import SummaryCardExport from "@/components/result/SummaryCardExport";
import { clearSaju } from "@/lib/input/storage";
import { useStoredInput } from "@/lib/input/useStoredInput";
import { calculateSaju } from "@/lib/saju/calculate";
import { getIlju } from "@/lib/ilju/data";
import { parseSections, parseSummary } from "@/lib/interpret/sections";
import { useInterpretation } from "@/lib/interpret/useInterpretation";
import { downloadElementAsPng, exportFileName } from "@/lib/export/download";

export default function ResultPage() {
  const router = useRouter();
  const stored = useStoredInput();
  const input = stored.input;
  const fullRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"summary" | "full" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const canSave = state.status === "done" && saving === null;

  async function save(kind: "summary" | "full") {
    const node = kind === "summary" ? summaryRef.current : fullRef.current;
    if (!node || !ilju) return;
    setSaving(kind);
    setSaveError(null);
    try {
      await downloadElementAsPng(node, exportFileName(ilju.korean, kind), kind === "summary" ? { width: 1080, height: 1920 } : undefined);
    } catch (error) {
      console.error("[export] PNG 저장 실패", error);
      setSaveError("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(null);
    }
  }

  const heroSentence =
    summary?.sentence ||
    (state.status === "streaming" ? <span aria-label="한 줄 요약을 쓰는 중" className="inline-block h-4 w-44 animate-pulse rounded bg-[#16181d]/12" /> : null);

  return (
    <>
      <ResultView
        result={result}
        ilju={ilju}
        heroKeywords={summary?.keywords}
        heroSentence={heroSentence}
        exportRef={fullRef}
        onReset={() => {
          clearSaju();
          router.push("/");
        }}
      >
        <InterpretationSections state={state} sections={sections} timeKnown={input.time !== null} accent={ilju.palette.ink} onRetry={retry} />

        <div data-export-ignore="true" className="mt-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!canSave}
              onClick={() => save("summary")}
              className="h-12 rounded-full bg-ink text-[15px] font-bold text-white disabled:bg-[#c9cdd6]"
            >
              {saving === "summary" ? "저장 중…" : "요약 카드 저장"}
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => save("full")}
              className="h-12 rounded-full border border-line text-[15px] font-bold text-ink disabled:text-[#9aa0ab]"
            >
              {saving === "full" ? "저장 중…" : "전체 결과 저장"}
            </button>
          </div>
          <p aria-live="polite" className="mt-2 text-center text-[12px] text-sub">
            {saveError ?? (state.status === "done" ? "PNG 이미지로 저장돼요." : "풀이가 끝나면 저장할 수 있어요.")}
          </p>
        </div>
      </ResultView>

      <SummaryCardExport
        ref={summaryRef}
        result={result}
        ilju={ilju}
        sentence={summary?.sentence || ilju.symbol}
        keywords={summary?.keywords.length ? summary.keywords : ilju.keywords}
      />
    </>
  );
}
