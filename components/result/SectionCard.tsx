import { paragraphs, parseInline } from "@/lib/view/inline";

interface Props {
  index: number;
  title: string;
  body?: string;
  writing: boolean;
  waiting: boolean;
  accent: string;
  /** 처음에 펼쳐 둘지. 첫 항목만 펼치고 나머지는 눌러서 연다 */
  defaultOpen?: boolean;
}

/** 풀이 한 항목. 제목 줄을 누르면 펼치고 접는 드롭다운(<details>)이다 */
export default function SectionCard({ index, title, body, writing, waiting, accent, defaultOpen = false }: Props) {
  const status = writing ? "쓰는 중" : waiting ? "준비 중" : "";
  return (
    <li>
      <details open={defaultOpen} className="group rounded-[var(--radius-card)] bg-soft">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[var(--radius-card)] p-4 transition hover:bg-chip-hover/40 [&::-webkit-details-marker]:hidden">
          <span className="text-[13px] font-extrabold tabular-nums" style={{ color: accent }}>
            {String(index).padStart(2, "0")}
          </span>
          <h4 className="text-[16px] font-bold">{title}</h4>
          {status && <span className="ml-auto text-[12px] font-semibold text-sub">{status}</span>}
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className={`h-4 w-4 shrink-0 text-sub transition-transform group-open:rotate-180 ${status ? "" : "ml-auto"}`}
          >
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="px-4 pb-4">
          {body ? (
            <div className="flex flex-col gap-2.5 text-[15px] leading-[1.75]">
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
            <div aria-hidden className="flex flex-col gap-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#e3e6eb]" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-[#e3e6eb]" />
            </div>
          ) : (
            <p className="text-[14px] text-sub">아직 풀이가 없어요.</p>
          )}
        </div>
      </details>
    </li>
  );
}
