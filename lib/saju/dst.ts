const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

function seoulWallKey(epochMs: number): string {
  const parts = Object.fromEntries(formatter.formatToParts(epochMs).map((p) => [p.type, p.value]));
  return `${parts.year}-${Number(parts.month)}-${Number(parts.day)} ${parts.hour}:${parts.minute}`;
}

/**
 * 서울 벽시계 시각이 실제로 몇 번 존재했는지 센다.
 * 0 = 서머타임 시작으로 건너뛴 시각, 1 = 정상, 2 = 서머타임 종료로 두 번 있었던 시각.
 * UTC+7:00 ~ +11:00 사이 30분 간격 오프셋을 모두 대입해 본다.
 */
export function seoulWallTimeMatches(year: number, month: number, day: number, hour: number, minute: number): number {
  const wanted = `${year}-${month}-${day} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let matches = 0;
  for (let offsetMin = 420; offsetMin <= 660; offsetMin += 30) {
    if (seoulWallKey(wallAsUtc - offsetMin * 60_000) === wanted) matches += 1;
  }
  return matches;
}
