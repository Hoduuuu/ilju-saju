"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ResultView from "@/components/result/ResultView";
import { clearSaju } from "@/lib/input/storage";
import { useStoredInput } from "@/lib/input/useStoredInput";
import { calculateSaju } from "@/lib/saju/calculate";
import { getIlju } from "@/lib/ilju/data";

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

  if (!result) return <div className="min-h-dvh" aria-busy="true" />;
  const ilju = getIlju(result.iljuId);
  if (!ilju) return null;

  return (
    <ResultView
      result={result}
      ilju={ilju}
      onReset={() => {
        clearSaju();
        router.push("/");
      }}
    />
  );
}
