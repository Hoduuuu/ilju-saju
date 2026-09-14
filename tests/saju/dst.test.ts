import { describe, expect, it } from "vitest";
import { seoulWallTimeMatches } from "@/lib/saju/dst";

describe("seoulWallTimeMatches", () => {
  it("평범한 시각은 1", () => {
    expect(seoulWallTimeMatches(2000, 1, 1, 10, 0)).toBe(1);
    expect(seoulWallTimeMatches(1960, 1, 1, 10, 0)).toBe(1);
  });

  it("서머타임 시작으로 건너뛴 시각은 0", () => {
    expect(seoulWallTimeMatches(1987, 5, 10, 2, 30)).toBe(0);
    expect(seoulWallTimeMatches(1988, 5, 8, 2, 30)).toBe(0);
  });

  it("서머타임 종료로 두 번 있었던 시각은 2", () => {
    expect(seoulWallTimeMatches(1987, 10, 11, 2, 30)).toBe(2);
  });
});
