# Layout density pass — 입력 화면 · 일주 도감

Branch: `feat/saju-site`

## A. Input screen (`app/page.tsx`, `components/input/InputForm.tsx`)

### A1 — `app/page.tsx` header
- Wrapper: `pt-12 pb-10` → `pt-8 pb-8` (kept `px-5`).
- Eyebrow "ILJU · 만세력": `text-[13px]` → `text-[12px]`.
- `h1`: `text-[28px]` → `text-[24px]`, kept `leading-[1.25] tracking-[-0.03em] font-extrabold` and the two-line break.
- Sub copy: `text-[15px]` → `text-[13px]`, `mt-2` → `mt-1.5`.

### A2 — `components/input/InputForm.tsx`
- Removed the two large "시간을 알아요 / 잘 몰라요" option cards and the `TIME_OPTIONS` constant.
- Replaced with: the existing legend (`태어난 시간`, unchanged `text-[14px] font-bold`), a compact helper line
  (`text-[12px] leading-relaxed text-sub`: "시간을 넣으면 시주까지 8글자로 더 자세히 풀이해요. 모르면 6글자로 풀이해요."),
  and the existing `Segmented` control (reused, no second implementation) with options
  `시간 알아요` / `잘 몰라요`, wired to `values.timeKnown` via `update("timeKnown", v === "known")`.
- Conditional 시간/출생지 block kept exactly as-is (still gated on `values.timeKnown`); wrapper `mt-3` → `mt-2`;
  helper line under it (`출생지 경도와...`) `text-[12px]` → `text-[11px]`.
- Form container `gap-5` → `gap-4`.
- Submit button unchanged: `h-12 text-[16px]`.
- No aria/role/name attributes, validation logic, or `lib/` files were touched.

### A3 — Verification result
Did not need the fallback reduction (`gap-4`→`gap-3.5`, labels `text-[14px]`→`text-[13px]`) — the first pass already
cleared the 740px budget with margin, so it was left as specified in A2.

**Before → after (input screen, 375×812, "잘 몰라요" selected / default state):**

| Metric | Before (given) | After (measured) |
|---|---|---|
| Document height | 1000px | **668px** |
| Submit button bottom (`y`) | 864px (below the fold) | **636px** (well inside the 740px usable area) |

Measurement method: real dev server (`next dev` on :3000) driven headlessly through the Browser pane at an
emulated 375×812 viewport; height read via `document.querySelector('main').getBoundingClientRect()` (main starts at
`top:0` and there is no sibling content below it, so `mainBottom` == true document content height) and cross-checked
against `document.documentElement.scrollHeight` / submit button `getBoundingClientRect().bottom`. Screenshot
confirmed the whole form, including the bottom tab bar, is visible without scrolling.

As a secondary check, the "시간 알아요" (time known) expanded state — showing the 시간/출생지 fields, not required by
the goal — was also confirmed to fit inside the 812px viewport without scrolling.

## B. 일주 도감 (`components/ilju/IljuGallery.tsx`)

- Eyebrow `text-[13px]` → `text-[12px]`.
- `h1` `text-[28px]` → `text-[22px]` (kept line break and weight).
- Wrapper `pt-12` → `pt-8`.
- Filter buttons: `h-10 px-4 text-[14px]` → `h-9 px-3.5 text-[13px]`; filter row `mt-6` → `mt-5`.
- Grid `mt-5 gap-3` → `mt-4 gap-2.5`.
- Card overlay: `p-3` unchanged; hanja `text-[28px]` → `text-[24px]`; symbol `text-[12px]` → `text-[11px]`;
  "나" badge `text-[11px]` → `text-[10px]`.
- `IljuVisual`, the 3:4 aspect ratio, the palette, and the detail page were not touched.
- Verified via screenshot at 375×812: 2-column grid and 3:4 card ratio preserved, type hierarchy still clear
  (eyebrow < body labels < hanja headline per card).

## Commands run

- `npm test` → **164/164 tests passed** (27 test files), no failures.
- `npx tsc --noEmit` → no output, no errors.
- `npm run lint` → clean (`eslint`, no warnings/errors printed).
- `npm run build` → succeeded ("Compiled successfully", all 66 static pages generated). One **pre-existing**
  Turbopack warning about `lib/interpret/runClaude.ts` dynamic `spawn(... process.env.CLAUDE_BIN ?? "claude" ...)`
  causing whole-project tracing — unrelated to this change, not modified, not introduced by this pass.

## Verification method note

A `next dev` server and a headless Browser pane were already available in this environment, so real measurement
was used instead of the px-summation fallback. The dev server was stopped after measurement
(`preview_stop`, confirmed via `pgrep -fl "next dev"` returning empty).

## Concerns

- None blocking. The only build-time warning present is pre-existing and unrelated to this change
  (`lib/interpret/runClaude.ts` filesystem/spawn tracing warning).
- Segmented's `label` prop is used both for `aria-label` and to derive the radio `name` (`segmented-${label}`);
  reusing `label="태어난 시간"` for the new control does not collide with any other radiogroup name on the page.
