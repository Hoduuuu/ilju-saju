import { describe, expect, it } from "vitest";
import { HEAVENLY_STEMS } from "manseryeok";

describe("smoke", () => {
  it("manseryeok를 불러올 수 있다", () => {
    expect(HEAVENLY_STEMS[0]).toBe("갑");
  });
});
