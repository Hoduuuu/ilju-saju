import { describe, expect, it } from "vitest";
import { elementSegments, elementSummary } from "@/lib/view/elements";

describe("elements view", () => {
  it("비어 있는 오행을 먼저 알려준다", () => {
    expect(elementSummary({ 목: 2, 화: 2, 토: 0, 금: 1, 수: 1 })).toBe("흙(土) 기운이 비어 있어요");
    expect(elementSummary({ 목: 3, 화: 3, 토: 0, 금: 0, 수: 0 })).toBe("흙(土)·쇠(金)·물(水) 기운이 비어 있어요");
  });

  it("비어 있는 게 없으면 가장 강한 기운", () => {
    expect(elementSummary({ 목: 2, 화: 1, 토: 1, 금: 2, 수: 2 })).toBe("나무(木)·쇠(金)·물(水) 기운이 가장 강해요");
  });

  it("세그먼트는 목화토금수 순서", () => {
    const segs = elementSegments({ 목: 2, 화: 2, 토: 0, 금: 1, 수: 1 });
    expect(segs.map((s) => `${s.hanja}${s.count}`)).toEqual(["木2", "火2", "土0", "金1", "水1"]);
  });
});
