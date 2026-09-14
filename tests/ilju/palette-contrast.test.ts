import { describe, expect, it } from "vitest";
import { ILJU_LIST } from "@/lib/ilju/data";
import { contrastRatio, hexToRgb } from "@/lib/ilju/color";

describe("일주 팔레트 먹색-한지 대비 (WCAG AA 4.5:1)", () => {
  it.each(ILJU_LIST.map((e) => [e.id, e] as const))("%s", (_id, entry) => {
    expect(contrastRatio(hexToRgb(entry.palette.ink), hexToRgb(entry.palette.paper))).toBeGreaterThanOrEqual(4.5);
  });
});
