import type { FiveElement } from "manseryeok";
import type { IljuEntry } from "@/lib/ilju/data";
import type { SajuResult } from "@/lib/saju/types";
import { ELEMENTS, ELEMENT_HANJA } from "@/lib/saju/ganji";
import { ELEMENT_NAMES } from "@/lib/view/elements";
import { TEN_GOD_YEAR_MEANING, daeunMeaning, tenGodLabel } from "@/lib/view/tenGods";
import { parseSections } from "./sections";
import iljuReadings from "@/data/readings/ilju.json";
import yearReadings from "@/data/readings/year-2026.json";

/**
 * 배포(공유) 사이트용 풀이. AI를 실시간으로 부르지 않고
 * - 일주별로 미리 만든 AI 풀이(요약·성향·일과 재물·관계)
 * - 일간별로 미리 만든 올해 풀이
 * - 이 사람 원국으로 계산해 쓰는 오행 균형·대운·시간 모름 안내
 * 를 AI 풀이와 같은 "## [섹션]" 형식으로 이어 붙인다.
 * 미리 만든 글이 아직 없는 경우에도 빈 칸이 생기지 않도록 도감 설명·십신 풀이로 대신 채운다.
 */
const ILJU = iljuReadings as Record<string, string>;
const YEAR = yearReadings as Record<string, string>;

const ELEMENT_ROLE: Record<FiveElement, string> = {
  목: "새로 시작하고 자라나는 힘",
  화: "생각을 드러내고 표현하는 힘",
  토: "중심을 잡고 조율하는 힘",
  금: "기준을 세우고 정리하는 힘",
  수: "깊이 생각하고 흐름을 읽는 힘",
};
const ELEMENT_BOOST: Record<FiveElement, string> = {
  목: "새로운 것을 배우거나 작은 계획을 세워 바로 시작해 보세요. 식물을 가꾸거나 아침 산책을 하는 것도 도움이 돼요.",
  화: "생각을 말과 글로 꺼내 보고, 사람들 앞에 서는 경험을 조금씩 늘려 보세요. 햇볕을 쬐는 시간도 좋아요.",
  토: "하루 일과를 일정하게 지키고 약속과 할 일을 적어 두는 습관이 중심을 잡아 줘요.",
  금: "할 일과 하지 않을 일을 정해 정리하는 연습이 도움이 돼요. 책상이나 방 정리부터 시작해 보세요.",
  수: "하루에 한 번 조용히 생각을 정리하는 시간을 가져 보세요. 일기나 혼자 걷는 시간이 좋아요.",
};
const ELEMENT_TOO_MUCH: Record<FiveElement, string> = {
  목: "일을 여러 개 벌이기 쉬우니 끝맺음을 챙기면 좋아요.",
  화: "마음이 빨리 달아오를 수 있어 중요한 결정 앞에서는 한 박자 쉬어 가면 좋아요.",
  토: "생각이 많아 결정이 늦어질 수 있으니 기한을 정해 두면 좋아요.",
  금: "기준이 엄격해 나와 남에게 날카로워질 수 있으니 여유를 두면 좋아요.",
  수: "생각이 걱정으로 번지기 쉬우니 몸을 움직여 머리를 비워 주면 좋아요.",
};

const label = (e: FiveElement) => `**${ELEMENT_NAMES[e]}(${ELEMENT_HANJA[e]})**`;

function elementsSection(result: SajuResult): string {
  const counts = result.elementCounts;
  const total = ELEMENTS.reduce((sum, e) => sum + counts[e], 0);
  const list = ELEMENTS.map((e) => `${ELEMENT_NAMES[e]} ${counts[e]}`).join(", ");
  const max = Math.max(...ELEMENTS.map((e) => counts[e]));
  const strongest = ELEMENTS.filter((e) => counts[e] === max);
  const empty = ELEMENTS.filter((e) => counts[e] === 0);
  const min = Math.min(...ELEMENTS.map((e) => counts[e]));
  const weakest = empty.length > 0 ? empty : ELEMENTS.filter((e) => counts[e] === min);

  const first = [
    `원국 ${total}글자의 오행(나무·불·흙·쇠·물 다섯 가지 기운)은 ${list}이에요.`,
    `가장 많은 ${strongest.map(label).join("·")} 기운은 ${strongest.map((e) => ELEMENT_ROLE[e]).join(", ")}이라, 이 힘이 삶에서 자연스럽게 두드러지는 편이에요.`,
    max >= 3 ? strongest.map((e) => ELEMENT_TOO_MUCH[e]).join(" ") : "",
  ].filter(Boolean).join(" ");

  const second = [
    empty.length > 0
      ? `${empty.map(label).join("·")} 기운은 비어 있어요. ${empty.map((e) => ELEMENT_ROLE[e]).join(", ")}을 일상에서 조금씩 채워 주면 균형이 좋아져요.`
      : `${weakest.map(label).join("·")} 기운이 상대적으로 적어요. ${weakest.map((e) => ELEMENT_ROLE[e]).join(", ")}을 의식해서 쓰면 균형이 좋아져요.`,
    weakest.map((e) => ELEMENT_BOOST[e]).join(" "),
  ].join(" ");
  return `${first}\n\n${second}`;
}

