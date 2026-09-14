# 일주 비주얼 테마 전환 리포트 — 다크 그라디언트 → 한지 + 먹색

Branch: `feat/saju-site` (worked in place, no branch switch)

## Per-file changes

### `lib/ilju/palette.ts`
- `IljuPalette` is now `{ paper: string; ink: string }`. `paletteFor(stem, branch)` (signature kept, `stem` param now unused but retained for API stability) returns `{ paper: branch.paperColor, ink: "#16181d" }`.
- `gradientCss` removed; replaced by `paperCss(p)` which returns `p.paper`.
- `textZoneEdgeColor` and `GRADIENT_MID_STOP` deleted — no longer needed since the background is a flat color, not a gradient with a mid stop.

### `lib/ilju/scrim.ts`
- `TEXT_ZONE` (0.45), `SCRIM_ALPHA_AT_ZONE` (0.8), `SCRIM_END` (0.65), and `scrimAlphaAt` kept unchanged.
- `scrimCss(paperHex)` (renamed param from `topHex`) now fades the **paper** color from opaque at 0% to 0.8 at 45% to transparent at 65%, instead of fading a dark color. The generated CSS shape is identical (`linear-gradient(180deg, rgba(r,g,b,1) 0%, rgba(r,g,b,0.8) 45%, rgba(r,g,b,0) 65%)`), only the color being faded changed semantically (light wash over a photo instead of dark scrim).

### `tests/ilju/scrim.test.ts`
- Alpha/stop assertions (`scrimAlphaAt` at 0, TEXT_ZONE, 0.65, 0.9) kept as-is.
- CSS-string test updated to call `scrimCss("#E6D9BC")` (a real branch paper color, 오) and assert the corresponding `rgba(230,217,188,…)` gradient string.

### `tests/ilju/palette-contrast.test.ts`
- Rewritten to assert **ink-on-paper** contrast for all 60 entries: `contrastRatio(hexToRgb(entry.palette.ink), hexToRgb(entry.palette.paper)) >= 4.5`. Threshold and `it.each` shape unchanged. `textZoneEdgeColor` import removed (function deleted).

### `lib/ilju/imageContrast.ts`
- `textZoneContrast(pixels, width, height, channels, paperHex)` — parameter renamed from `topHex` to `paperHex`. Contrast is now computed between a fixed ink constant (`#16181d`) and the pixel color composited with the **paper** color (previously: `WHITE` vs pixel composited with the dark `top` color). `WHITE` import removed (no longer used here).

### `scripts/check-ilju-contrast.ts`
- Passes `entry.palette.paper` instead of `entry.palette.top` into `textZoneContrast`. Final success log message updated to "먹색 텍스트" (ink text) instead of "흰색 텍스트" (white text). Script was **not executed** (per instructions, only edited) — it still requires PNGs in `public/ilju/`, which are being written by the background image-generation process and were left untouched.

### `tests/ilju/imageContrast.test.ts`
- Real branch paper colors have very large contrast headroom against ink (~10.9–13.2:1, see below), so a 20%-pixel bleed-through (the minimum scrim opacity inside the text zone is 0.8) never drags a real branch below the 4.5 threshold in either direction. To meaningfully exercise the pass/fail inversion the task asked for, the test now uses a synthetic near-threshold gray paper (`#969696`, ink-vs-paper baseline ≈ 6.0:1) instead of a real branch's `paper`:
  - all-white pixel zone → passes (≈7.7:1)
  - solid-paper-gray pixel zone → passes (≈6.0:1)
  - all-black pixel zone → **fails** (≈4.0:1, inverse of the old dark-theme expectations)
  - This is a deliberate deviation from literally reusing a real branch's paper color (which would make the "fails" case impossible to demonstrate); the underlying function semantics (ink vs. paper composite) are unchanged and match the new production code exactly.

### `components/ilju/IljuVisual.tsx`
- Background now `paperCss(ilju.palette)` (flat color) instead of `gradientCss`.
- Motif fallback now called as `<Motif motif={ilju.motif} ink={ilju.palette.ink} />` (single ink color instead of `light`/`deep`).
- Scrim now built from `ilju.palette.paper` instead of `ilju.palette.top`.
- `<img>` overlay behavior, hydration guard, and the top `TEXT_ZONE`-height text container are unchanged.

### `components/ilju/Motif.tsx`
- `Motif({ motif, ink })` replaces `Motif({ motif, light, deep })`. Each shape's two former colors (`light`, `deep`) are now the same `ink` color at two opacities: main shapes get `ink + "D1"` (≈0.82 alpha), secondary/line shapes get `ink + "73"` (≈0.45 alpha), using 8-digit hex RGBA so existing per-shape `opacity` attributes still compound correctly. The base ground ellipse opacity was reduced from 0.5 to 0.2 (a solid ink wash at 0.5 read too heavy on light paper).

