import {
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
} from "manseryeok";

export const STEM_ROMAN = ["gap", "eul", "byeong", "jeong", "mu", "gi", "gyeong", "sin", "im", "gye"] as const;
export const BRANCH_ROMAN = ["ja", "chuk", "in", "myo", "jin", "sa", "o", "mi", "sin", "yu", "sul", "hae"] as const;

export const STEM_ELEMENT: readonly FiveElement[] = HEAVENLY_STEMS.map((s) => getHeavenlyStemElement(s));
export const BRANCH_ELEMENT: readonly FiveElement[] = EARTHLY_BRANCHES.map((b) => getEarthlyBranchElement(b));
export const ELEMENTS: readonly FiveElement[] = ["목", "화", "토", "금", "수"];
export const ELEMENT_HANJA: Record<FiveElement, string> = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };

export interface Ganji {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

export const stemIndex = (stem: HeavenlyStem): number => HEAVENLY_STEMS.indexOf(stem);
export const branchIndex = (branch: EarthlyBranch): number => EARTHLY_BRANCHES.indexOf(branch);
export const stemHanja = (stem: HeavenlyStem): string => HEAVENLY_STEMS_HANJA[stemIndex(stem)];
export const branchHanja = (branch: EarthlyBranch): string => EARTHLY_BRANCHES_HANJA[branchIndex(branch)];

export function iljuId(stem: HeavenlyStem, branch: EarthlyBranch): string {
  return `${STEM_ROMAN[stemIndex(stem)]}-${BRANCH_ROMAN[branchIndex(branch)]}`;
}

export function yearGanji(year: number): Ganji {
  const index = (((year - 4) % 60) + 60) % 60;
  return { stem: HEAVENLY_STEMS[index % 10], branch: EARTHLY_BRANCHES[index % 12] };
}

/** 60갑자 순서(갑자=0 … 계해=59) */
export function sixtyGanji(): Ganji[] {
  return Array.from({ length: 60 }, (_, i) => ({
    stem: HEAVENLY_STEMS[i % 10],
    branch: EARTHLY_BRANCHES[i % 12],
  }));
}
