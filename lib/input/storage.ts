import { parseSajuInput } from "@/lib/saju/calculate";
import type { SajuInput } from "@/lib/saju/types";

const INPUT_KEY = "saju:input";
const INTERPRETATION_PREFIX = "saju:interpretation:";

/** 같은 탭 안에서 입력이 바뀌었음을 알리는 이벤트 이름 */
export const STORAGE_EVENT = "saju-storage";

function getStorage(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" || sessionStorage === null ? null : sessionStorage;
  } catch {
    return null;
  }
}

function notify(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(STORAGE_EVENT));
}

const interpretationKey = (input: SajuInput) => INTERPRETATION_PREFIX + JSON.stringify(input);

export function saveInput(input: SajuInput): void {
  try {
    getStorage()?.setItem(INPUT_KEY, JSON.stringify(input));
  } catch {
    // 저장 실패(사생활 보호 모드 등)는 무시한다
  }
  notify();
}

/** 저장된 입력의 원본 문자열(useSyncExternalStore 스냅샷용으로 안정적인 값) */
export function readInputRaw(): string | null {
  try {
    return getStorage()?.getItem(INPUT_KEY) ?? null;
  } catch {
    return null;
  }
}

export function parseStoredInput(raw: string | null): SajuInput | null {
  if (!raw) return null;
  try {
    return parseSajuInput(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function loadInput(): SajuInput | null {
  return parseStoredInput(readInputRaw());
}

export function saveInterpretation(input: SajuInput, text: string): void {
  try {
    getStorage()?.setItem(interpretationKey(input), text);
  } catch {
    // 무시
  }
}

export function loadInterpretation(input: SajuInput): string | null {
  try {
    return getStorage()?.getItem(interpretationKey(input)) ?? null;
  } catch {
    return null;
  }
}

export function clearSaju(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && (key === INPUT_KEY || key.startsWith(INTERPRETATION_PREFIX))) keys.push(key);
    }
    for (const key of keys) storage.removeItem(key);
  } catch {
    // 무시
  }
  notify();
}
