import InputForm from "@/components/input/InputForm";

export default function HomePage() {
  return (
    <main className="px-5 pb-8 pt-8">
      <p className="text-[12px] font-bold tracking-[0.08em] text-sub">ILJU · 만세력</p>
      <h1 className="mt-2 text-[24px] font-extrabold leading-[1.25] tracking-[-0.03em]">언제 태어나셨어요?</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
        만세력으로 사주를 계산해서, 나와 닮은 자연 하나를 찾아드릴게요.
      </p>
      <InputForm />
    </main>
  );
}
