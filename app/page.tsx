import IljuCarousel from "@/components/input/IljuCarousel";
import InputForm from "@/components/input/InputForm";
import { CARD_PAPER } from "@/lib/ilju/palette";

/**
 * 결과 화면 히어로와 같은 뼈대: 위 텍스트 → 가운데 그래픽 → 아래에서 겹쳐 올라오는 흰 입력 시트.
 * 한 화면 안에 들어오도록 그래픽 높이가 남는 공간에 맞춰 늘고 준다(하단 탭 높이 제외).
 */
export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem-1px-env(safe-area-inset-bottom))] flex-col">
      <section className="flex min-h-0 flex-1 flex-col" style={{ background: CARD_PAPER }}>
        <div className="px-5 pt-8">
          <p className="text-[12px] font-bold tracking-[0.08em] text-sub">ILJU · 만세력</p>
          <h1 className="mt-2 text-[24px] font-extrabold leading-[1.25] tracking-[-0.03em]">나와 닮은 자연을 찾아볼까요</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-sub">생년월일을 넣으시면 만세력으로 사주를 계산해 드려요.</p>
        </div>
        {/* 그래픽 영역을 입력 시트가 겹쳐 올라오는 32px까지 늘려, 시트 둥근 모서리 뒤로도 그림이 이어지게 한다 */}
        <div className="flex min-h-[160px] flex-1 flex-col pt-10">
          <IljuCarousel className="min-h-0 flex-1" />
        </div>
      </section>
      <section aria-label="생년월일 입력" className="relative -mt-8 rounded-t-[28px] bg-white px-5 pb-6 pt-6">
        <InputForm />
      </section>
    </main>
  );
}
