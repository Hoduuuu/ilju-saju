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
  const [share, setShare] = useState<{ status: "idle" | "saving" | "done" | "error"; url?: string; message?: string; copied?: boolean }>({ status: "idle" });

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

  /** 로컬에서 만든 결과와 풀이를 Supabase에 저장하고 공유 링크를 받는다 */
  async function createShareLink() {
    setShare({ status: "saving" });
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, interpretation: state.text }),
      });
      const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
      if (!response.ok || !body?.id) throw new Error(body?.message ?? "공유 링크를 만들지 못했어요.");
      // 배포 주소를 정해 두면 그 주소로, 아니면 지금 열린 주소로 링크를 만든다
      const base = process.env.NEXT_PUBLIC_SHARE_BASE_URL || window.location.origin;
      setShare({ status: "done", url: `${base.replace(/\/+$/, "")}/r/${body.id}` });
    } catch (error) {
      setShare({ status: "error", message: error instanceof Error ? error.message : "공유 링크를 만들지 못했어요." });
    }
  }

  async function copyShareLink() {
    if (!share.url) return;
    try {
      await navigator.clipboard.writeText(share.url);
      setShare((prev) => ({ ...prev, copied: true }));
    } catch {
      // 복사가 막힌 브라우저에서는 링크를 직접 선택해 복사하면 된다
    }
  }

  const heroSentence =
    summary?.sentence ||
    (state.status === "streaming" ? <span aria-label="한 줄 요약을 쓰는 중" className="inline-block h-4 w-44 animate-pulse rounded bg-[#1F1A1A]/12" /> : null);

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
              className="h-12 rounded-[var(--radius-control)] bg-key text-[15px] font-bold text-white transition hover:bg-key-hover disabled:bg-[#E4E1E1] disabled:text-[#9A9494]"
            >
              {saving === "summary" ? "저장 중…" : "요약 카드 저장"}
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => save("full")}
              className="h-12 rounded-[var(--radius-control)] bg-chip text-[15px] font-bold text-ink transition hover:bg-chip-hover disabled:text-[#9A9494] disabled:hover:bg-chip"
            >
              {saving === "full" ? "저장 중…" : "전체 결과 저장"}
            </button>
          </div>
          <p aria-live="polite" className="mt-2 text-center text-[12px] text-sub">
            {saveError ?? (state.status === "done" ? "PNG 이미지로 저장돼요." : "풀이가 끝나면 저장할 수 있어요.")}
          </p>

          {/* 공유 링크: 로컬에서만 만든다. 공유 사이트에서는 AI 풀이가 없어 보여 주지 않는다 */}
          {state.error?.code !== "disabled" && (
            <div className="mt-5 rounded-[var(--radius-card)] bg-soft p-4">
              <p className="text-[13px] font-semibold text-ink">공유 링크</p>
              <p className="mt-1 text-[12px] leading-relaxed text-sub">결과와 풀이를 저장해서 링크로 보여 줄 수 있어요. 링크를 아는 사람만 볼 수 있어요.</p>
              {share.status === "done" && share.url ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    readOnly
                    value={share.url}
                    aria-label="공유 링크"
                    onFocus={(e) => e.currentTarget.select()}
                    className="h-10 min-w-0 flex-1 rounded-[var(--radius-control)] bg-white px-3 text-[13px] text-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="h-10 shrink-0 rounded-[var(--radius-control)] bg-key px-3 text-[13px] font-bold text-white transition hover:bg-key-hover"
                  >
                    {share.copied ? "복사됨" : "복사"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={state.status !== "done" || share.status === "saving"}
                  onClick={createShareLink}
                  className="mt-3 h-10 w-full rounded-[var(--radius-control)] bg-white text-[14px] font-bold text-ink transition hover:bg-chip-hover disabled:text-[#9A9494] disabled:hover:bg-white"
                >
                  {share.status === "saving" ? "만드는 중…" : "공유 링크 만들기"}
                </button>
              )}
              {share.status === "error" && (
                <p role="alert" className="mt-2 text-[12px] font-medium text-[#c4312b]">
                  {share.message}
                </p>
              )}
            </div>
          )}
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