### `components/ilju/IljuGallery.tsx`
- Card overlay text: `text-white` → `text-ink`.
- "나" badge: was `bg-white … text-ink`; now `bg-ink … text-white` (kept as a solid high-contrast chip rather than a light-on-light outline, since it must stay legible over the flat paper background).

### `app/ilju/[id]/page.tsx`
- Detail overlay text: `text-white` → `text-ink`.
- Keyword chips: `bg-black/25` → `border border-ink/15 bg-[#16181d]/8` (subtle ink-tinted chip on light paper).

### `components/result/ResultView.tsx`
- `accent` now `ilju.palette.ink` (was `ilju.palette.top`) — feeds `PillarGrid`'s day-pillar cell and `DaeunStrip`'s current item, both of which use `accent` as a background with white text; using ink keeps those accents dark-on-white/high-contrast rather than putting white text on light paper color.
- Hero overlay text: `text-white` → `text-ink`; one-line AI summary given `text-ink/80` for hierarchy.
- Keyword chips: `bg-black/25` → `border border-ink/15 bg-[#16181d]/8`.

### `app/result/page.tsx`
- `InterpretationSections accent={ilju.palette.top}` → `accent={ilju.palette.ink}` (feeds `SectionCard`'s index number color).
- AI-summary loading skeleton: `bg-white/30` → `bg-[#16181d]/12` (visible on light paper instead of invisible).

### `components/result/SummaryCardExport.tsx`
- Overlay text: `text-white` → `text-ink`; keyword chips same treatment as above.
- Highlighted pillar cell background: `ilju.palette.top` → `ilju.palette.ink` (stays `bg-ink text-white`, high-contrast accent, not the light paper color).

### `components/result/PillarGrid.tsx`, `components/result/DaeunStrip.tsx`, `components/result/SectionCard.tsx`
- No changes needed — they already take a generic `accent` prop; fixing it at the call sites above (now passing `ilju.palette.ink`) was sufficient.

### `lib/ilju/branches.ts`, `lib/ilju/prompt.ts`, `tests/ilju/prompt.test.ts`
- These were already modified before this task started (part of the same broader hanji/ink migration: `paperColor` added to every branch, and `imagePrompt` rewritten to describe a woodblock/sumi-ink hanji illustration with the subject drawn in black ink and the background a flat hanji paper color). Left as found and included in this commit since they belong to the same visual-theme transition and were already passing their own tests.

## Grep verification
`grep -rn "palette\.\(top\|mid\|bottom\)\|gradientCss\|textZoneEdgeColor\|GRADIENT_MID_STOP\|bg-black/25\|bg-white/30"` across all `.ts`/`.tsx` files (excluding `node_modules`) returns **no matches** — all old references removed.

## Minimum ink-on-paper contrast (60 entries)
**10.939 : 1** at `eul-hae` (을해) — far above the 4.5:1 AA threshold. All 12 paper colors sit between roughly 10.9:1 and 13.2:1 against `#16181d`, matching the expectation that the hanji palette was chosen with a comfortable margin.

## Command outputs

### `npm test`
```
Test Files  27 passed (27)
     Tests  167 passed (167)
```

### `npx tsc --noEmit`
No output (clean).

### `npm run lint`
No output (clean, `eslint` exits 0).

### `npm run build`
```
✓ Compiled successfully in 9.1s
  Running TypeScript ...
  Finished TypeScript in 2.9s ...
✓ Generating static pages using 9 workers (66/66) in 2.9s
```
One pre-existing Turbopack warning about `child_process.spawn` in `lib/interpret/runClaude.ts` (dynamic filesystem tracing) — unrelated to this change, not touched.

## Concerns
- `tests/ilju/imageContrast.test.ts` intentionally uses a synthetic near-threshold paper color (`#969696`) rather than a real branch's `paper`, because every real branch paper color has enough contrast headroom (≥10.9:1) that a black text-zone image can never actually drop below 4.5:1 given the scrim's 0.8 minimum opacity. This is the most faithful way to satisfy the requested "white passes / black fails" inversion while keeping the assertions true; flagging in case the intent was instead to accept that real branches always pass regardless of image content (in which case this synthetic-fixture approach is more information than strictly necessary, but it does verify the function's directionality is correct).
- No visual/browser smoke test was run (out of scope per the given verify list: `npm test`, `tsc`, `lint`, `build`, all of which passed).
- `public/ilju/` was not touched, read, or referenced other than by path string; the background PNG-writing process was left undisturbed.
