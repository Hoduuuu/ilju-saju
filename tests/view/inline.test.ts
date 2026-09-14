import { describe, expect, it } from "vitest";
import { paragraphs, parseInline } from "@/lib/view/inline";

describe("inline", () => {
  it("**굵게**를 나눈다", () => {
    expect(parseInline("나는 **식신**이 강해")).toEqual([
      { text: "나는 ", bold: false },
      { text: "식신", bold: true },
      { text: "이 강해", bold: false },
    ]);
  });

  it("빈 줄로 문단을 나눈다", () => {
    expect(paragraphs("첫째\n\n\n둘째\n이어짐")).toEqual(["첫째", "둘째\n이어짐"]);
  });
});
