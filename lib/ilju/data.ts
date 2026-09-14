import type { EarthlyBranch, FiveElement, HeavenlyStem } from "manseryeok";
import { STEM_ELEMENT, branchHanja, iljuId, sixtyGanji, stemHanja, stemIndex } from "@/lib/saju/ganji";
import { STEM_NATURES, type Motif } from "./stems";
import { BRANCH_SEASONS, type Season } from "./branches";
import { paletteFor, type IljuPalette } from "./palette";

export interface IljuEntry {
  id: string;
  order: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  hanja: string;
  korean: string;
  element: FiveElement;
  yinYang: "양" | "음";
  season: Season;
  nature: string;
  scene: string;
  symbol: string;
  keywords: string[];
  description: string;
  motif: Motif;
  palette: IljuPalette;
}

export const ILJU_LIST: IljuEntry[] = sixtyGanji().map(({ stem, branch }, order) => {
  const nature = STEM_NATURES[stem];
  const season = BRANCH_SEASONS[branch];
  return {
    id: iljuId(stem, branch),
    order,
    stem,
    branch,
    hanja: stemHanja(stem) + branchHanja(branch),
    korean: stem + branch,
    element: STEM_ELEMENT[stemIndex(stem)],
    yinYang: stemIndex(stem) % 2 === 0 ? "양" : "음",
    season: season.season,
    nature: nature.nature,
    scene: season.scene,
    symbol: `${season.scene}의 ${nature.nature}`,
    keywords: [...nature.keywords, season.keyword],
    description: `${nature.trait} ${season.trait}`,
    motif: nature.motif,
    palette: paletteFor(nature, season),
  };
});

const BY_ID = new Map(ILJU_LIST.map((entry) => [entry.id, entry]));

export function getIlju(id: string): IljuEntry | undefined {
  return BY_ID.get(id);
}

export function filterByElement(list: IljuEntry[], element: FiveElement | "all"): IljuEntry[] {
  return element === "all" ? list : list.filter((entry) => entry.element === element);
}
