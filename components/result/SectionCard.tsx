import { paragraphs, parseInline } from "@/lib/view/inline";

interface Props {
  index: number;
  title: string;
  body?: string;
  writing: boolean;
  waiting: boolean;
  accent: string;
}

export default function SectionCard({ index, title, body, writing, waiting, accent }: Props) {
  return (
    <li className="rounded-[20px] bg-soft p-4">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-extrabold tabular-nums" style={{ color: accent }}>
          {String(index).padStart(2, "0")}
        </span>
        <h4 className="text-[16px] font-bold">{title}</h4>
        {writing && <span className="ml-auto text-[12px] font-semibold text-sub">쓰는 중</span>}
      </div>
      {body ? (
        <div className="mt-2 flex flex-col gap-2.5 text-[15px] leading-[1.75]">
          {paragraphs(body).map((paragraph, i) => (
            <p key={i}>
              {parseInline(paragraph).map((segment, j) =>
                segment.bold ? (
                  <strong key={j} className="font-bold">
                    {segment.text}
                  </strong>
                ) : (
                  <span key={j}>{segment.text}</span>
                ),
              )}
            </p>
          ))}
        </div>
      ) : waiting ? (
        <div aria-hidden className="mt-3 flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded bg-[#e3e6eb]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[#e3e6eb]" />
        </div>
      ) : (
        <p className="mt-2 text-[14px] text-sub">아직 풀이가 없어요.</p>
      )}
    </li>
  );
}
