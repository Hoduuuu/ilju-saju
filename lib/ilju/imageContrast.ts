import { WHITE, contrastRatio, hexToRgb, mixRgb, type Rgb } from "./color";
import { TEXT_ZONE, scrimAlphaAt } from "./scrim";

/**
 * 스크림을 덮은 상태에서 텍스트 영역(상단 45%) 픽셀과 흰색의 대비를 계산해 하위 2% 값을 돌려준다.
 * pixels는 행 우선 RGB(A) 원시 데이터다.
 */
export function textZoneContrast(pixels: Uint8Array, width: number, height: number, channels: number, topHex: string): number {
  const top = hexToRgb(topHex);
  const zoneRows = Math.floor(height * TEXT_ZONE);
  const ratios: number[] = [];
  for (let y = 0; y < zoneRows; y += 1) {
    const alpha = scrimAlphaAt((y + 0.5) / height);
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const pixel: Rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      ratios.push(contrastRatio(WHITE, mixRgb(pixel, top, alpha)));
    }
  }
  ratios.sort((a, b) => a - b);
  return ratios[Math.floor(ratios.length * 0.02)];
}
