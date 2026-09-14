import { describe, expect, it } from "vitest";
import { textZoneContrast } from "@/lib/ilju/imageContrast";

function solid(width: number, height: number, rgb: [number, number, number]) {
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i += 1) pixels.set(rgb, i * 3);
  return pixels;
}

describe("textZoneContrast", () => {
  // 스크림이 없으므로 텍스트 영역의 원본 이미지 픽셀을 먹색과 직접 비교한다.
  it("흰색 이미지는 통과", () => {
    expect(textZoneContrast(solid(60, 80, [255, 255, 255]), 60, 80, 3)).toBeGreaterThanOrEqual(4.5);
  });

  it("검은색 이미지는 실패", () => {
    expect(textZoneContrast(solid(60, 80, [0, 0, 0]), 60, 80, 3)).toBeLessThan(4.5);
  });

  it("임계값 바로 아래 회색(128)은 실패", () => {
    expect(textZoneContrast(solid(60, 80, [128, 128, 128]), 60, 80, 3)).toBeLessThan(4.5);
  });

  it("임계값 바로 위 회색(130)은 통과", () => {
    expect(textZoneContrast(solid(60, 80, [130, 130, 130]), 60, 80, 3)).toBeGreaterThanOrEqual(4.5);
  });
});
