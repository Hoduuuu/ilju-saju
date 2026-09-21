import { describe, expect, it } from "vitest";
import { ILJU_LIST } from "@/lib/ilju/data";
import { motifSvg } from "@/lib/ilju/motifs";

describe("motifSvg", () => {
  it.each(ILJU_LIST.map((e) => [e.id, e] as const))("%s: 그림이 만들어지고 숫자 오류가 없다", (_id, entry) => {
    const svg = motifSvg(entry.motif, entry.branch, "t1");
    expect(svg.length).toBeGreaterThan(200);
    expect(svg).not.toMatch(/NaN|undefined|Infinity/);
  });

  it("같은 상징이라도 일지가 다르면 색이 달라진다", () => {
    expect(motifSvg("sun", "오", "a")).not.toBe(motifSvg("sun", "자", "a"));
  });

  it("filter·clipPath id에 접두어를 붙여 여러 카드가 한 화면에 있어도 겹치지 않는다", () => {
    const svg = motifSvg("field", "미", "card7");
    const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(id.startsWith("card7-")).toBe(true);
  });

  it("60장 모두 서로 다른 그림이다", () => {
    const all = new Set(ILJU_LIST.map((e) => motifSvg(e.motif, e.branch, "x")));
    expect(all.size).toBe(60);
  });
});
