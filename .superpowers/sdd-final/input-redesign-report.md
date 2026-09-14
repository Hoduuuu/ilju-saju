# Input screen redesign — report

## Scope
Files changed (only these two, as instructed):
- `app/page.tsx`
- `components/input/InputForm.tsx`

## What changed

### `app/page.tsx`
- `h1` copy changed from "태어난 날을 알려주세요" to `언제 태어나셨어요?` (single line, 24px/extrabold/leading-[1.25]/tracking-[-0.03em] kept).
- Sub copy changed to `만세력으로 사주를 계산해서, 나와 닮은 자연 하나를 찾아드릴게요.` (13px, mt-1.5, text-sub kept).
- Eyebrow `ILJU · 만세력` unchanged.

### `components/input/InputForm.tsx`
- Reordered sections by priority: 생년월일 (biggest) → 태어난 시간 → 성별 (smallest) → submit. Previously the order was 달력 → 생년월일 → 성별 → 태어난 시간.
- Replaced the boxed `inputClass` with an underline style:
  `h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-1 text-[17px] font-semibold text-ink outline-none transition focus:border-ink disabled:text-sub`.
- Deleted the `Segmented` full-width segmented-control component (nothing else in the repo used it — verified with a repo-wide grep before removing) and replaced its three usages with a new inline `RadioPair` component:
  - Native `<input type="radio" className="peer sr-only">` inside `<label>`, grouped by a shared `name`, wrapped in `role="radiogroup" aria-label=...`.
  - A 12px round dot indicator (`bg-ink` + ring when selected, `border border-line` when not) plus the option text (`text-ink font-semibold` selected / `text-sub` unselected).
  - A `peer-focus-visible:outline` ring on the wrapping span for visible keyboard focus.
  - Used for 달력 (양력/음력, inline next to the `생년월일` label) and 성별 (여성/남성, inline next to the `성별` label + `대운 계산에 필요해요` hint).
- 생년월일 section: label row (`생년월일` left, 양력/음력 `RadioPair` right) → date grid (`grid-cols-[1.4fr_1fr_1fr] gap-2`, underline inputs, unit suffix as 12px muted span) → date error → conditional `윤달이에요` checkbox (only when `calendar === "lunar"`).
- 태어난 시간 section: label `태어난 시간` alone on its row (no chip, no paragraph above) → two underline fields side by side (`grid-cols-2 gap-2`: `<input type="time">` and 출생지 `<select appearance-none>` with a muted `▾` chevron) → time error → one wrapping row (`flex flex-wrap items-center gap-2`) containing the inverted `시간을 몰라요` checkbox and the muted 12px explanation `시간을 넣으면 시주까지 더 자세히 풀이해요` → 진태양시 note (11px, `text-sub`, one line) shown only while `timeKnown` is true.
  - `timeKnown` is still the same boolean in `FormValues`/`lib/input/form.ts` (untouched); the UI simply inverts it: `checked={!timeKnown}` and `onChange={(e) => update("timeKnown", !e.target.checked)}`.
  - Both the time input and the place select get `disabled={!timeKnown}` and `opacity-45` when the checkbox is checked (time unknown), matching the boxed `disabled:text-sub` treatment already on `inputClass`.
- 성별 section: label row (`성별` + 11px muted `대운 계산에 필요해요` on the left, 여성/남성 `RadioPair` on the right) → gender error.
- Submit button unchanged in style/label (`h-12 rounded-full bg-ink text-[16px] font-bold text-white`, `내 일주 보기`).
- Validation, `aria-invalid`/`aria-describedby` wiring, the form-level `role="alert"` error, and the submit flow (`clearSaju()` → `saveInput()` → `router.push("/result")`) are all unchanged — only `formToInput`/`inputToForm`/`FormValues` from `lib/input/form.ts` are consumed, and that file was not touched.

## Height measurement (375×812, dev server on :3000, reused — not started by this session)

Measured via `main.getBoundingClientRect().bottom` in the browser (the fixed bottom `TabBar` is `position: fixed`, so it does not contribute to document/content height; per the task's own baseline check this is the correct measure of "total document height").

| State | Height |
|---|---|
| Before (original layout, 시간 모름 selected by default) | 668.1px |
| **After, 시간 모름 unchecked (fields visible, as required by the spec)** | **477.6px** (form bottom: 445.6px) |

Both before and after are well under the 740px ceiling; the after-redesign layout is ~190px shorter than before even with the extra inline explanatory copy, because the underline fields and inline radio pairs are much more compact than the old full-width segmented controls and boxed inputs.

## Verification commands run

- `npm test` → `Test Files 27 passed (27)`, `Tests 164 passed (164)`.
- `npx tsc --noEmit` → no output (clean).
- `npm run lint` → `> ilju-saju@0.1.0 lint` / `> eslint` with no errors reported.
- `npm run build` → `✓ Compiled successfully`, all 66 static/SSG pages generated. One pre-existing Turbopack warning about `lib/interpret/runClaude.ts` (`Dynamic filesystem access...`, unrelated to this change, not in a file I touched).

Manual browser verification at 375×812 (existing dev server on :3000, reused per instructions):
- Default state screenshot: 양력 selected, 시간을 몰라요 checked, fields dimmed — no scroll, fits above the fixed tab bar.
- 시간 모름 unchecked: time/place fields enabled (not dimmed), 진태양시 note visible, still fits (477.6px).
- 음력 selected: `윤달이에요` checkbox row appears, radio dot flips correctly (양력 hollow / 음력 filled+bold).
- Submit with empty required fields: 태어난 해 / 태어난 시간 / 성별 error messages render inline as before, still no scroll.
- Keyboard: tabbed through the form — order is 양력/음력 radios → year/month/day → (윤달 checkbox if lunar) → time → place select → 시간 몰라요 checkbox → 여성/남성 radios → submit. Programmatically focusing the 양력 radio confirmed the `peer-focus-visible:outline` ring renders visibly around the dot+label.

## Concerns

- None blocking. Minor note: the `진태양시` note and the `시간을 몰라요` explanation are both muted 11–12px text stacked close together when time is enabled; at 375px width this still fits on one/two lines without wrapping awkwardly, but it's the densest part of the new layout.
- No component-level render test exists for `InputForm.tsx` (only `lib/input/form.ts` logic tests and `tests/interpret/route.test.ts`), so this DOM restructuring had no test coverage to break beyond the 164 existing tests, which all still pass unchanged.
