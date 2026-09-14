import { describe, expect, it } from "vitest";
import { exportFileName } from "@/lib/export/download";

describe("exportFileName", () => {
  it("일주·종류·날짜로 파일 이름을 만든다", () => {
    expect(exportFileName("갑자", "summary", new Date(2026, 8, 14))).toBe("갑자일주-요약카드-20260914.png");
    expect(exportFileName("계해", "full", new Date(2026, 0, 3))).toBe("계해일주-전체결과-20260103.png");
  });
});
