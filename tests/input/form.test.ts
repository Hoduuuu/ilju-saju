import { describe, expect, it } from "vitest";
import { EMPTY_FORM, formToInput, inputToForm, type FormValues } from "@/lib/input/form";

const filled: FormValues = {
  ...EMPTY_FORM,
  name: "테스트",
  year: "1990",
  month: "5",
  day: "15",
  gender: "female",
};

describe("formToInput", () => {
  it("시간을 모르면 time null", () => {
    const r = formToInput({ ...filled, timeKnown: false });
    expect(r).toEqual({
      ok: true,
      input: { name: "테스트", calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: null, gender: "female", placeId: "seoul" },
    });
  });

  it("기본값(시간 입력 유도)이면 time을 채워야 성공한다", () => {
    const r = formToInput({ ...filled, time: "07:05", placeId: "busan" });
    expect(r.ok && r.input.time).toEqual({ hour: 7, minute: 5 });
    expect(r.ok && r.input.placeId).toBe("busan");
  });

  it("시간을 알면 HH:MM을 숫자로 바꾼다", () => {
    const r = formToInput({ ...filled, timeKnown: true, time: "07:05", placeId: "busan" });
    expect(r.ok && r.input.time).toEqual({ hour: 7, minute: 5 });
    expect(r.ok && r.input.placeId).toBe("busan");
  });

  it("빈 값은 필드별 오류", () => {
    const r = formToInput(EMPTY_FORM);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["day", "gender", "month", "name", "time", "year"]);
  });

  it("이름은 앞뒤 공백을 지우고, 비어 있으면 오류", () => {
    const ok = formToInput({ ...filled, timeKnown: false, name: "  김  하늘 " });
    expect(ok.ok && ok.input.name).toBe("김 하늘");
    const blank = formToInput({ ...filled, timeKnown: false, name: "   " });
    expect(!blank.ok && blank.errors.name).toBe("이름을 입력해 주세요.");
  });

  it("시간을 안다고 했는데 비어 있으면 time 오류", () => {
    const r = formToInput({ ...filled, timeKnown: true, time: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.time).toBeDefined();
  });

  it("양력이면 윤달 체크를 무시한다", () => {
    const r = formToInput({ ...filled, timeKnown: false, isLeapMonth: true });
    expect(r.ok).toBe(true);
    expect(r.ok && r.input.isLeapMonth).toBe(false);
  });

  it("없는 날짜는 form 오류로 계산 엔진 메시지를 보여준다", () => {
    const r = formToInput({ ...filled, timeKnown: false, month: "2", day: "30" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.form).toContain("없는 날짜");
  });

  it("inputToForm → formToInput 왕복", () => {
    const input = { name: "테스트", calendar: "lunar", isLeapMonth: true, year: 2020, month: 4, day: 1, time: { hour: 23, minute: 9 }, gender: "male", placeId: "jeju" } as const;
    const r = formToInput(inputToForm(input));
    expect(r).toEqual({ ok: true, input });
  });
});
