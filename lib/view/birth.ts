import { findPlace } from "@/lib/saju/places";
import type { SajuResult } from "@/lib/saju/types";

export function formatBirth(result: SajuResult): string {
  const { input, solarDate } = result;
  const date = `${input.year}.${input.month}.${input.day}`;
  const calendar =
    input.calendar === "lunar"
      ? `음력 ${input.isLeapMonth ? "윤" : ""}${date} (양력 ${solarDate.year}.${solarDate.month}.${solarDate.day})`
      : `양력 ${date}`;
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = input.time ? `${calendar} ${pad(input.time.hour)}:${pad(input.time.minute)} · ${findPlace(input.placeId)?.city ?? ""}` : `${calendar} · 시간 모름`;
  return `${time} · ${input.gender === "male" ? "남성" : "여성"}`;
}
