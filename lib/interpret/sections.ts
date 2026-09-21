export const SECTION_IDS = ["summary", "nature", "elements", "work", "relation", "daeun", "year", "notime"] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export type Sections = Partial<Record<SectionId | "extra", string>>;

export const SECTION_TITLES: Record<SectionId, string> = {
  summary: "한 줄 요약",
  nature: "타고난 성향",
  elements: "오행 균형",
  work: "일과 재물",
  relation: "관계와 사랑",
  daeun: "대운 흐름",
  year: "2026년 올해",
  notime: "시간을 알면 달라지는 점",
};

const HEADER = /^##\s*\[(\w+)\]\s*$/;

export function parseSections(text: string): Sections {
  const lines = text.split("\n");
  const last = lines[lines.length - 1];
  if (!text.endsWith("\n") && last.trimStart().startsWith("#")) lines.pop();

  const raw: Partial<Record<SectionId | "extra", string[]>> = {};
  let current: SectionId | "extra" = "extra";
  for (const line of lines) {
    const match = line.trim().match(HEADER);
    if (match) {
      current = (SECTION_IDS as readonly string[]).includes(match[1]) ? (match[1] as SectionId) : "extra";
      raw[current] ??= [];
      continue;
    }
    (raw[current] ??= []).push(line);
  }

  const out: Sections = {};
  for (const key of Object.keys(raw) as (SectionId | "extra")[]) {
    const body = raw[key]!.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    if (body) out[key] = body;
  }
  return out;
}

export function parseSummary(body: string): { keywords: string[]; sentence: string } {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const keywordLine = lines.find((l) => /^키워드\s*[:：]/.test(l));
  const keywords = keywordLine
    ? keywordLine
        .replace(/^키워드\s*[:：]\s*/, "")
        .split(",")
        // "단단한 책임감"처럼 꾸미는 말이 붙어 오면 마지막 명사("책임감")만 남긴다
        .map((k) => k.trim().replace(/^#/, "").split(/\s+/).at(-1) ?? "")
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const sentence = lines.filter((l) => l !== keywordLine).join(" ");
  return { keywords, sentence };
}

export function bodySectionIds(timeKnown: boolean): SectionId[] {
  const ids: SectionId[] = ["nature", "elements", "work", "relation", "daeun", "year"];
  return timeKnown ? ids : [...ids, "notime"];
}

export function currentSectionId(sections: Sections, ids: SectionId[]): SectionId | null {
  for (let i = ids.length - 1; i >= 0; i -= 1) if (sections[ids[i]]) return ids[i];
  return null;
}
