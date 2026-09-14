import { hexToRgb } from "./color";

/** 먹색 텍스트가 놓이는 비주얼 상단 비율 */
export const TEXT_ZONE = 0.45;
export const SCRIM_ALPHA_AT_ZONE = 0.8;
export const SCRIM_END = 0.65;

/** 비주얼 높이 비율 y(0~1)에서 스크림 불투명도 */
export function scrimAlphaAt(y: number): number {
  if (y <= TEXT_ZONE) return 1 - (1 - SCRIM_ALPHA_AT_ZONE) * (y / TEXT_ZONE);
  if (y >= SCRIM_END) return 0;
  return SCRIM_ALPHA_AT_ZONE * (1 - (y - TEXT_ZONE) / (SCRIM_END - TEXT_ZONE));
}

/** 한지 배경색을 위에서부터 불투명 → 투명으로 덮어, 이미지 위에도 텍스트 영역이 밝게 유지되도록 한다 */
export function scrimCss(paperHex: string): string {
  const [r, g, b] = hexToRgb(paperHex);
  return `linear-gradient(180deg, rgba(${r},${g},${b},1) 0%, rgba(${r},${g},${b},${SCRIM_ALPHA_AT_ZONE}) ${TEXT_ZONE * 100}%, rgba(${r},${g},${b},0) ${SCRIM_END * 100}%)`;
}
