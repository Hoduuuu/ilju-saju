import { describe, expect, it } from "vitest";
import { calculateSaju } from "@/lib/saju/calculate";
import { formatBirth } from "@/lib/view/birth";

describe("formatBirth", () => {
  it("양력 + 시간 + 출생지", () => {
    const r = calculateSaju({ calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: { hour: 14, minute: 5 }, gender: "male", placeId: "busan" });
    expect(formatBirth(r)).toBe("양력 1990.5.15 14:05 · 부산 · 남성");
  });

  it("음력 + 시간 모름은 양력 날짜를 함께 보여준다", () => {
    const r = calculateSaju({ calendar: "lunar", isLeapMonth: false, year: 1997, month: 1, day: 1, time: null, gender: "female", placeId: "seoul" });
    expect(formatBirth(r)).toBe("음력 1997.1.1 (양력 1997.2.8) · 시간 모름 · 여성");
  });
});
