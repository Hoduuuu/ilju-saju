import { describe, expect, it } from "vitest";
import { calculateSaju } from "@/lib/saju/calculate";
import { getIlju } from "@/lib/ilju/data";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/interpret/prompt";
import type { SajuInput } from "@/lib/saju/types";

const base: SajuInput = { name: "테스트", calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: { hour: 14, minute: 30 }, gender: "male", placeId: "seoul" };

describe("prompt", () => {
  it("system prompt에 섹션 형식과 금지 규칙이 있다", () => {
    for (const id of ["summary", "nature", "elements", "work", "relation", "daeun", "year", "notime"]) {
      expect(SYSTEM_PROMPT).toContain(`## [${id}]`);
    }
    expect(SYSTEM_PROMPT).toContain("다시 계산");
  });

  it("사용자 프롬프트에 계산 결과가 들어간다", () => {
    const result = calculateSaju(base);
    const prompt = buildUserPrompt(result, getIlju(result.iljuId)!);
    expect(prompt).toContain("일주 庚辰");
    expect(prompt).toContain("시주 癸未");
    expect(prompt).toContain("27세 甲申(갑신) ← 현재");
    expect(prompt).toContain("2026년 세운: 丙午");
    expect(prompt).toContain("notime 섹션은 쓰지 않는다");
    expect(prompt).toContain("계산 기준: 진태양시 보정");
  });

  it("시간 모름이면 notime 섹션을 요구한다", () => {
    const result = calculateSaju({ ...base, time: null });
    const prompt = buildUserPrompt(result, getIlju(result.iljuId)!);
    expect(prompt).toContain("시주: 모름");
    expect(prompt).toContain("notime 섹션을 반드시 쓴다");
    expect(prompt).not.toContain("계산 기준");
  });
});
