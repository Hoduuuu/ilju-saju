import { describe, expect, it } from "vitest";
import { textZoneContrast } from "@/lib/ilju/imageContrast";

const ARTINK: [number, number, number] = [0x33, 0x2a, 0x2a];

function solidRgba(width: number, height: number, rgb: [number, number, number], alpha: number) {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i += 1) pixels.set([...rgb, alpha], i * 4);
  return pixels;
}

describe("textZoneContrast", () => {
  // 일러스트는 투명 PNG이므로 픽셀을 카드 색(paper) 위에 합성한 뒤 대비를 측정해야 한다.

  it("완전히 투명한 픽셀은 카드 색 그대로 나타난다 (밝은 카드는 통과)", () => {
    const ratio = textZoneContrast(solidRgba(60, 80, ARTINK, 0), 60, 80, 4, "#FFF1B0");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("완전히 투명해도 카드 색 자체가 너무 어두우면 실패한다", () => {
    const ratio = textZoneContrast(solidRgba(60, 80, ARTINK, 0), 60, 80, 4, "#3A3A3A");
    expect(ratio).toBeLessThan(4.5);
  });

  it("불투명한 먹 잉크(#332A2A)는 먹색 텍스트와 색이 비슷해 대비가 낮다", () => {
    const ratio = textZoneContrast(solidRgba(60, 80, ARTINK, 255), 60, 80, 4, "#FFF1B0");
    expect(ratio).toBeLessThan(4.5);
  });

  it("알파가 클수록 카드 색에서 먹 잉크 쪽으로 합성되어 대비가 줄어든다", () => {
    const transparent = textZoneContrast(solidRgba(60, 80, ARTINK, 0), 60, 80, 4, "#FFF1B0");
    const half = textZoneContrast(solidRgba(60, 80, ARTINK, 128), 60, 80, 4, "#FFF1B0");
    const opaque = textZoneContrast(solidRgba(60, 80, ARTINK, 255), 60, 80, 4, "#FFF1B0");
    expect(transparent).toBeGreaterThan(half);
    expect(half).toBeGreaterThan(opaque);
  });

  it("알파 채널이 없는 이미지(channels=3)는 완전히 불투명하게 취급한다", () => {
    const pixels = new Uint8Array(60 * 80 * 3);
    for (let i = 0; i < 60 * 80; i += 1) pixels.set(ARTINK, i * 3);
    const ratio = textZoneContrast(pixels, 60, 80, 3, "#FFF1B0");
    expect(ratio).toBeLessThan(4.5);
  });
});
