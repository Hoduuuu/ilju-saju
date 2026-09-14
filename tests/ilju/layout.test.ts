import { describe, expect, it } from "vitest";
import { TEXT_ZONE } from "@/lib/ilju/layout";

describe("layout", () => {
  it("텍스트 영역은 비주얼 상단 45%", () => {
    expect(TEXT_ZONE).toBe(0.45);
  });
});
