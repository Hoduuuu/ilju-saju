"use client";

import { useMemo, useSyncExternalStore } from "react";
import { STORAGE_EVENT, parseStoredInput, readInputRaw } from "./storage";
import type { SajuInput } from "@/lib/saju/types";

const SERVER_SNAPSHOT = "__server__";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export type StoredInput = { ready: false; raw: null; input: null } | { ready: true; raw: string | null; input: SajuInput | null };

/** ready=false는 서버 렌더·하이드레이션 중이라 아직 sessionStorage를 읽지 못한 상태 */
export function useStoredInput(): StoredInput {
  const raw = useSyncExternalStore(subscribe, readInputRaw, () => SERVER_SNAPSHOT);
  return useMemo<StoredInput>(
    () => (raw === SERVER_SNAPSHOT ? { ready: false, raw: null, input: null } : { ready: true, raw, input: parseStoredInput(raw) }),
    [raw],
  );
}
