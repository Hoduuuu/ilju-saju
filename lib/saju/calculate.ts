import {
  calculateFourPillars,
  getBranchTenGod,
  getTenGod,
  isValidSolarDate,
  lunarToSolar,
  type BirthInfo,
  type FiveElement,
  type FourPillarsDetail,
  type Pillar,
  type TenGod,
} from "manseryeok";
import { BRANCH_ELEMENT, STEM_ELEMENT, branchHanja, branchIndex, iljuId, stemHanja, stemIndex, yearGanji } from "./ganji";
import { HIDDEN_STEMS, twelveStage } from "./tables";
import { findPlace } from "./places";
import { seoulWallTimeMatches } from "./dst";
import { SajuInputError, type PillarView, type SajuInput, type SajuResult, type SajuWarning } from "./types";

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2049;
export const SEUN_YEAR = 2026;

type SolarDate = { year: number; month: number; day: number };

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

/** 이름 최대 길이. 화면 제목과 풀이에 들어가므로 짧게 둔다 */
export const NAME_MAX_LENGTH = 12;

/** 앞뒤 공백·줄바꿈·제어 문자를 지우고, 연속 공백은 하나로, 최대 길이로 자른다 */
export function normalizeName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX_LENGTH);
}

/** 외부(sessionStorage, HTTP 요청)에서 온 값을 SajuInput으로 검증한다. */
export function parseSajuInput(raw: unknown): SajuInput {
  const v = raw as Record<string, unknown> | null;
  if (!v || typeof v !== "object") throw new SajuInputError("입력값이 비어 있어요.");
  const name = typeof v.name === "string" ? normalizeName(v.name) : "";
  if (name.length === 0) throw new SajuInputError("이름을 입력해 주세요.");
  if (v.calendar !== "solar" && v.calendar !== "lunar") throw new SajuInputError("양력/음력을 선택해 주세요.");
  if (typeof v.isLeapMonth !== "boolean") throw new SajuInputError("윤달 여부가 올바르지 않아요.");
  if (!isInt(v.year, 1000, 9999) || !isInt(v.month, 1, 12) || !isInt(v.day, 1, 31)) {
    throw new SajuInputError("생년월일을 숫자로 정확히 입력해 주세요.");
  }
  if (v.gender !== "male" && v.gender !== "female") throw new SajuInputError("성별을 선택해 주세요.");
  if (typeof v.placeId !== "string") throw new SajuInputError("출생지를 선택해 주세요.");
  let time: SajuInput["time"] = null;
  if (v.time !== null) {
    const t = v.time as Record<string, unknown> | undefined;
    if (!t || !isInt(t.hour, 0, 23) || !isInt(t.minute, 0, 59)) throw new SajuInputError("태어난 시간을 정확히 입력해 주세요.");
    time = { hour: t.hour, minute: t.minute };
  }
  return {
    name,
    calendar: v.calendar,
    isLeapMonth: v.isLeapMonth,
    year: v.year,
    month: v.month,
    day: v.day,
    time,
    gender: v.gender,
    placeId: v.placeId,
  };
}

function toSolarDate(input: SajuInput): SolarDate {
  if (input.calendar === "lunar") {
    try {
      return lunarToSolar(input.year, input.month, input.day, input.isLeapMonth);
    } catch (error) {
      throw new SajuInputError(error instanceof Error ? error.message : "존재하지 않는 음력 날짜예요.");
    }
  }
  if (!isValidSolarDate(input.year, input.month, input.day)) {
    throw new SajuInputError(`${input.year}년 ${input.month}월 ${input.day}일은 없는 날짜예요.`);
  }
  return { year: input.year, month: input.month, day: input.day };
}

function run(info: BirthInfo): FourPillarsDetail {
  try {
    return calculateFourPillars(info);
  } catch (error) {
    throw new SajuInputError(error instanceof Error ? error.message : "사주를 계산하지 못했어요.");
  }
}

function shiftWallTime(date: SolarDate, hour: number, minute: number, deltaMinutes: number) {
  const t = new Date(Date.UTC(date.year, date.month - 1, date.day, hour, minute) + deltaMinutes * 60_000);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
  };
}

const yearMonthKey = (d: FourPillarsDetail) => `${d.yearString}/${d.monthString}`;

function pillarView(pillar: Pillar, dayStem: Pillar["heavenlyStem"], stemTenGod: TenGod | "일간", branchTenGod: TenGod): PillarView {
  const { heavenlyStem: stem, earthlyBranch: branch } = pillar;
  return {
    stem,
    branch,
    stemHanja: stemHanja(stem),
    branchHanja: branchHanja(branch),
    stemElement: STEM_ELEMENT[stemIndex(stem)],
    branchElement: BRANCH_ELEMENT[branchIndex(branch)],
    stemTenGod,
    branchTenGod,
    hiddenStems: HIDDEN_STEMS[branch],
    twelveStage: twelveStage(dayStem, branch),
  };
}

