import type { TenGod } from "manseryeok";

/** 한 해(세운)의 기운이 나(일간)에게 어떤 역할인지 쉬운 말로 */
export const TEN_GOD_YEAR_MEANING: Record<TenGod, string> = {
  비견: "나와 같은 기운이라 자립심이 커지고 함께할 동료가 생겨요",
  겁재: "경쟁할 일이 생기지만 밀고 나가는 힘도 커져요",
  식신: "재능을 펼치고 즐기며 여유를 찾는 일이 늘어요",
  상관: "틀을 깨고 새롭게 표현하고 싶은 마음이 커져요",
  편재: "활동 범위가 넓어지고 큰 기회가 움직여요",
  정재: "꾸준히 쌓는 결과와 살림이 중요해져요",
  편관: "책임과 부담이 커지지만 버텨 내면 크게 성장해요",
  정관: "역할과 평가가 분명해지고 인정받을 일이 생겨요",
  편인: "새로운 분야를 파고들고 생각이 깊어져요",
  정인: "배움이 늘고 주변의 도움이 들어와요",
};

/** 10년 대운을 꾸미는 말. 뒤에 "10년" "시기"가 붙는다 */
const TEN_GOD_PERIOD: Record<TenGod, string> = {
  비견: "자립심이 커지고 함께할 동료가 생기는",
  겁재: "경쟁 속에서 밀고 나가는 힘이 커지는",
  식신: "재능을 펼치고 여유를 찾는",
  상관: "틀을 깨고 새롭게 표현하고 싶어지는",
  편재: "활동 범위가 넓어지고 큰 기회가 움직이는",
  정재: "꾸준히 쌓은 결과와 살림이 중요해지는",
  편관: "책임과 부담 속에서 크게 성장하는",
  정관: "역할과 평가가 분명해지고 인정받는",
  편인: "새로운 분야를 파고들며 생각이 깊어지는",
  정인: "배움이 늘고 주변의 도움이 들어오는",
};

/**
 * 대운 한 줄 풀이. 천간과 지지의 십신이 같으면 10년 전체로,
 * 다르면 흔히 읽는 방식대로 앞 5년(천간)·뒤 5년(지지)으로 나눠 말한다.
 */
export function daeunMeaning(stem: TenGod, branch: TenGod): string {
  if (stem === branch) return `${TEN_GOD_PERIOD[stem]} 10년이에요.`;
  return `앞 5년은 ${TEN_GOD_PERIOD[stem]} 시기, 뒤 5년은 ${TEN_GOD_PERIOD[branch]} 시기예요.`;
}

/** 카드에 쓰는 짧은 관계 이름. 같으면 하나만 */
export function tenGodLabel(stem: TenGod, branch: TenGod): string {
  return stem === branch ? stem : `${stem}·${branch}`;
}
