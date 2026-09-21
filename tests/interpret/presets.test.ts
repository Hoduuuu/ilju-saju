import { describe, expect, it } from "vitest";
import { ILJU_LIST } from "@/lib/ilju/data";
import { composePresetReading, presetCoverage } from "@/lib/interpret/compose";
import { calculateSaju } from "@/lib/saju/calculate";
import type { SajuInput } from "@/lib/saju/types";

describe("미리 만든 AI 풀이", () => {
  it("60일주와 10일간(2026) 풀이가 모두 있다", () => {
    expect(presetCoverage()).toEqual({ ilju: 60, year: 10 });
  });

  it("60일주 모두 AI 풀이 7개 항목이 빠짐없이 채워진다", () => {
    // 1990년 1월 1일부터 하루씩 넘기며 60일주를 모두 한 번씩 만든다
    const seen = new Set<string>();
    for (let offset = 0; seen.size < ILJU_LIST.length && offset < 400; offset += 1) {
      const date = new Date(Date.UTC(1990, 0, 1 + offset));
      const input: SajuInput = {
        name: "테스트",
        calendar: "solar",
        isLeapMonth: false,
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        time: { hour: 12, minute: 0 },
        gender: offset % 2 ? "male" : "female",
        placeId: "seoul",
      };
      const result = calculateSaju(input);
      if (seen.has(result.iljuId)) continue;
      seen.add(result.iljuId);
      const ilju = ILJU_LIST.find((entry) => entry.id === result.iljuId)!;
      const text = composePresetReading(result, ilju);
      for (const id of ["summary", "nature", "elements", "work", "relation", "daeun", "year"]) {
        expect(text, `${ilju.id} ${id}`).toContain(`## [${id}]`);
      }
    }
    expect(seen.size).toBe(60);
  });
});
