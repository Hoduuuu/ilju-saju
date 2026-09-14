import { describe, expect, it } from "vitest";
import { parseSajuInput } from "@/lib/saju/calculate";
import { SajuInputError } from "@/lib/saju/types";

const valid = {
  calendar: "solar",
  isLeapMonth: false,
  year: 1990,
  month: 5,
  day: 15,
  time: null,
  gender: "female",
  placeId: "seoul",
};

describe("parseSajuInput", () => {
  it("올바른 값은 그대로 돌려준다", () => {
    expect(parseSajuInput(valid)).toEqual(valid);
    expect(parseSajuInput({ ...valid, time: { hour: 0, minute: 5 } }).time).toEqual({ hour: 0, minute: 5 });
  });

  it("잘못된 값은 SajuInputError", () => {
    expect(() => parseSajuInput(null)).toThrow(SajuInputError);
    expect(() => parseSajuInput({ ...valid, calendar: "moon" })).toThrow(SajuInputError);
    expect(() => parseSajuInput({ ...valid, month: 13 })).toThrow(SajuInputError);
    expect(() => parseSajuInput({ ...valid, gender: "" })).toThrow(SajuInputError);
    expect(() => parseSajuInput({ ...valid, time: { hour: 24, minute: 0 } })).toThrow(SajuInputError);
    expect(() => parseSajuInput({ ...valid, year: "1990" })).toThrow(SajuInputError);
  });
});
