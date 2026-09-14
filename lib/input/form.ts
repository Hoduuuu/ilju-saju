import { calculateSaju } from "@/lib/saju/calculate";
import { DEFAULT_PLACE_ID } from "@/lib/saju/places";
import { SajuInputError, type SajuInput } from "@/lib/saju/types";

export interface FormValues {
  calendar: "solar" | "lunar";
  isLeapMonth: boolean;
  year: string;
  month: string;
  day: string;
  timeKnown: boolean;
  time: string;
  gender: "male" | "female" | "";
  placeId: string;
}

export type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

export const EMPTY_FORM: FormValues = {
  calendar: "solar",
  isLeapMonth: false,
  year: "",
  month: "",
  day: "",
  timeKnown: false,
  time: "",
  gender: "",
  placeId: DEFAULT_PLACE_ID,
};

const toInt = (value: string): number => (/^\d+$/.test(value.trim()) ? Number(value.trim()) : Number.NaN);

export function formToInput(values: FormValues): { ok: true; input: SajuInput } | { ok: false; errors: FormErrors } {
  const errors: FormErrors = {};
  const year = toInt(values.year);
  const month = toInt(values.month);
  const day = toInt(values.day);

  if (values.year.trim().length !== 4 || Number.isNaN(year)) errors.year = "태어난 해를 4자리 숫자로 입력해 주세요.";
  if (!(month >= 1 && month <= 12)) errors.month = "월은 1~12 사이로 입력해 주세요.";
  if (!(day >= 1 && day <= 31)) errors.day = "일은 1~31 사이로 입력해 주세요.";
  if (values.gender === "") errors.gender = "성별을 선택해 주세요.";

  let time: SajuInput["time"] = null;
  if (values.timeKnown) {
    const match = values.time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!match) errors.time = "태어난 시간을 선택해 주세요.";
    else time = { hour: Number(match[1]), minute: Number(match[2]) };
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const input: SajuInput = {
    calendar: values.calendar,
    isLeapMonth: values.calendar === "lunar" && values.isLeapMonth,
    year,
    month,
    day,
    time,
    gender: values.gender as "male" | "female",
    placeId: values.placeId,
  };

  try {
    calculateSaju(input);
  } catch (error) {
    if (error instanceof SajuInputError) return { ok: false, errors: { form: error.message } };
    throw error;
  }
  return { ok: true, input };
}

export function inputToForm(input: SajuInput): FormValues {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    calendar: input.calendar,
    isLeapMonth: input.isLeapMonth,
    year: String(input.year),
    month: String(input.month),
    day: String(input.day),
    timeKnown: input.time !== null,
    time: input.time ? `${pad(input.time.hour)}:${pad(input.time.minute)}` : "",
    gender: input.gender,
    placeId: input.placeId,
  };
}
