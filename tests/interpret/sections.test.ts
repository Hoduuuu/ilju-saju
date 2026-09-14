import { describe, expect, it } from "vitest";
import { bodySectionIds, currentSectionId, parseSections, parseSummary } from "@/lib/interpret/sections";

describe("parseSections", () => {
  it("섹션 표시로 나누고 모르는 섹션과 머리말은 extra로 모은다", () => {
    const text = "안녕하세요\n## [summary]\n키워드: 곧음, 깊음, 인내\n겨울 호수 곁의 큰 나무 같은 사람\n## [nature]\n첫 문단\n\n둘째 문단\n## [unknown]\n엉뚱한 글\n";
    expect(parseSections(text)).toEqual({
      extra: "안녕하세요\n엉뚱한 글",
      summary: "키워드: 곧음, 깊음, 인내\n겨울 호수 곁의 큰 나무 같은 사람",
      nature: "첫 문단\n\n둘째 문단",
    });
  });

  it("쓰는 중인 마지막 섹션 표시 줄은 본문에 섞지 않는다", () => {
    expect(parseSections("## [summary]\n문장\n## [nat")).toEqual({ summary: "문장" });
  });

  it("줄바꿈 없이 끝난 본문 줄은 포함한다", () => {
    expect(parseSections("## [nature]\n쓰는 중인 문장")).toEqual({ nature: "쓰는 중인 문장" });
  });
});

describe("parseSummary", () => {
  it("키워드와 문장을 분리한다", () => {
    expect(parseSummary("키워드: #곧음, 깊음 ,인내\n겨울 호수 곁의\n큰 나무 같은 사람")).toEqual({
      keywords: ["곧음", "깊음", "인내"],
      sentence: "겨울 호수 곁의 큰 나무 같은 사람",
    });
  });
});

describe("섹션 순서", () => {
  it("시간 모름일 때만 notime을 포함한다", () => {
    expect(bodySectionIds(true)).toEqual(["nature", "elements", "work", "relation", "daeun", "year"]);
    expect(bodySectionIds(false).at(-1)).toBe("notime");
  });

  it("현재 쓰는 섹션은 내용이 있는 마지막 섹션", () => {
    expect(currentSectionId({ nature: "a", elements: "b" }, bodySectionIds(true))).toBe("elements");
    expect(currentSectionId({}, bodySectionIds(true))).toBeNull();
  });
});
