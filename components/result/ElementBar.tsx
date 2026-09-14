import type { FiveElement } from "manseryeok";
import { elementSegments, elementSummary } from "@/lib/view/elements";

export default function ElementBar({ counts }: { counts: Record<FiveElement, number> }) {
  const segments = elementSegments(counts);
  return (
    <div>
      <div role="img" aria-label={segments.map((s) => `${s.name} ${s.count}개`).join(", ")} className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {segments
          .filter((s) => s.count > 0)
          .map((s) => (
            <div key={s.element} style={{ flexGrow: s.count, background: s.color }} />
          ))}
      </div>
      <ul aria-hidden className="mt-2 grid grid-cols-5 text-center text-[12px] font-semibold text-sub">
        {segments.map((s) => (
          <li key={s.element}>
            <span className="font-hanja">{s.hanja}</span> {s.count}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[15px] font-bold">{elementSummary(counts)}</p>
    </div>
  );
}
