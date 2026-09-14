import type { FiveElement } from "manseryeok";
import { ELEMENTS, ELEMENT_HANJA } from "@/lib/saju/ganji";

export const ELEMENT_COLORS: Record<FiveElement, string> = {
  목: "#3f8f4e",
  화: "#d9483b",
  토: "#b7832f",
  금: "#8a8f98",
  수: "#2f6fd1",
};

export const ELEMENT_NAMES: Record<FiveElement, string> = { 목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물" };

const label = (e: FiveElement) => `${ELEMENT_NAMES[e]}(${ELEMENT_HANJA[e]})`;

export function elementSegments(counts: Record<FiveElement, number>) {
  return ELEMENTS.map((element) => ({
    element,
    hanja: ELEMENT_HANJA[element],
    name: ELEMENT_NAMES[element],
    count: counts[element],
    color: ELEMENT_COLORS[element],
  }));
}

export function elementSummary(counts: Record<FiveElement, number>): string {
  const empty = ELEMENTS.filter((e) => counts[e] === 0);
  if (empty.length > 0) return `${empty.map(label).join("·")} 기운이 비어 있어요`;
  const max = Math.max(...ELEMENTS.map((e) => counts[e]));
  return `${ELEMENTS.filter((e) => counts[e] === max).map(label).join("·")} 기운이 가장 강해요`;
}
