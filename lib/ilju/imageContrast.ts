import { contrastRatio, hexToRgb, type Rgb } from "./color";
import { TEXT_ZONE } from "./layout";

const INK: Rgb = hexToRgb("#16181d");

/**
 * 텍스트 영역(상단 45%) 원본 이미지 픽셀과 먹색의 대비를 계산해 하위 2% 값을 돌려준다.
 * 스크림이 없으므로 이미지 픽셀 그대로 대비를 측정한다.
 * pixels는 행 우선 RGB(A) 원시 데이터다.
 */
export function textZoneContrast(pixels: Uint8Array, width: number, height: number, channels: number): number {
  const zoneRows = Math.floor(height * TEXT_ZONE);
  const ratios: number[] = [];
  for (let y = 0; y < zoneRows; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const pixel: Rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      ratios.push(contrastRatio(INK, pixel));
    }
  }
  ratios.sort((a, b) => a - b);
  return ratios[Math.floor(ratios.length * 0.02)];
}
