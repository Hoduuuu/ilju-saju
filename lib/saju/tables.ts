import type { EarthlyBranch, HeavenlyStem } from "manseryeok";
import { branchIndex, stemIndex } from "./ganji";

/** 지장간(여기 → 중기 → 정기) */
export const HIDDEN_STEMS: Record<EarthlyBranch, HeavenlyStem[]> = {
  자: ["임", "계"],
  축: ["계", "신", "기"],
  인: ["무", "병", "갑"],
  묘: ["갑", "을"],
  진: ["을", "계", "무"],
  사: ["무", "경", "병"],
  오: ["병", "기", "정"],
  미: ["정", "을", "기"],
  신: ["무", "임", "경"],
  유: ["경", "신"],
  술: ["신", "정", "무"],
  해: ["무", "갑", "임"],
};

export const TWELVE_STAGES = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;
export type TwelveStage = (typeof TWELVE_STAGES)[number];

/** 천간별 장생 지지 */
const JANGSAENG: Record<HeavenlyStem, EarthlyBranch> = {
  갑: "해", 을: "오", 병: "인", 정: "유", 무: "인", 기: "유", 경: "사", 신: "자", 임: "신", 계: "묘",
};

/** 일간 기준 지지의 12운성. 양간은 순행, 음간은 역행한다. */
export function twelveStage(dayStem: HeavenlyStem, branch: EarthlyBranch): TwelveStage {
  const start = branchIndex(JANGSAENG[dayStem]);
  const target = branchIndex(branch);
  const isYang = stemIndex(dayStem) % 2 === 0;
  const offset = isYang ? (target - start + 12) % 12 : (start - target + 12) % 12;
  return TWELVE_STAGES[offset];
}
