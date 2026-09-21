import type { HeavenlyStem } from "manseryeok";

export type Motif = "tree" | "flower" | "sun" | "lamp" | "mountain" | "field" | "rock" | "gem" | "sea" | "rain";

export interface StemNature {
  nature: string;
  motif: Motif;
  keywords: [string, string];
  trait: string;
}

export const STEM_NATURES: Record<HeavenlyStem, StemNature> = {
  갑: {
    nature: "큰 나무", motif: "tree", keywords: ["곧음", "개척"],
    trait: "곧게 위로 뻗는 큰 나무처럼 목표를 세우면 흔들림 없이 밀고 나가는 힘이 있어요.",
  },
  을: {
    nature: "풀꽃", motif: "flower", keywords: ["유연함", "친화력"],
    trait: "바람에 휘어도 꺾이지 않는 풀꽃처럼 부드럽게 적응하며 사람 사이를 잇는 재주가 있어요.",
  },
  병: {
    nature: "태양", motif: "sun", keywords: ["열정", "밝음"],
    trait: "하늘 높이 뜬 태양처럼 존재만으로 주변을 환하게 만들고 마음을 숨김없이 표현해요.",
  },
  정: {
    nature: "등불", motif: "lamp", keywords: ["따뜻함", "집중"],
    trait: "어둠 속 등불처럼 조용하지만 오래 타오르며 가까운 사람을 세심하게 비춰요.",
  },
  무: {
    nature: "큰 산", motif: "mountain", keywords: ["듬직함", "포용"],
    trait: "넓고 높은 산처럼 쉽게 흔들리지 않고 많은 것을 품어 주는 믿음직한 사람이에요.",
  },
  기: {
    nature: "논밭", motif: "field", keywords: ["세심함", "실속"],
    trait: "씨앗을 길러내는 기름진 밭처럼 차근차근 가꾸어 실속 있는 결과를 만들어요.",
  },
  경: {
    nature: "바위", motif: "rock", keywords: ["결단력", "의리"],
    trait: "단단한 바위처럼 원칙이 분명하고 한번 정하면 과감하게 실행해요.",
  },
  신: {
    nature: "보석", motif: "gem", keywords: ["섬세함", "완벽"],
    trait: "빛나는 보석처럼 감각이 예리하고 스스로를 다듬어 완성도를 높여요.",
  },
  임: {
    nature: "바다", motif: "sea", keywords: ["지혜", "자유"],
    trait: "끝없이 넓은 바다처럼 생각의 폭이 넓고 흐름을 읽는 눈이 밝아요.",
  },
  계: {
    nature: "빗물", motif: "rain", keywords: ["직관", "공감"],
    trait: "조용히 스며드는 빗물처럼 섬세하게 감정을 읽고 필요한 곳을 적셔 줘요.",
  },
};
