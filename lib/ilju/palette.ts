import type { StemNature } from "./stems";
import type { BranchSeason } from "./branches";

export interface IljuPalette {
  paper: string;
  /** 카드(paper) 위에 놓이는 텍스트 색. 가장 어두운 카드(#6E8EE0)에서도 4.5:1을 만족한다 */
  ink: string;
  /** 먹 일러스트(PNG)의 잉크 색과 맞춘 모티프 대체 그림용 색 */
  artInk: string;
}

export function paletteFor(_stem: StemNature, branch: BranchSeason): IljuPalette {
  return {
    paper: branch.paperColor,
    ink: "#1F1A1A",
    artInk: "#332A2A",
  };
}

export function paperCss(p: IljuPalette): string {
  return p.paper;
}