export function calculateSaju(input: SajuInput): SajuResult {
  const place = findPlace(input.placeId);
  if (!place) throw new SajuInputError("출생지를 다시 선택해 주세요.");

  const solar = toSolarDate(input);
  if (solar.year < MIN_YEAR || solar.year > MAX_YEAR) {
    throw new SajuInputError(`${MIN_YEAR}년부터 ${MAX_YEAR}년까지만 계산할 수 있어요.`);
  }

  const trueSolarTime = { longitude: place.longitude, applyEquationOfTime: true, applyHistoricalDst: true };
  const warnings: SajuWarning[] = [];
  let detail: FourPillarsDetail;

  if (input.time) {
    const { hour, minute } = input.time;
    const infoAt = (w: { year: number; month: number; day: number; hour: number; minute: number }): BirthInfo => ({
      ...w,
      trueSolarTime,
      dayBoundary: "splitJasi",
      gender: input.gender,
    });
    detail = run(infoAt({ ...solar, hour, minute }));
    const before = run(infoAt(shiftWallTime(solar, hour, minute, -2)));
    const after = run(infoAt(shiftWallTime(solar, hour, minute, 2)));
    if (yearMonthKey(before) !== yearMonthKey(after)) {
      warnings.push({
        kind: "solarTermBoundary",
        message: "절기가 바뀌는 시각(±2분) 근처에 태어나서 연주·월주가 달라질 수 있어요.",
      });
    }
    const matches = seoulWallTimeMatches(solar.year, solar.month, solar.day, hour, minute);
    if (matches === 0) {
      warnings.push({
        kind: "dstTransition",
        message: "서머타임이 시작되며 시계를 건너뛴 시각이에요. 기록된 시간이 1시간 다를 수 있어요.",
      });
    } else if (matches === 2) {
      warnings.push({
        kind: "dstTransition",
        message: "서머타임이 끝나며 두 번 있었던 시각이에요. 시주가 1시간 차이로 달라질 수 있어요.",
      });
    }
  } else {
    detail = run({ ...solar, hour: 12, minute: 0, gender: input.gender });
    const startOfDay = run({ ...solar, hour: 0, minute: 0, gender: input.gender });
    const endOfDay = run({ ...solar, hour: 23, minute: 59, gender: input.gender });
    if (yearMonthKey(startOfDay) !== yearMonthKey(endOfDay)) {
      warnings.push({
        kind: "solarTermBoundary",
        message: "태어난 날에 절기가 바뀌어서, 태어난 시간에 따라 연주·월주가 달라질 수 있어요.",
      });
    }
  }

  const dayStem = detail.day.heavenlyStem;
  const pillars: SajuResult["pillars"] = {
    year: pillarView(detail.year, dayStem, detail.tenGods.year.stem, detail.tenGods.year.branch),
    month: pillarView(detail.month, dayStem, detail.tenGods.month.stem, detail.tenGods.month.branch),
    day: pillarView(detail.day, dayStem, "일간", detail.tenGods.day.branch),
    hour: input.time ? pillarView(detail.hour, dayStem, detail.tenGods.hour.stem, detail.tenGods.hour.branch) : null,
  };

  const elementCounts: Record<FiveElement, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!p) continue;
    elementCounts[p.stemElement] += 1;
    elementCounts[p.branchElement] += 1;
  }

  const luck = detail.luckPillars;
  if (!luck) throw new Error("대운 정보가 없어요. gender 전달을 확인하세요.");
  const daeunPillars = luck.pillars.map((lp) => ({
    age: lp.age,
    stem: lp.pillar.heavenlyStem,
    branch: lp.pillar.earthlyBranch,
    hanja: stemHanja(lp.pillar.heavenlyStem) + branchHanja(lp.pillar.earthlyBranch),
    korean: lp.korean,
    stemTenGod: getTenGod(dayStem, lp.pillar.heavenlyStem),
    branchTenGod: getBranchTenGod(dayStem, lp.pillar.earthlyBranch),
  }));
  const ageInSeunYear = SEUN_YEAR - solar.year;
  let currentDaeunIndex: number | null = null;
  daeunPillars.forEach((p, i) => {
    if (p.age <= ageInSeunYear) currentDaeunIndex = i;
  });

  const seunGanji = yearGanji(SEUN_YEAR);

  return {
    input,
    solarDate: solar,
    pillars,
    elementCounts,
    iljuId: iljuId(detail.day.heavenlyStem, detail.day.earthlyBranch),
    daeun: { forward: luck.forward, startAge: luck.startAge, pillars: daeunPillars },
    currentDaeunIndex,
    seun: {
      year: SEUN_YEAR,
      stem: seunGanji.stem,
      branch: seunGanji.branch,
      hanja: stemHanja(seunGanji.stem) + branchHanja(seunGanji.branch),
      korean: seunGanji.stem + seunGanji.branch,
      stemTenGod: getTenGod(dayStem, seunGanji.stem),
      branchTenGod: getBranchTenGod(dayStem, seunGanji.branch),
    },
    warnings,
  };
}
