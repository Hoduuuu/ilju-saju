import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSaju, loadInput, loadInterpretation, saveInput, saveInterpretation } from "@/lib/input/storage";
import type { SajuInput } from "@/lib/saju/types";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(key: string) { return this.map.get(key) ?? null; }
  key(index: number) { return [...this.map.keys()][index] ?? null; }
  removeItem(key: string) { this.map.delete(key); }
  setItem(key: string, value: string) { this.map.set(key, value); }
}

const input: SajuInput = { name: "테스트", calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: null, gender: "female", placeId: "seoul" };

describe("storage", () => {
  let store: MemoryStorage;
  beforeEach(() => {
    store = new MemoryStorage();
    vi.stubGlobal("sessionStorage", store);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("입력 저장·불러오기", () => {
    saveInput(input);
    expect(loadInput()).toEqual(input);
  });

  it("깨진 값이나 잘못된 모양은 null", () => {
    store.setItem("saju:input", "{oops");
    expect(loadInput()).toBeNull();
    store.setItem("saju:input", JSON.stringify({ year: 1990 }));
    expect(loadInput()).toBeNull();
  });

  it("풀이는 입력별로 저장된다", () => {
    saveInterpretation(input, "## [summary]\n키워드: a, b, c");
    expect(loadInterpretation(input)).toContain("키워드");
    expect(loadInterpretation({ ...input, gender: "male" })).toBeNull();
  });

  it("clearSaju는 사주 관련 키만 지운다", () => {
    saveInput(input);
    saveInterpretation(input, "text");
    store.setItem("other", "keep");
    clearSaju();
    expect(loadInput()).toBeNull();
    expect(loadInterpretation(input)).toBeNull();
    expect(store.getItem("other")).toBe("keep");
  });

  it("sessionStorage가 없어도 오류 없이 null", () => {
    vi.stubGlobal("sessionStorage", undefined);
    expect(() => saveInput(input)).not.toThrow();
    expect(loadInput()).toBeNull();
  });
});
