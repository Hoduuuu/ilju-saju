import type { EarthlyBranch } from "manseryeok";
import { markerMarkup } from "@/lib/ilju/motifs";

/**
 * 비주얼 맨 윗줄: 왼쪽 키워드 칩, 오른쪽 일지 마커.
 * - 마커는 칩과 같은 높이(24px)로 칩 줄 가운데에 맞춘다.
 * - 칩과 마커 사이는 48px 이상 비우고, 한 줄에 다 들어가는 칩만 보여 준다(넘치는 칩은 줄바꿈된 뒤 잘려 숨는다).
 */
export default function KeywordRow({ keywords, branch }: { keywords: string[]; branch: EarthlyBranch }) {
  return (
    <div className="flex shrink-0 items-center gap-12">
      <ul className="flex h-6 min-w-0 flex-1 flex-wrap gap-1.5 overflow-hidden">
        {keywords.map((keyword) => (
          <li key={keyword} className="flex h-6 items-center rounded-[var(--radius-control)] bg-[#1F1A1A]/8 px-2.5 text-[12px] font-semibold">
            #{keyword}
          </li>
        ))}
      </ul>
      <svg aria-hidden viewBox="-17 -17 34 34" className="h-6 w-6 shrink-0" dangerouslySetInnerHTML={{ __html: markerMarkup(branch) }} />
    </div>
  );
}
