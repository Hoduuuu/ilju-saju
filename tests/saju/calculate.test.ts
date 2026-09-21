import { describe, expect, it } from "vitest";
import { calculateSaju } from "@/lib/saju/calculate";
import { SajuInputError, type SajuInput } from "@/lib/saju/types";

const base: SajuInput = {
  name: "테스트", calendar: "solar",
  isLeapMonth: false,
  year: 1990,
  month: 5,
  day: 15,
  time: { hour: 14, minute: 30 },
  gender: "male",
  placeId: "seoul",
};

const korean = (r: ReturnType<typeof calculateSaju>) => ({
  year: r.pillars.year.stem + r.pillars.year.branch,
  month: r.pillars.month.stem + r.pillars.month.branch,
  day: r.pillars.day.stem + r.pillars.day.branch,
  hour: r.pillars.hour ? r.pillars.hour.stem + r.pillars.hour.branch : null,
});

describe("calculateSaju 정답 사례", () => {
  it("1992-10-24 05:30 서울", () => {
    const r = calculateSaju({ ...base, year: 1992, month: 10, day: 24, time: { hour: 5, minute: 30 } });
    expect(korean(r)).toEqual({ year: "임신", month: "경술", day: "계유", hour: "을묘" });
    expect(r.iljuId).toBe("gye-yu");
  });

  it("야자시: 2024-03-10 23:59는 일주 당일 유지, 시주는 다음날 기준 갑자", () => {
    const r = calculateSaju({ ...base, year: 2024, month: 3, day: 10, time: { hour: 23, minute: 59 } });
    expect(korean(r)).toEqual({ year: "갑진", month: "정묘", day: "계유", hour: "갑자" });
  });

  it("진태양시: 2024-03-10 23:30은 보정 후 해시", () => {
    const r = calculateSaju({ ...base, year: 2024, month: 3, day: 10, time: { hour: 23, minute: 30 } });
    expect(korean(r).hour).toBe("계해");
  });

  it("서머타임: 1988-06-15 01:10", () => {
    const r = calculateSaju({ ...base, year: 1988, month: 6, day: 15, time: { hour: 1, minute: 10 } });
    expect(korean(r)).toEqual({ year: "무진", month: "무오", day: "경자", hour: "무자" });
  });

  it("입춘 경계: 2024-02-04 17:10은 계묘년, 17:45는 갑진년", () => {
    const before = calculateSaju({ ...base, year: 2024, month: 2, day: 4, time: { hour: 17, minute: 10 } });
    const after = calculateSaju({ ...base, year: 2024, month: 2, day: 4, time: { hour: 17, minute: 45 } });
    expect(korean(before).year).toBe("계묘");
    expect(korean(before).month).toBe("을축");
    expect(korean(after).year).toBe("갑진");
    expect(korean(after).month).toBe("병인");
    expect(before.warnings).toEqual([]);
  });

  it("입춘 ±2분 안 출생은 경계 경고", () => {
    const r = calculateSaju({ ...base, year: 2024, month: 2, day: 4, time: { hour: 17, minute: 26 } });
    expect(r.warnings.map((w) => w.kind)).toContain("solarTermBoundary");
  });

  it("음력 1997-01-01은 양력 1997-02-08(한국 기준)", () => {
    const r = calculateSaju({ ...base, calendar: "lunar", year: 1997, month: 1, day: 1 });
    expect(r.solarDate).toEqual({ year: 1997, month: 2, day: 8 });
  });

  it("음력 2028-01-01은 양력 2028-01-27", () => {
    const r = calculateSaju({ ...base, calendar: "lunar", year: 2028, month: 1, day: 1 });
    expect(r.solarDate).toEqual({ year: 2028, month: 1, day: 27 });
  });

  it("대운과 현재 대운(2026년 기준 36세 → 27세 갑신)", () => {
    const r = calculateSaju(base);
    expect(korean(r)).toEqual({ year: "경오", month: "신사", day: "경진", hour: "계미" });
    expect(r.daeun.forward).toBe(true);
    expect(r.daeun.startAge).toBe(7);
    expect(r.daeun.pillars.slice(0, 4).map((p) => `${p.age}${p.korean}`)).toEqual(["7임오", "17계미", "27갑신", "37을유"]);
    expect(r.daeun.pillars[0].hanja).toBe("壬午");
    expect(r.currentDaeunIndex).toBe(2);
  });

  it("여성은 역행 대운", () => {
    const r = calculateSaju({ ...base, gender: "female" });
    expect(r.daeun.forward).toBe(false);
    expect(r.daeun.pillars.slice(0, 2).map((p) => `${p.age}${p.korean}`)).toEqual(["3경진", "13기묘"]);
  });

  it("2026 세운은 丙午이고 일간 기준 십신이 붙는다", () => {
    const r = calculateSaju(base);
    expect(r.seun).toMatchObject({ year: 2026, stem: "병", branch: "오", hanja: "丙午", korean: "병오", stemTenGod: "편관" });
  });

  it("십신·지장간·12운성이 기둥에 붙는다", () => {
    const r = calculateSaju(base);
    expect(r.pillars.day.stemTenGod).toBe("일간");
    expect(r.pillars.year.stemTenGod).toBe("비견");
    expect(r.pillars.year.branchTenGod).toBe("정관");
    expect(r.pillars.day.hiddenStems).toEqual(["을", "계", "무"]);
    expect(r.pillars.day.twelveStage).toBe("양");
    expect(r.pillars.day.stemHanja).toBe("庚");
  });

  it("오행 개수: 시간이 있으면 8글자", () => {
    const r = calculateSaju(base);
    expect(Object.values(r.elementCounts).reduce((a, b) => a + b, 0)).toBe(8);
  });
});

