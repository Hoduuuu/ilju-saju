import InputForm from "@/components/input/InputForm";

export default function HomePage() {
  return (
    <main className="px-5 pb-8 pt-8">
      <p className="text-[12px] font-bold tracking-[0.08em] text-sub">ILJU · 만세력</p>
      <h1 className="mt-2 text-[24px] font-extrabold leading-[1.25] tracking-[-0.03em]">나와 닮은 자연을 찾아볼까요</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
        생년월일을 넣으시면 만세력으로 사주를 계산해 드려요.
      </p>
      <InputForm />
    </main>
  );
}
