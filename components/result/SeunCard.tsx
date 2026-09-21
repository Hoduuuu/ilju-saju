import type { SajuResult } from "@/lib/saju/types";
import { TEN_GOD_YEAR_MEANING } from "@/lib/view/tenGods";


export default function SeunCard({ seun }: { seun: SajuResult["seun"] }) {
  const [stemHanja, branchHanja] = [...seun.hanja];
  const rows = [
    { hanja: stemHanja, tenGod: seun.stemTenGod },
    { hanja: branchHanja, tenGod: seun.branchTenGod },
  ];
  return (
    <section className="mt-4 rounded-[20px] bg-soft p-4">
      <h3 className="text-[13px] font-semibold text-sub">{seun.year}년 올해의 기운</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-sub">
        해마다 새로 들어오는 기운이에요. 내 사주와 만나 올 한 해의 흐름을 만들어요.
      </p>
      <p className="mt-3 font-hanja text-[34px] font-black leading-[1.2] text-ink">{seun.hanja}</p>
      <p className="mt-1 text-[13px] font-semibold text-ink">
        {seun.korean}년 · 나에게 {seun.stemTenGod}·{seun.branchTenGod}
      </p>
      <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
        {rows.map((row) => (
          <li key={row.hanja} className="flex gap-2 text-[13px] leading-relaxed text-ink">
            <span className="shrink-0 font-semibold">
              <span className="font-hanja">{row.hanja}</span> {row.tenGod}
            </span>
            <span>{TEN_GOD_YEAR_MEANING[row.tenGod]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
