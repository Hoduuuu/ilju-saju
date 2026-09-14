import type { IljuEntry } from "@/lib/ilju/data";
import type { PillarView, SajuResult } from "@/lib/saju/types";
import { formatBirth } from "@/lib/view/birth";

export const SYSTEM_PROMPT = `너는 한국 명리학(사주)에 밝고 말투가 따뜻한 상담가다.

규칙
1. 사용자 메시지의 [사주 데이터]만 근거로 풀이한다. 간지·십신·대운·세운을 스스로 다시 계산하거나 바꾸지 않는다.
2. 전문 용어는 처음 나올 때 괄호 안에 쉬운 말로 풀어 쓴다. 예: 식신(표현하고 베푸는 기운)
3. 공포를 주는 단정(큰 재앙, 반드시 실패 등), 건강 진단, 투자·법률 결정에 대한 단정적 조언을 하지 않는다.
4. 과장된 칭찬 없이 현실적이고 구체적으로, 일상에서 바로 적용할 수 있게 쓴다.
5. 해요체로 쓴다.
6. 아래 형식만 출력한다. 머리말, 맺음말, 다른 제목, 목록 기호를 쓰지 않는다. 강조가 필요하면 **굵게**만 쓴다.
7. 각 섹션은 2~3문단, 문단은 2~3문장으로 쓴다. 문단 사이는 빈 줄 하나로 나눈다.

형식
## [summary]
키워드: 단어1, 단어2, 단어3
이 사람을 일주의 자연 이미지에 빗댄 한 문장(40자 이내)
## [nature]
타고난 성향과 강점·약점
## [elements]
오행의 많고 적음과 일상에서 균형을 맞추는 방법
## [work]
잘 맞는 일하는 방식과 돈을 다루는 성향
## [relation]
사람을 대하는 방식과 사랑의 모습
## [daeun]
지금 대운을 중심으로 지난 대운과 다음 대운의 흐름
## [year]
2026년 세운의 기회와 조심할 점
## [notime]
(태어난 시간이 모름일 때만) 시주가 빠져 알 수 없는 부분과 시간을 알면 달라지는 점`;

function pillarLine(label: string, pillar: PillarView | null): string {
  if (!pillar) return `- ${label}: 모름`;
  return `- ${label} ${pillar.stemHanja}${pillar.branchHanja}(${pillar.stem}${pillar.branch}): 천간 ${pillar.stemTenGod}·${pillar.stemElement}, 지지 ${pillar.branchTenGod}·${pillar.branchElement}, 지장간 ${pillar.hiddenStems.join("")}, 12운성 ${pillar.twelveStage}`;
}

export function buildUserPrompt(result: SajuResult, ilju: IljuEntry): string {
  const { pillars, elementCounts, daeun, currentDaeunIndex, seun, warnings, input } = result;
  const daeunText = daeun.pillars
    .map((p, i) => `${p.age}세 ${p.hanja}(${p.korean})${i === currentDaeunIndex ? " ← 현재" : ""}`)
    .join(", ");
  return [
    "[사주 데이터]",
    `- 출생: ${formatBirth(result)}${input.time ? " (진태양시 보정, 야자시 적용)" : ""}`,
    `- 일주 ${ilju.hanja}(${ilju.korean}) — 상징: ${ilju.symbol}`,
    "- 원국",
    pillarLine("연주", pillars.year),
    pillarLine("월주", pillars.month),
    pillarLine("일주", pillars.day),
    pillarLine("시주", pillars.hour),
    `- 오행 개수(${pillars.hour ? "8글자" : "6글자"}): 목 ${elementCounts.목}, 화 ${elementCounts.화}, 토 ${elementCounts.토}, 금 ${elementCounts.금}, 수 ${elementCounts.수}`,
    `- 대운(${daeun.forward ? "순행" : "역행"}, 대운수 ${daeun.startAge}): ${daeunText}`,
    `- ${seun.year}년 세운: ${seun.hanja}(${seun.korean}) — 천간 ${seun.stemTenGod}, 지지 ${seun.branchTenGod}`,
    warnings.length > 0 ? `- 참고: ${warnings.map((w) => w.message).join(" ")}` : "",
    "",
    "[요청]",
    input.time
      ? "위 데이터로 형식에 맞춰 풀이해줘. 태어난 시간을 알고 있으므로 notime 섹션은 쓰지 않는다."
      : "위 데이터로 형식에 맞춰 풀이해줘. 태어난 시간이 모름이므로 notime 섹션을 반드시 쓴다.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
