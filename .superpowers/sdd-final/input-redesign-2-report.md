# Input redesign round 2 — report

Branch: `feat/saju-site` (unchanged). Files touched: `app/page.tsx`, `components/input/InputForm.tsx`,
`components/ilju/IljuGallery.tsx`, `components/ilju/IljuVisual.tsx` (minimal `radius` prop, per item 7's
fallback allowance), `lib/input/form.ts`, `tests/input/form.test.ts`.

## 1. Time checkbox default and 출생지 behavior

- `lib/input/form.ts`: `EMPTY_FORM.timeKnown` changed `false → true`. The "시간을 몰라요" checkbox is now
  unchecked by default (time input shown by default).
- `components/input/InputForm.tsx`: when `timeKnown` is true (checkbox unchecked → time known), the time
  `<input type="time">`, the 출생지 `<select>`, and the 진태양시 note (`출생지 경도와 과거 서머타임을
  반영해 계산해요.`) are rendered inside `{timeEnabled && (...)}` — i.e. not rendered at all when time is
  unknown, not just disabled/dimmed. Verified in the browser: toggling the checkbox removes/restores these
  three nodes from the DOM (confirmed via `document.querySelector('input[type=time]')` before/after a real
  `.click()`).
- Added the rationale comment above the conditional block:
  ```
  // 출생지는 진태양시(출생지 경도) 보정에만 쓰인다. 시간을 모르면 시주를 계산하지 않으므로
  // 이 보정 자체가 필요 없어 출생지 값이 결과에 영향을 주지 않는다 — 그래서 시간 미상일 때는 숨긴다.
  ```
- `tests/input/form.test.ts`:
  - Renamed "시간 모름(기본)이면 time null" → "시간을 모르면 time null", now explicitly passing
    `timeKnown: false` (per the task's instruction), otherwise it would fail since `filled` now inherits
    `timeKnown: true` from the new `EMPTY_FORM` default.
  - Added a new test "기본값(시간 입력 유도)이면 time을 채워야 성공한다" that exercises `filled` un-modified
    (i.e. relying on the new default `timeKnown: true`) with a valid `time`, confirming the default-with-time
    path still succeeds.
  - **Necessary additional fix beyond the task's explicit instructions** (flagging as a deviation, not a
    silent change): two more existing tests build off `filled`/`EMPTY_FORM` without overriding `timeKnown`,
    and the new default broke them in ways the task didn't call out:
    - `"빈 값은 필드별 오류"` (uses raw `EMPTY_FORM`): with the new default, `EMPTY_FORM.time === ""` now
      also fails the time regex, so `errors.time` is legitimately populated alongside day/gender/month/year.
      Updated the expected key array from `["day","gender","month","year"]` to
      `["day","gender","month","time","year"]` — this is a strengthening (one more real assertion), not a
      weakening, and reflects genuinely new behavior of the changed default.
    - `"양력이면 윤달 체크를 무시한다"` and `"없는 날짜는 form 오류로 계산 엔진 메시지를 보여준다"` (both
      build off `filled` without overriding `timeKnown`): with the new default they were silently returning
      `r.ok === false` early (a time error before ever reaching the leap-month/engine-validation code path
      under test), while their assertions happened to still pass by coincidence (`r.ok && r.input.isLeapMonth`
      short-circuits to `false`, which equals the expected `false`) — i.e. these two tests would have kept
      "passing" while testing nothing. Added `timeKnown: false` to both and added an explicit
      `expect(r.ok).toBe(true)` to the leap-month test so a future regression can't silently vacuously pass
      again.
  - No existing assertion was weakened or removed; all changes either preserved or added coverage.

## 2. Checkbox placement + explanation placement

- The "시간을 몰라요" checkbox now sits on the same row as the "태어난 시간" label, right-aligned via
  `flex items-center justify-between` (the same row pattern used by 생년월일/양력·음력), so its right edge
  lines up with the radio groups' right edge.
- The explanation text moved below the time fields (a single `<p>` after the conditionally-rendered time
  block), switching copy by state:
  - unchecked (time known): `시간을 넣으면 시주까지 8글자로 더 자세히 풀이해요.`
  - checked (time unknown): `시간을 모르면 시주를 뺀 6글자로 풀이해요.`
  - style: `text-[12px] text-sub mt-2`.

## 3. Gender first, no helper text

- Row order in `InputFormFields` is now 성별 → 생년월일 → 태어난 시간 → submit.
- Removed the `대운 계산에 필요해요` helper `<span>` entirely from the 성별 row.

## 4. Header copy

- `app/page.tsx`: `h1` → `나와 닮은 자연을 찾아볼까요`, sub → `생년월일을 넣으시면 만세력으로 사주를
  계산해 드려요.` Eyebrow (`ILJU · 만세력`) and sizes (h1 `text-[24px] font-extrabold`, sub `text-[13px]`)
  unchanged. Verified in the browser the h1 renders on one line at 375px width.

## 5. Submit button

- `h-12 text-[16px]` → `h-11 text-[14px] font-bold`, kept `w-full` (added explicitly for clarity, though the
  flex-col parent already stretched it), `bg-ink text-white rounded-full`.

## 6. Shared `InlineRadioGroup`

- Replaced `RadioPair` with `InlineRadioGroup` (props: `label`, `name`, `value`, `options`, `onChange`, plus
  an optional `describedBy` retained to keep the existing `aria-describedby` wiring to `gender-error`). Same
  dot size (`h-3 w-3`), gap (`gap-1.5` dot↔label, `gap-4` between options), font size (`text-[13px]`), and
  selected/unselected treatment as before. Used identically for 성별 (여성/남성) and 생년월일's 양력/음력.
