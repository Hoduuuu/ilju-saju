import { describe, expect, it } from "vitest";
import { calculateSaju } from "@/lib/saju/calculate";
import { daeunMeaning, tenGodLabel } from "@/lib/view/tenGods";

describe("대운 한 줄 풀이", () => {
  it("천간·지지 십신이 같으면 10년 전체로 말한다", () => {
    expect(daeunMeaning("정관", "정관")).toBe("역할과 평가가 분명해지고 인정받는 10년이에요.");
    expect(tenGodLabel("정관", "정관")).toBe("정관");
  });

  it("다르면 앞 5년·뒤 5년으로 나눠 말한다", () => {
    expect(daeunMeaning("편재", "겁재")).toMatch(/^앞 5년은 .+ 시기, 뒤 5년은 .+ 시기예요\.$/);
    expect(tenGodLabel("편재", "겁재")).toBe("편재·겁재");
  });

  it("계유일주(癸)에게 戊辰 대운은 정관이다", () => {
    const r = calculateSaju({ name: "테스트", calendar: "solar", isLeapMonth: false, year: 1994, month: 8, day: 15, time: { hour: 14, minute: 33 }, gender: "female", placeId: "bucheon" });
    const current = r.daeun.pillars[r.currentDaeunIndex!];
    expect(current.hanja).toBe("戊辰");
    expect([current.stemTenGod, current.branchTenGod]).toEqual(["정관", "정관"]);
  });
});
