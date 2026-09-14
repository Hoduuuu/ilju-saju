import type { StemNature } from "./stems";
import type { BranchSeason } from "./branches";

export interface IljuPalette {
  paper: string;
  ink: string;
}

export function paletteFor(_stem: StemNature, branch: BranchSeason): IljuPalette {
  return {
    paper: branch.paperColor,
    ink: "#16181d",
  };
}

export function paperCss(p: IljuPalette): string {
  return p.paper;
}
