import { contrastRatio, hexToRgb, mixRgb, type Rgb } from "./color";
import { TEXT_ZONE } from "./layout";

const INK: Rgb = hexToRgb("#1F1A1A");

/**
 * 텍스트 영역(상단 45%)의 대비를 계산해 하위 2% 값을 돌려준다.
 * 일러스트는 이제 투명 PNG(먹 부분만 불투명)라서, 픽셀을 그대로 쓰면 안 되고
 * 먼저 카드 색(paper) 위에 알파 합성해 실제로 화면에 보이는 색을 만든 뒤 먹색과 대비를 잰다.
 * pixels는 행 우선 RGB(A) 원시 데이터다. 알파 채널이 없으면(channels < 4) 완전히 불투명하게 취급한다.
 */
export function textZoneContrast(pixels: Uint8Array, width: number, height: number, channels: number, paper: string): number {
  const paperRgb = hexToRgb(paper);
  const zoneRows = Math.floor(height * TEXT_ZONE);
  const ratios: number[] = [];
  for (let y = 0; y < zoneRows; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const pixel: Rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      const alpha = channels >= 4 ? pixels[i + 3] / 255 : 1;
      const composited = mixRgb(paperRgb, pixel, alpha);
      ratios.push(contrastRatio(INK, composited));
    }
  }
  ratios.sort((a, b) => a - b);
  return ratios[Math.floor(ratios.length * 0.02)];
}
