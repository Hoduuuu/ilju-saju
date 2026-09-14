import { describe, expect, it } from "vitest";
import { BRANCH_SEASONS } from "@/lib/ilju/branches";
import { getIlju } from "@/lib/ilju/data";
import { imagePrompt } from "@/lib/ilju/prompt";

describe("imagePrompt", () => {
  it("주인공·계절 배경·한지 색·텍스트 여백 지시가 들어간다", () => {
    const entry = getIlju("gap-ja")!;
    const prompt = imagePrompt(entry);
    expect(prompt).toContain("a single tall majestic tree");
    expect(prompt).toContain("a still frozen lake on a deep winter night");
    // 색은 카드에서 코드로 입히므로, 생성 문구에는 배경색이 들어가지 않는다.
    expect(prompt).not.toContain(BRANCH_SEASONS[entry.branch].paperColor);
    expect(prompt).toContain("Pure black sumi ink on white only");
    expect(prompt).toContain("upper-left 45%");
    expect(prompt).toContain("No text, no letters");
  });

  it("세로로 선 주인공은 오른쪽, 넓게 퍼지는 주인공은 수평으로 배치한다", () => {
    expect(imagePrompt(getIlju("gap-ja")!)).toContain("right side of the frame");
    expect(imagePrompt(getIlju("mu-jin")!)).toContain("spreads horizontally");
  });

  it("모든 지지에 한지 배경색이 정의되어 있다", () => {
    for (const branch of Object.values(BRANCH_SEASONS)) {
      expect(branch.paperColor).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});