function daeunSection(result: SajuResult): string {
  const { daeun, currentDaeunIndex } = result;
  const intro = `대운(10년마다 바뀌는 인생의 큰 흐름)은 ${daeun.startAge}세에 시작해 10년마다 바뀌어요.`;
  if (currentDaeunIndex === null) {
    const first = daeun.pillars[0];
    return `${intro} 아직 첫 대운 전이라, ${first.age}세부터 ${first.hanja}(${tenGodLabel(first.stemTenGod, first.branchTenGod)}) 대운이 시작돼요. ${daeunMeaning(first.stemTenGod, first.branchTenGod)}`;
  }
  const now = daeun.pillars[currentDaeunIndex];
  const next = daeun.pillars[currentDaeunIndex + 1];
  const endAge = next ? next.age - 1 : now.age + 9;
  const first = `${intro} 지금은 **${now.age}~${endAge}세 ${now.hanja} 대운**으로, 나에게 ${tenGodLabel(now.stemTenGod, now.branchTenGod)}에 해당해요. ${daeunMeaning(now.stemTenGod, now.branchTenGod)}`;
  const second = next
    ? `다음 ${next.age}세부터는 ${next.hanja}(${tenGodLabel(next.stemTenGod, next.branchTenGod)}) 대운으로 넘어가요. ${daeunMeaning(next.stemTenGod, next.branchTenGod)} 대운은 한 해보다 긴 흐름이니, 지금 10년의 방향을 정하고 다음 10년을 준비하는 데 쓰면 좋아요.`
    : "대운은 한 해보다 긴 흐름이니, 지금 10년의 방향을 정하는 데 쓰면 좋아요.";
  return `${first}\n\n${second}`;
}

const NOTIME_SECTION =
  "태어난 시간을 몰라서 시주(태어난 시각의 기둥) 두 글자를 빼고 6글자로 풀이했어요. 시주는 속마음과 말년의 흐름, 자녀와의 관계 같은 부분을 보여 줘서, 시간을 알면 이 부분과 오행 균형이 더 정확해져요.\n\n출생 시간은 출생 기록이 남은 서류나 가족에게 확인할 수 있는 경우가 많아요. 알게 되면 다시 입력해 보세요.";

/** 미리 만든 올해 풀이가 없을 때: 세운 천간·지지의 십신 풀이로 쓴다 */
function yearFallback(result: SajuResult): string {
  const { seun } = result;
  const [stemHanja, branchHanja] = [...seun.hanja];
  return `${seun.year}년은 ${seun.hanja}(${seun.korean})년이에요. 올해 기운이 나에게 어떤 역할인지로 한 해의 흐름을 읽어요.\n\n**${stemHanja} ${seun.stemTenGod}**: ${TEN_GOD_YEAR_MEANING[seun.stemTenGod]}. **${branchHanja} ${seun.branchTenGod}**: ${TEN_GOD_YEAR_MEANING[seun.branchTenGod]}.`;
}

export function composePresetReading(result: SajuResult, ilju: IljuEntry): string {
  const s = parseSections(ILJU[ilju.id] ?? "");
  const yearBody = parseSections(YEAR[ilju.stem] ?? "").year ?? yearFallback(result);
  const parts: [string, string | undefined][] = [
    ["summary", s.summary ?? `키워드: ${ilju.keywords.join(", ")}\n${ilju.symbol} 같은 사람`],
    ["nature", s.nature ?? ilju.description],
    ["elements", elementsSection(result)],
    ["work", s.work],
    ["relation", s.relation],
    ["daeun", daeunSection(result)],
    ["year", yearBody],
  ];
  if (!result.input.time) parts.push(["notime", NOTIME_SECTION]);
  return parts
    .filter((part): part is [string, string] => Boolean(part[1]))
    .map(([id, body]) => `## [${id}]\n${body}`)
    .join("\n\n");
}

/** 미리 만든 풀이가 모두(60일주 + 10일간) 채워졌는지 */
export function presetCoverage(): { ilju: number; year: number } {
  return { ilju: Object.keys(ILJU).length, year: Object.keys(YEAR).length };
}
