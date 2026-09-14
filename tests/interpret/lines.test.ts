import { describe, expect, it } from "vitest";
import { createLineSplitter } from "@/lib/interpret/lines";

describe("createLineSplitter", () => {
  it("청크 경계를 넘는 줄을 이어 붙이고 빈 줄은 버린다", () => {
    const s = createLineSplitter();
    expect(s.push("a\nb")).toEqual(["a"]);
    expect(s.push("c\n\nd")).toEqual(["bc"]);
    expect(s.flush()).toEqual(["d"]);
    expect(s.flush()).toEqual([]);
  });
});
