import type { SajuResult } from "@/lib/saju/types";

export default function SeunCard({ seun }: { seun: SajuResult["seun"] }) {
  return (
    <section className="mt-4 rounded-[20px] bg-[#fbeee8] p-4">
      <h3 className="text-[13px] font-semibold text-[#8f3517]">{seun.year}년 올해의 기운</h3>
      <p className="mt-1 font-hanja text-[34px] font-black leading-none text-[#5e210d]">{seun.hanja}</p>
      <p className="mt-2 text-[13px] font-semibold text-[#8f3517]">
        {seun.korean}년 · 나에게 {seun.stemTenGod}·{seun.branchTenGod}
      </p>
    </section>
  );
}
