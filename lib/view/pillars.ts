import type { PillarView, SajuResult } from "@/lib/saju/types";

export interface PillarColumn {
  key: "hour" | "day" | "month" | "year";
  label: string;
  pillar: PillarView | null;
  highlight: boolean;
}

export function pillarColumns(result: SajuResult): PillarColumn[] {
  return [
    { key: "hour", label: "시", pillar: result.pillars.hour, highlight: false },
    { key: "day", label: "일 · 나", pillar: result.pillars.day, highlight: true },
    { key: "month", label: "월", pillar: result.pillars.month, highlight: false },
    { key: "year", label: "연", pillar: result.pillars.year, highlight: false },
  ];
}
