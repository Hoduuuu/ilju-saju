"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { loadInterpretation, saveInterpretation } from "@/lib/input/storage";
import type { SajuInput } from "@/lib/saju/types";
import type { InterpretEvent } from "./claudeEvents";
import { createLineSplitter } from "./lines";
import { INITIAL_INTERPRET_STATE, interpretReducer, type InterpretState } from "./state";

export function useInterpretation(input: SajuInput | null): { state: InterpretState; retry: () => void } {
  const [live, dispatch] = useReducer(interpretReducer, INITIAL_INTERPRET_STATE);
  const [attempt, setAttempt] = useState(0);
  const inputKey = input ? JSON.stringify(input) : null;

  const cached = useMemo(() => (input && attempt === 0 ? loadInterpretation(input) : null), [input, attempt]);

  useEffect(() => {
    if (!input || cached) return;
    const controller = new AbortController();

    async function run(currentInput: SajuInput) {
      dispatch({ type: "start" });
      let text = "";
      try {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentInput),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          const body = (await response.json().catch(() => null)) as { message?: string; code?: string } | null;
          dispatch({
            type: "networkError",
            message: body?.message ?? "풀이 서버에 연결하지 못했어요.",
            code: body?.code === "disabled" || body?.code === "quota" ? body.code : undefined,
          });
          return;
        }
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        const splitter = createLineSplitter();
        const handle = (line: string) => {
          const event = JSON.parse(line) as InterpretEvent;
          if (event.type === "text") text += event.text;
          if (event.type === "done") saveInterpretation(currentInput, text);
          dispatch({ type: "event", event });
        };
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          splitter.push(value).forEach(handle);
        }
        splitter.flush().forEach(handle);
      } catch {
        if (!controller.signal.aborted) dispatch({ type: "networkError", message: "풀이를 받는 중 연결이 끊겼어요." });
      }
    }

    void run(input);
    return () => controller.abort();
    // inputKey가 input 내용 전체를 대표한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputKey, attempt, cached]);

  const state: InterpretState = cached ? { status: "done", text: cached, error: null } : live;
  return { state, retry: () => setAttempt((n) => n + 1) };
}