describe("시간 모름", () => {
  it("시주 null, 오행 6글자", () => {
    const r = calculateSaju({ ...base, time: null });
    expect(r.pillars.hour).toBeNull();
    expect(korean(r).day).toBe("경진");
    expect(Object.values(r.elementCounts).reduce((a, b) => a + b, 0)).toBe(6);
  });

  it("절기가 바뀌는 날이면 경고", () => {
    const r = calculateSaju({ ...base, year: 2024, month: 2, day: 4, time: null });
    expect(r.warnings.map((w) => w.kind)).toContain("solarTermBoundary");
  });

  it("절기가 바뀌지 않는 날은 경고 없음", () => {
    const r = calculateSaju({ ...base, year: 2024, month: 2, day: 5, time: null });
    expect(r.warnings).toEqual([]);
  });
});

describe("서머타임 전환 시각 경고", () => {
  it("없던 시각과 두 번 있던 시각", () => {
    const skipped = calculateSaju({ ...base, year: 1987, month: 5, day: 10, time: { hour: 2, minute: 30 } });
    const doubled = calculateSaju({ ...base, year: 1987, month: 10, day: 11, time: { hour: 2, minute: 30 } });
    expect(skipped.warnings.map((w) => w.kind)).toContain("dstTransition");
    expect(doubled.warnings.map((w) => w.kind)).toContain("dstTransition");
  });
});

describe("입력 오류", () => {
  it("존재하지 않는 양력 날짜", () => {
    expect(() => calculateSaju({ ...base, year: 2023, month: 2, day: 30 })).toThrow(SajuInputError);
  });

  it("존재하지 않는 윤달", () => {
    expect(() => calculateSaju({ ...base, calendar: "lunar", isLeapMonth: true, year: 2020, month: 3, day: 1 })).toThrow(/윤3월/);
  });

  it("지원 범위 밖", () => {
    expect(() => calculateSaju({ ...base, year: 1899 })).toThrow(SajuInputError);
    expect(() => calculateSaju({ ...base, year: 2050 })).toThrow(SajuInputError);
  });

  it("알 수 없는 출생지", () => {
    expect(() => calculateSaju({ ...base, placeId: "mars" })).toThrow(SajuInputError);
  });

  it("음력 연도가 범위 밖이어도 변환된 양력이 범위 안이면 허용", () => {
    const r = calculateSaju({ ...base, calendar: "lunar", year: 1899, month: 12, day: 1, time: null });
    expect(r.solarDate).toEqual({ year: 1900, month: 1, day: 1 });
  });
});
