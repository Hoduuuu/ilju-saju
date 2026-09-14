import SectionCard from "./SectionCard";
import { SECTION_TITLES, bodySectionIds, currentSectionId, type Sections } from "@/lib/interpret/sections";
import type { InterpretState } from "@/lib/interpret/state";

interface Props {
  state: InterpretState;
  sections: Sections;
  timeKnown: boolean;
  accent: string;
  onRetry: () => void;
}

const STATUS_LABEL: Record<InterpretState["status"], string> = {
  idle: "",
  streaming: "풀이를 쓰는 중…",
  done: "풀이 완료",
  error: "",
};

export default function InterpretationSections({ state, sections, timeKnown, accent, onRetry }: Props) {
  const ids = bodySectionIds(timeKnown);
  const activeId = state.status === "streaming" ? currentSectionId(sections, ids) : null;
  const streaming = state.status === "streaming";

  return (
    <section aria-labelledby="interpretation-title" className="mt-8">
      <div className="flex items-baseline justify-between">
        <h3 id="interpretation-title" className="text-[18px] font-extrabold tracking-[-0.02em]">
          AI 풀이
        </h3>
        <p aria-live="polite" className="text-[13px] font-medium text-sub">
          {STATUS_LABEL[state.status]}
        </p>
      </div>

      {state.error && (
        <div role="alert" className="mt-3 rounded-xl bg-[#fdecea] px-4 py-3 text-[14px] font-medium text-[#9f2a24]">
          <p>{state.error.message}</p>
          <button type="button" data-export-ignore="true" onClick={onRetry} className="mt-2 h-9 rounded-full bg-white px-4 text-[14px] font-bold text-[#9f2a24]">
            다시 시도
          </button>
        </div>
      )}

      <ol className="mt-3 flex flex-col gap-3">
        {ids.map((id, i) => (
          <SectionCard
            key={id}
            index={i + 1}
            title={SECTION_TITLES[id]}
            body={sections[id]}
            writing={activeId === id}
            waiting={streaming && !sections[id]}
            accent={accent}
          />
        ))}
        {sections.extra && <SectionCard index={ids.length + 1} title="추가 풀이" body={sections.extra} writing={false} waiting={false} accent={accent} />}
      </ol>
    </section>
  );
}
