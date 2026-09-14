import Link from "next/link";
import { notFound } from "next/navigation";
import IljuVisual from "@/components/ilju/IljuVisual";
import { ILJU_LIST, getIlju } from "@/lib/ilju/data";
import { ELEMENT_HANJA } from "@/lib/saju/ganji";
import { ELEMENT_NAMES } from "@/lib/view/elements";

export function generateStaticParams() {
  return ILJU_LIST.map((entry) => ({ id: entry.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getIlju(id);
  return { title: entry ? `${entry.korean}일주 · ${entry.symbol}` : "일주 도감" };
}

export default async function IljuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getIlju(id);
  if (!entry) notFound();

  const prev = ILJU_LIST[(entry.order + 59) % 60];
  const next = ILJU_LIST[(entry.order + 1) % 60];

  return (
    <main className="px-5 pb-10 pt-4">
      <Link href="/ilju" className="inline-flex h-11 items-center text-[14px] font-semibold text-sub">
        ← 도감으로
      </Link>

      <IljuVisual ilju={entry} className="mt-1">
        <div className="flex h-full flex-col px-6 pt-6 text-white">
          <ul className="flex flex-wrap gap-1.5">
            {entry.keywords.map((keyword) => (
              <li key={keyword} className="rounded-full bg-black/25 px-3 py-1 text-[12px] font-semibold">
                #{keyword}
              </li>
            ))}
          </ul>
          <h1 className="mt-3">
            <span aria-hidden className="block font-hanja text-[clamp(52px,17vw,64px)] font-black leading-none tracking-[-0.04em]">
              {entry.hanja}
            </span>
            <span className="mt-3 block text-[20px] font-bold">{entry.korean}일주</span>
          </h1>
          <p className="mt-1 text-[15px] font-medium">{entry.symbol}</p>
        </div>
      </IljuVisual>

      <p className="mt-6 text-[16px] leading-[1.75]">{entry.description}</p>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-line rounded-[20px] bg-soft py-4 text-center">
        <div>
          <dt className="text-[12px] font-semibold text-sub">오행</dt>
          <dd className="mt-1 text-[15px] font-bold">
            <span className="font-hanja">{ELEMENT_HANJA[entry.element]}</span> {ELEMENT_NAMES[entry.element]}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] font-semibold text-sub">계절</dt>
          <dd className="mt-1 text-[15px] font-bold">{entry.season}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-semibold text-sub">음양</dt>
          <dd className="mt-1 text-[15px] font-bold">{entry.yinYang}</dd>
        </div>
      </dl>

      <nav aria-label="다른 일주" className="mt-8 grid grid-cols-2 gap-3">
        {[
          { label: "이전", item: prev },
          { label: "다음", item: next },
        ].map(({ label, item }) => (
          <Link key={label} href={`/ilju/${item.id}`} className="rounded-2xl border border-line px-4 py-3">
            <span className="block text-[12px] font-semibold text-sub">{label}</span>
            <span className="mt-0.5 block text-[15px] font-bold">
              <span className="font-hanja">{item.hanja}</span> {item.korean}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
