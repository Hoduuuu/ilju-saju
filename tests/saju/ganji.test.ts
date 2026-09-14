import { describe, expect, it } from "vitest";
import { iljuId, sixtyGanji, stemHanja, branchHanja, yearGanji, STEM_ELEMENT, BRANCH_ELEMENT } from "@/lib/saju/ganji";

describe("yearGanji", () => {
  it("연도의 간지를 구한다", () => {
    expect(yearGanji(2026)).toEqual({ stem: "병", branch: "오" });
    expect(yearGanji(1984)).toEqual({ stem: "갑", branch: "자" });
    expect(yearGanji(2024)).toEqual({ stem: "갑", branch: "진" });
  });
});

describe("iljuId", () => {
  it("천간-지지 로마자 id를 만든다", () => {
    expect(iljuId("갑", "자")).toBe("gap-ja");
    expect(iljuId("신", "신")).toBe("sin-sin");
    expect(iljuId("계", "해")).toBe("gye-hae");
  });
});

describe("sixtyGanji", () => {
  it("60갑자를 순서대로, 중복 없이 돌려준다", () => {
    const list = sixtyGanji();
    expect(list).toHaveLength(60);
    expect(list[0]).toEqual({ stem: "갑", branch: "자" });
    expect(list[59]).toEqual({ stem: "계", branch: "해" });
    expect(new Set(list.map((g) => iljuId(g.stem, g.branch))).size).toBe(60);
  });
});

describe("한자와 오행", () => {
  it("한자와 오행을 돌려준다", () => {
    expect(stemHanja("병")).toBe("丙");
    expect(branchHanja("오")).toBe("午");
    expect(STEM_ELEMENT[2]).toBe("화");
    expect(BRANCH_ELEMENT[0]).toBe("수");
  });
});
