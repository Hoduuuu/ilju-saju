import { describe, expect, it } from "vitest";
import { SCRIM_ALPHA_AT_ZONE, TEXT_ZONE, scrimAlphaAt, scrimCss } from "@/lib/ilju/scrim";

describe("scrim", () => {
  it("상단은 불투명, 텍스트 영역 끝은 0.8, 65% 이후는 0", () => {
    expect(scrimAlphaAt(0)).toBe(1);
    expect(scrimAlphaAt(TEXT_ZONE)).toBeCloseTo(SCRIM_ALPHA_AT_ZONE, 5);
    expect(scrimAlphaAt(0.65)).toBe(0);
    expect(scrimAlphaAt(0.9)).toBe(0);
  });

  it("CSS 그라데이션 문자열 (한지색 워시)", () => {
    expect(scrimCss("#E6D9BC")).toBe(
      "linear-gradient(180deg, rgba(230,217,188,1) 0%, rgba(230,217,188,0.8) 45%, rgba(230,217,188,0) 65%)",
    );
  });
});
