import type { EarthlyBranch, FiveElement, HeavenlyStem, TenGod } from "manseryeok";
import type { TwelveStage } from "./tables";

export type Gender = "male" | "female";

export interface SajuInput {
  calendar: "solar" | "lunar";
  isLeapMonth: boolean;
  year: number;
  month: number;
  day: number;
  /** null = 태어난 시간 모름 */
  time: { hour: number; minute: number } | null;
  gender: Gender;
  placeId: string;
}

export interface PillarView {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemHanja: string;
  branchHanja: string;
  stemElement: FiveElement;
  branchElement: FiveElement;
  stemTenGod: TenGod | "일간";
  branchTenGod: TenGod;
  hiddenStems: HeavenlyStem[];
  twelveStage: TwelveStage;
}

export interface DaeunView {
  age: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  hanja: string;
  korean: string;
  /** 일간 기준 이 대운 천간·지지의 십신 */
  stemTenGod: TenGod;
  branchTenGod: TenGod;
}

export interface SajuWarning {
  kind: "solarTermBoundary" | "dstTransition";
  message: string;
}

export interface SajuResult {
  input: SajuInput;
  solarDate: { year: number; month: number; day: number };
  pillars: { year: PillarView; month: PillarView; day: PillarView; hour: PillarView | null };
  elementCounts: Record<FiveElement, number>;
  iljuId: string;
  daeun: { forward: boolean; startAge: number; pillars: DaeunView[] };
  currentDaeunIndex: number | null;
  seun: {
    year: number;
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    hanja: string;
    korean: string;
    stemTenGod: TenGod;
    branchTenGod: TenGod;
  };
  warnings: SajuWarning[];
}

/** 사용자에게 그대로 보여줄 수 있는 입력 오류 */
export class SajuInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SajuInputError";
  }
}
