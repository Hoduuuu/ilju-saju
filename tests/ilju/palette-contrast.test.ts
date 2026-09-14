import { describe, expect, it } from "vitest";
import { ILJU_LIST } from "@/lib/ilju/data";
import { WHITE, contrastRatio, hexToRgb } from "@/lib/ilju/color";
import { textZoneEdgeColor } from "@/lib/ilju/palette";

describe("일주 팔레트 흰색 대비 (WCAG AA 4.5:1)", () => {
  it.each(ILJU_LIST.map((e) => [e.id, e] as const))("%s", (_id, entry) => {
    expect(contrastRatio(WHITE, hexToRgb(entry.palette.top))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(WHITE, textZoneEdgeColor(entry.palette))).toBeGreaterThanOrEqual(4.5);
  });
});
