import { describe, expect, it } from "vitest";
import { EARTHLY_BRANCHES } from "manseryeok";
import { HIDDEN_STEMS, twelveStage } from "@/lib/saju/tables";
import { BRANCH_ELEMENT, STEM_ELEMENT, branchIndex, stemIndex } from "@/lib/saju/ganji";

describe("HIDDEN_STEMS", () => {
  it("모든 지지의 마지막(정기) 천간 오행이 지지 오행과 같다", () => {
    for (const branch of EARTHLY_BRANCHES) {
      const hidden = HIDDEN_STEMS[branch];
      const main = hidden[hidden.length - 1];
      expect(STEM_ELEMENT[stemIndex(main)]).toBe(BRANCH_ELEMENT[branchIndex(branch)]);
    }
  });

  it("대표 지장간 값", () => {
    expect(HIDDEN_STEMS["인"]).toEqual(["무", "병", "갑"]);
    expect(HIDDEN_STEMS["유"]).toEqual(["경", "신"]);
  });
});

describe("twelveStage", () => {
  it("양간은 순행한다", () => {
    expect(twelveStage("갑", "해")).toBe("장생");
    expect(twelveStage("갑", "묘")).toBe("제왕");
    expect(twelveStage("경", "신")).toBe("건록");
  });

  it("음간은 역행한다", () => {
    expect(twelveStage("을", "오")).toBe("장생");
    expect(twelveStage("을", "인")).toBe("제왕");
    expect(twelveStage("계", "자")).toBe("건록");
  });
});
