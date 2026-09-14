import { describe, expect, it } from "vitest";
import { getIlju } from "@/lib/ilju/data";
import { imagePrompt } from "@/lib/ilju/prompt";

describe("imagePrompt", () => {
  it("주인공·배경·팔레트·텍스트 여백 지시가 들어간다", () => {
    const entry = getIlju("gap-ja")!;
    const prompt = imagePrompt(entry);
    expect(prompt).toContain("a single tall majestic tree");
    expect(prompt).toContain("a still frozen lake on a deep winter night");
    expect(prompt).toContain(entry.palette.top);
    expect(prompt).toContain("top 45%");
    expect(prompt).toContain("no text");
  });
});
