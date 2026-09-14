import { describe, expect, it } from "vitest";
import { getIlju } from "@/lib/ilju/data";
import { hexToRgb } from "@/lib/ilju/color";
import { textZoneContrast } from "@/lib/ilju/imageContrast";

function solid(width: number, height: number, rgb: [number, number, number]) {
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i += 1) pixels.set(rgb, i * 3);
  return pixels;
}

describe("textZoneContrast", () => {
  const top = getIlju("gap-o")!.palette.top;

  it("어두운 이미지는 통과", () => {
    expect(textZoneContrast(solid(60, 80, [0, 0, 0]), 60, 80, 3, top)).toBeGreaterThanOrEqual(4.5);
  });

  it("팔레트 상단색과 같은 이미지는 통과", () => {
    expect(textZoneContrast(solid(60, 80, hexToRgb(top)), 60, 80, 3, top)).toBeGreaterThanOrEqual(4.5);
  });

  it("상단이 하얀 이미지는 실패", () => {
    expect(textZoneContrast(solid(60, 80, [255, 255, 255]), 60, 80, 3, top)).toBeLessThan(4.5);
  });
});
