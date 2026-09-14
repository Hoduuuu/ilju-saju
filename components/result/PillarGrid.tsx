import { pillarColumns } from "@/lib/view/pillars";
import type { SajuResult } from "@/lib/saju/types";

export default function PillarGrid({ result, accent }: { result: SajuResult; accent: string }) {
  const columns = pillarColumns(result);
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {columns.map((col) => (
          <div key={col.key}>
            <p className={`text-[12px] font-semibold ${col.highlight ? "text-ink" : "text-sub"}`}>{col.label}</p>
            {col.pillar ? (
              <div
                className={`mt-1.5 rounded-2xl py-3 ${col.highlight ? "text-white" : "bg-white text-ink"}`}
                style={col.highlight ? { background: accent } : undefined}
              >
                <p className="font-hanja text-[26px] font-bold leading-tight">{col.pillar.stemHanja}</p>
                <p className="font-hanja text-[26px] font-bold leading-tight">{col.pillar.branchHanja}</p>
                <p className={`mt-1.5 text-[11px] font-semibold ${col.highlight ? "text-white" : "text-sub"}`}>
                  {col.pillar.stemTenGod}·{col.pillar.branchTenGod}
                </p>
              </div>
            ) : (
              <div className="mt-1.5 rounded-2xl border border-dashed border-[#b9bfca] py-3 text-sub">
                <p className="text-[26px] font-bold leading-tight">?</p>
                <p className="text-[26px] font-bold leading-tight">?</p>
                <p className="mt-1.5 text-[11px] font-semibold">시간 모름</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer font-semibold text-sub">지장간 · 12운성 보기</summary>
        <table className="mt-2 w-full table-fixed text-center">
          <tbody>
            <tr>
              {columns.map((col) => (
                <td key={col.key} className="py-1 font-hanja">
                  {col.pillar ? col.pillar.hiddenStems.join(" ") : "-"}
                </td>
              ))}
            </tr>
            <tr>
              {columns.map((col) => (
                <td key={col.key} className="py-1 font-semibold">
                  {col.pillar ? col.pillar.twelveStage : "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  );
}
