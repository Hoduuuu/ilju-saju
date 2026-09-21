import { describe, expect, it } from "vitest";
import { calculateSaju } from "@/lib/saju/calculate";
import { pillarColumns } from "@/lib/view/pillars";
import type { SajuInput } from "@/lib/saju/types";

const input: SajuInput = { name: "테스트", calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: null, gender: "male", placeId: "seoul" };

describe("pillarColumns", () => {
  it("시·일·월·연 순서이고 일주를 강조한다", () => {
    const cols = pillarColumns(calculateSaju({ ...input, time: { hour: 14, minute: 30 } }));
    expect(cols.map((c) => c.key)).toEqual(["hour", "day", "month", "year"]);
    expect(cols.find((c) => c.highlight)?.key).toBe("day");
    expect(cols[0].pillar?.stemHanja).toBe("癸");
  });

  it("시간 모름이면 시주 칸이 비어 있다", () => {
    expect(pillarColumns(calculateSaju(input))[0].pillar).toBeNull();
  });
});
