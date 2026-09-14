import { describe, expect, it } from "vitest";
import { ILJU_LIST, filterByElement, getIlju } from "@/lib/ilju/data";

describe("ILJU_LIST", () => {
  it("60개, id·상징 문구가 고유하다", () => {
    expect(ILJU_LIST).toHaveLength(60);
    expect(new Set(ILJU_LIST.map((e) => e.id)).size).toBe(60);
    expect(new Set(ILJU_LIST.map((e) => e.symbol)).size).toBe(60);
  });

  it("갑자 일주 정보", () => {
    const e = getIlju("gap-ja");
    expect(e).toMatchObject({
      order: 0,
      hanja: "甲子",
      korean: "갑자",
      element: "목",
      yinYang: "양",
      season: "겨울",
      nature: "큰 나무",
      symbol: "한겨울 고요한 호숫가의 큰 나무",
      keywords: ["곧음", "개척", "깊이"],
      motif: "tree",
    });
    expect(e?.description).toContain("큰 나무");
    expect(e?.description).toContain("한겨울 호수");
  });

  it("각 일주의 키워드 3개가 서로 겹치지 않는다", () => {
    for (const e of ILJU_LIST) expect(new Set(e.keywords).size).toBe(3);
  });

  it("없는 id는 undefined", () => {
    expect(getIlju("nope")).toBeUndefined();
  });

  it("오행 필터는 천간 오행 기준 12개씩", () => {
    expect(filterByElement(ILJU_LIST, "화")).toHaveLength(12);
    expect(filterByElement(ILJU_LIST, "all")).toHaveLength(60);
  });
});
