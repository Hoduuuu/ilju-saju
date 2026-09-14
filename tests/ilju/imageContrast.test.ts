import { describe, expect, it } from "vitest";
import { textZoneContrast } from "@/lib/ilju/imageContrast";

function solid(width: number, height: number, rgb: [number, number, number]) {
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i += 1) pixels.set(rgb, i * 3);
  return pixels;
}

describe("textZoneContrast", () => {
  // 실제 60개 한지색은 먹색 대비 여유가 매우 커서(10~13:1) 스크림 아래로 20%만 비치는
  // 이미지 픽셀만으로는 4.5 밑으로 떨어지지 않는다. 임계값 부근의 한지색을 써서
  // 밝은/어두운 이미지에 대한 판정이 뒤집혔는지 검증한다.
  const paper = "#969696";

  it("밝은(흰색) 이미지는 통과", () => {
    expect(textZoneContrast(solid(60, 80, [255, 255, 255]), 60, 80, 3, paper)).toBeGreaterThanOrEqual(4.5);
  });

  it("팔레트 한지색과 같은 이미지는 통과", () => {
    expect(textZoneContrast(solid(60, 80, [150, 150, 150]), 60, 80, 3, paper)).toBeGreaterThanOrEqual(4.5);
  });

  it("어두운(검은색) 이미지는 실패", () => {
    expect(textZoneContrast(solid(60, 80, [0, 0, 0]), 60, 80, 3, paper)).toBeLessThan(4.5);
  });
});