- Gave the group a fixed `w-[104px]` container with `justify-end` so both usages render pixel-identical
  widths (not just coincidentally similar from matching 2-character labels), guaranteeing the two rows'
  controls form one visual column. No leftover `RadioPair` remains.

## 7. Gallery card type and radius

- `components/ilju/IljuGallery.tsx`: hanja `text-[24px] → text-[20px]`.
- `components/ilju/IljuVisual.tsx`: added an optional `radius` prop (default `"20px"`), applied via inline
  `style={{ borderRadius: rounded ? radius : undefined }}` instead of the `rounded-[20px]` utility class, so
  a caller-supplied radius reliably overrides it regardless of Tailwind class-order specificity (the
  `className`-override approach from the task was tried first and found unreliable, so I used the sanctioned
  fallback: an optional `radius` prop). All other callers (`SummaryCardExport`, `ResultView`,
  `app/ilju/[id]/page.tsx`) are unaffected — they don't pass `radius`, so they keep the 20px default.
- Gallery now passes `radius="8px"`. Verified in the browser:
  `getComputedStyle(cardRoot).borderRadius === "8px"`.

## 8. Two-line symbol clipping investigation

Measured directly in the running dev server (Chrome DevTools Protocol via the browser tool), at true 375px
viewport width, fonts loaded (`document.fonts.ready` awaited):

- Card: width **162.5px**, height **216.66px** (matches the task's own 375−40−10)/2 and ×4/3 budget).
- Band (`TEXT_ZONE = 45%`): **97.49px**.
- `p-3` padding: 12px top/bottom (content-box height inside band: 73.49px).
- Hanja (`text-[20px] leading-none`): height **20px**.
- Symbol (`text-[11px] leading-snug`, `line-clamp-2`): computed `line-height` **15.125px**.

**Real data**: checked all 60 `ILJU_LIST` entries (max symbol length 18 chars) — none wrap to a second line
at 162.5px card width (available text width after padding: 138.5px); every symbol renders as a single
15.125px-tall line, bottom edge at 51.125px from the band top — 46.4px of headroom before the band's
`overflow-hidden` edge at 97.49px. No clipping occurs with the current dataset, before or after the hanja
size change.

**Synthetic worst case** (forced a 42-character string with no natural break, guaranteeing genuine two-line
wrap via `line-clamp-2`): rendered symbol box height **30.25px** (2 × 15.125), bottom edge at
**66.25px** from band top (hanja 20 + `mt-1` 4 + symbol 30.25 + `p-3` 12 top padding = 66.25). Band height
is 97.49px, giving **31.24px of headroom** — the second line is fully inside the visible band, not clipped.
This matches the task's own budget math almost exactly (~54.3px used of ~73.5px usable, restated here from
actual rendered pixels rather than assumption).

**Conclusion**: with the item-7 hanja reduction (24px → 20px, `leading-none`) already in place, there is no
clipping — neither with real data (single line always) nor with a forced two-line worst case. I did not find
a reproducible clipping bug in the current build to additionally patch; the band has substantial headroom
(≥31px) even in the worst case. I'm flagging this as verified-safe rather than a fix, since I could not
reproduce the described symptom despite deliberately forcing the adversarial case.

## Measurements (as required)

- **Input screen document height at 375×812, checkbox unchecked (default, time shown):**
  - Before (original layout, checkbox force-unchecked): **457.125px** (`<main>` bounding height)
  - After (new layout, default state = unchecked): **472.125px**
  - Both well under the 740px ceiling. The ~15px increase comes from the added description line under the
    time fields (new copy that didn't exist before) and reordered/regrouped rows; still far short of the
    budget.
- **Gallery card band usage:** band 97.49px; real-data symbol bottom at 51.125px (46.4px headroom); forced
  worst-case two-line symbol bottom at 66.25px (31.24px headroom). No clipping in either case.

## Verify

- `npm test`: **165 passed** (164 prior + 1 new default-with-time test), 27 test files, 0 failed.
- `npx tsc --noEmit`: clean, no output.
- `npm run lint`: clean (`eslint`, no errors/warnings printed).
- `npm run build`: succeeded (`next build` with Turbopack); only pre-existing unrelated warning about
  `lib/interpret/runClaude.ts` dynamic filesystem tracing (not touched by this change).

## Concerns

- Item 8 produced no code change — I verified there is no clipping rather than "fixing" something. If the
  original bug report came from a build with different data/typography than what's in this branch, it's
  possible it was already resolved by the item-7 hanja-size reduction alone; I could not reproduce it even
  when forcing an artificially long symbol string.
- Two existing tests (`양력이면 윤달 체크를 무시한다`, `없는 날짜는 form 오류로 계산 엔진 메시지를
  보여준다`) needed `timeKnown: false` added and one needed a new `expect(r.ok).toBe(true)` — this goes
  slightly beyond the task's explicit "update that [one] test" instruction, but was necessary: without it
  they would have kept "passing" for the wrong reason (vacuous short-circuit) after the `EMPTY_FORM` default
  changed, silently losing coverage. Flagging for visibility rather than silently doing it.
- The shared browser preview tab used for verification appeared to have a second, concurrent session
  attached to it (viewport/title changed underneath me mid-investigation); I opened an isolated background
  tab for all measurements to avoid contamination, and all reported numbers come from that isolated tab.
