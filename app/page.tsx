import InputForm from "@/components/input/InputForm";

export default function HomePage() {
  return (
    <main className="px-5 pb-8 pt-8">
      <p className="text-[12px] font-bold tracking-[0.08em] text-sub">ILJU · 만세력</p>
      <h1 className="mt-2 text-[24px] font-extrabold leading-[1.25] tracking-[-0.03em]">
        태어난 날을
        <br />
        알려주세요
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">만세력으로 사주를 계산하고, 나와 닮은 자연을 찾아드려요.</p>
      <InputForm />
    </main>
  );
}
