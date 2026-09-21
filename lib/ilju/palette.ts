export interface IljuPalette {
  /** 카드 배경. 모든 일주가 같은 밝은 회색을 쓰고, 일주 차이는 일러스트 색으로 낸다 */
  paper: string;
  /** 카드 위 텍스트 색(카드 배경 대비 4.5:1 이상) */
  ink: string;
}

export const CARD_PAPER = "#F8F8F8";

export function paletteFor(): IljuPalette {
  return { paper: CARD_PAPER, ink: "#1F1A1A" };
}
