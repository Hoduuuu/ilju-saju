import type { HeavenlyStem } from "manseryeok";
import type { IljuEntry } from "@/lib/ilju/data";
import { STEM_NATURES } from "@/lib/ilju/stems";
import { ELEMENT_NAMES } from "@/lib/view/elements";
import { stemHanja } from "@/lib/saju/ganji";

/**
 * 배포(공유) 사이트용 "미리 만든 풀이" 프롬프트.
 * 특정 개인이 아니라 같은 일주(또는 같은 일간)를 가진 사람 모두에게 맞는 글을 만든다.
 * 로컬에서 scripts/generate-readings.ts로 한 번 만들어 data/readings/*.json에 저장한다.
 */
const RULES = `너는 한국 명리학(사주)에 밝고 말투가 따뜻한 상담가다.

규칙
1. 사용자 메시지의 데이터만 근거로 쓴다. 특정 개인의 생년월일·원국·대운은 모른다고 보고, 그 일주(일간)를 가진 사람 모두에게 맞는 내용만 쓴다.
2. 전문 용어는 처음 나올 때 괄호 안에 쉬운 말로 풀어 쓴다. 예: 식신(표현하고 베푸는 기운)
3. 공포를 주는 단정(큰 재앙, 반드시 실패 등), 건강 진단, 투자·법률 결정에 대한 단정적 조언을 하지 않는다.
4. 과장된 칭찬 없이 현실적이고 구체적으로, 일상에서 바로 적용할 수 있게 쓴다.
5. 해요체로 쓴다. 읽는 사람을 "이 일주를 가진 사람은", "당신은" 대신 주어를 생략하거나 "~한 편이에요"처럼 자연스럽게 쓴다. 이름은 쓰지 않는다.
6. 아래 형식만 출력한다. 머리말, 맺음말, 다른 제목, 목록 기호를 쓰지 않는다. 강조가 필요하면 **굵게**만 쓴다.
7. 각 섹션은 2~3문단, 문단은 2~3문장으로 쓴다. 문단 사이는 빈 줄 하나로 나눈다.`;

export const ILJU_PRESET_SYSTEM = `${RULES}

형식
## [summary]
키워드: 명사1, 명사2, 명사3 (꾸미는 말 없이 명사 한 단어씩. 예: 책임감, 거리두기, 사색)
이 일주를 자연 이미지에 빗댄 한 문장(40자 이내, "~ 같은 사람"으로 끝낸다)
## [nature]
타고난 성향과 강점·약점
## [work]
잘 맞는 일하는 방식과 돈을 다루는 성향
## [relation]
사람을 대하는 방식과 연애·가까운 관계에서의 모습`;

export const YEAR_PRESET_SYSTEM = `${RULES}
8. 첫 줄은 정확히 "## [year]"라고 쓴다. 대괄호와 영어 단어 year를 그대로 쓰고, 연도 숫자로 바꾸지 않는다.

형식
## [year]
해당 연도 세운이 이 일간에게 주는 기회와 조심할 점`;

export function iljuPresetPrompt(ilju: IljuEntry): string {
  const nature = STEM_NATURES[ilju.stem];
  return [
    "[일주 데이터]",
    `- 일주: ${ilju.hanja}(${ilju.korean}) — 일간 ${ilju.stem}(${ELEMENT_NAMES[ilju.element]}, ${ilju.yinYang}), 일지 ${ilju.branch}`,
    `- 상징: ${ilju.symbol} (일간 자연물: ${nature.nature}, 일지 장면: ${ilju.scene}, 계절: ${ilju.season})`,
    `- 기본 성향 메모: ${ilju.description}`,
    "",
    "[요청]",
    "위 일주의 기본 풀이를 형식에 맞춰 써줘.",
  ].join("\n");
}

export function yearPresetPrompt(stem: HeavenlyStem, year: number, yearHanja: string, stemTenGod: string, branchTenGod: string): string {
  return [
    "[세운 데이터]",
    `- 일간: ${stemHanja(stem)}(${stem}) — ${STEM_NATURES[stem].nature}`,
    `- ${year}년 세운: ${yearHanja} — 이 일간에게 천간은 ${stemTenGod}, 지지는 ${branchTenGod}`,
    "",
    "[요청]",
    `${stem} 일간을 가진 사람에게 ${year}년이 어떤 해인지 형식에 맞춰 써줘.`,
  ].join("\n");
}
