import type { EarthlyBranch } from "manseryeok";

export type Season = "봄" | "여름" | "가을" | "겨울";

export interface BranchSeason {
  season: Season;
  scene: string;
  keyword: string;
  trait: string;
  topLightness: number;
  bottomHue: number;
  bottomLightness: number;
  promptScene: string;
  /** 한지 배경색(저채도). 계절과 시간대를 함께 담는다 */
  paperColor: string;
  /** 생성 모델에 색을 확실히 전달하기 위한 색 이름 */
  paperName: string;
}

export const BRANCH_SEASONS: Record<EarthlyBranch, BranchSeason> = {
  자: {
    season: "겨울", scene: "한겨울 고요한 호숫가", keyword: "깊이", topLightness: 18, bottomHue: 205, bottomLightness: 75,
    trait: "속마음은 한겨울 호수처럼 깊고 차분해서 쉽게 드러내지 않아요.",
    promptScene: "a still frozen lake on a deep winter night with light snowfall",
    paperColor: "#94AAB2",
    paperName: "pale slate blue",
  },
  축: {
    season: "겨울", scene: "늦겨울 눈 덮인 들판", keyword: "인내", topLightness: 21, bottomHue: 210, bottomLightness: 85,
    trait: "언 땅이 봄을 기다리듯 참을성 있게 때를 기다릴 줄 알아요.",
    promptScene: "a snow-covered field at dawn in late winter",
    paperColor: "#C5D2D6",
    paperName: "very pale icy blue",
  },
  인: {
    season: "봄", scene: "이른 봄 새벽 숲", keyword: "시작", topLightness: 24, bottomHue: 140, bottomLightness: 85,
    trait: "새벽을 여는 기운이라 새로운 일을 먼저 시작하는 데 강해요.",
    promptScene: "a misty forest at early spring dawn",
    paperColor: "#FFF1B0",
    paperName: "pale warm apricot",
  },
  묘: {
    season: "봄", scene: "꽃 피는 봄 언덕", keyword: "생기", topLightness: 26, bottomHue: 100, bottomLightness: 86,
    trait: "봄꽃처럼 생기가 넘치고 사람들에게 편안한 인상을 줘요.",
    promptScene: "a blooming spring hillside",
    paperColor: "#E6F4A6",
    paperName: "pale peach pink",
  },
  진: {
    season: "봄", scene: "늦봄 비 갠 들녘", keyword: "변화", topLightness: 24, bottomHue: 80, bottomLightness: 85,
    trait: "비 갠 뒤 달라지는 들녘처럼 변화에 강하고 여러 재능을 품고 있어요.",
    promptScene: "a fresh meadow just after late spring rain",
    paperColor: "#FDBCBA",
    paperName: "pale sandy amber",
  },
  사: {
    season: "여름", scene: "초여름 아침 햇살 속", keyword: "재치", topLightness: 26, bottomHue: 55, bottomLightness: 86,
    trait: "아침 햇살처럼 머리 회전이 빠르고 재치가 있어요.",
    promptScene: "bright early summer morning light",
    paperColor: "#98C9E5",
    paperName: "pale jade mint",
  },
  오: {
    season: "여름", scene: "한여름 뜨거운 한낮", keyword: "추진력", topLightness: 28, bottomHue: 42, bottomLightness: 83,
    trait: "한낮의 열기처럼 한번 마음먹으면 거침없이 달려가요.",
    promptScene: "a blazing midsummer noon",
    paperColor: "#B0DEF6",
    paperName: "soft but clear teal green",
  },
  미: {
    season: "여름", scene: "늦여름 노을 진 오후", keyword: "여유", topLightness: 26, bottomHue: 30, bottomLightness: 83,
    trait: "늦여름 오후처럼 여유롭고 사람을 편하게 챙겨요.",
    promptScene: "a warm late summer afternoon with a soft sunset glow",
    paperColor: "#6E8EE0",
    paperName: "pale seafoam green",
  },
  신: {
    season: "가을", scene: "초가을 맑은 하늘가", keyword: "민첩함", topLightness: 24, bottomHue: 195, bottomLightness: 86,
    trait: "맑은 가을 하늘처럼 판단이 빠르고 몸과 머리가 민첩해요.",
    promptScene: "a clear crisp early autumn sky",
    paperColor: "#EFE6D8",
    paperName: "pale golden wheat",
  },
  유: {
    season: "가을", scene: "가을 저녁 황금 들판", keyword: "정확함", topLightness: 22, bottomHue: 38, bottomLightness: 83,
    trait: "잘 익은 가을 들판처럼 꼼꼼하고 결과를 정확하게 매듭지어요.",
    promptScene: "golden autumn fields in the evening",
    paperColor: "#B7A861",
    paperName: "soft golden ochre",
  },
  술: {
    season: "가을", scene: "늦가을 해 질 녘 언덕", keyword: "책임감", topLightness: 21, bottomHue: 22, bottomLightness: 79,
    trait: "해 질 녘 언덕을 지키듯 맡은 일과 사람을 끝까지 책임져요.",
    promptScene: "a quiet hill at dusk in late autumn",
    paperColor: "#EABB9A",
    paperName: "pale terracotta clay",
  },
  해: {
    season: "겨울", scene: "초겨울 깊은 밤 강가", keyword: "상상력", topLightness: 18, bottomHue: 225, bottomLightness: 73,
    trait: "깊은 밤 강물처럼 상상력이 풍부하고 속이 넓어요.",
    promptScene: "a quiet riverbank on an early winter night",
    paperColor: "#8AA0AC",
    paperName: "pale dusty periwinkle",
  },
};
