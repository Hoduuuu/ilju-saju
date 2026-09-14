import { describe, expect, it } from "vitest";
import { WHITE, contrastRatio, hexToRgb, hslToRgb, mixRgb, rgbToHex } from "@/lib/ilju/color";

describe("color", () => {
  it("흰색과 검정의 대비는 21", () => {
    expect(contrastRatio(WHITE, [0, 0, 0])).toBeCloseTo(21, 5);
  });

  it("hex 변환 왕복", () => {
    expect(rgbToHex([22, 24, 29])).toBe("#16181d");
    expect(hexToRgb("#16181d")).toEqual([22, 24, 29]);
  });

  it("hsl 변환", () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
    expect(hslToRgb(120, 0, 100)).toEqual([255, 255, 255]);
  });

  it("두 색을 섞는다", () => {
    expect(mixRgb([0, 0, 0], [255, 255, 255], 0.5)).toEqual([128, 128, 128]);
  });
});
