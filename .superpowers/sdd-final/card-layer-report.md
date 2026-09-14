# 일주 카드 레이어 재구성 — 리포트

## 개요
카드 색(paper)을 코드(팔레트)로 완전히 분리하고, 먹 일러스트는 배경색 없는 투명 PNG로 만들어
카드 색 위에 얹는 구조로 바꿨다. `lib/ilju/branches.ts`(12색 paperColor/paperName)와
`scripts/generate-ilju-images.ts`(투명 PNG 저장)는 이미 배경 프로세스가 반영해 둔 상태였고,
이번 작업은 팔레트/컴포넌트/대비 검사 쪽을 그 모델에 맞춰 마무리했다.

## 레이어 구조 (`components/ilju/IljuVisual.tsx`)
루트 `div`(3:4, `overflow-hidden`) 안에 아래 순서로 쌓는다.

1. **평면 카드 색** — 루트 `div`의 `style.background = paperCss(ilju.palette)` (= `branch.paperColor`)
2. **한지 결 텍스처** — `<div className="paper-grain absolute inset-0" />` (아래 텍스처 항목 참고)
3. **먹 일러스트** — `<img src="/ilju/{id}.png">`, `absolute inset-0 object-cover`, 투명 PNG를 블렌드 모드 없이 그대로 얹음.
   하이드레이션 이전에는 `Motif`(대체 모티프, `artInk` 색)를 같은 자리에 렌더링하고, 이미지가
   `onLoad`되면 opacity 트랜지션으로 교체한다(기존 하이드레이션-세이프 로직 그대로 유지).
4. 그 위에 기존 텍스트 존 오버레이 컨테이너(`TEXT_ZONE`, 상단 45%) — 변경 없음.

## 텍스처 접근 방식 — 계획 변경 사항 (중요)
원래 지시는 `mix-blend-mode: multiply` + 낮은 불투명도의 `feTurbulence` 노이즈였다. 구현 후
`npm run build`에는 문제가 없었지만, 이 카드는 `lib/export/download.ts`(html-to-image의
`toPng`)로 **SVG `foreignObject` 경유 캡처**를 거친다. `mix-blend-mode`가 여러 브라우저의
`foreignObject` 래스터화 과정에서 깨지는 문제는 잘 알려져 있고, 이 세션에서는 실제 다운로드
흐름(입력 폼 → `/result` → PNG 저장)을 브라우저로 안정적으로 재현해 픽셀 단위로 검증할 수
없었다(자동화 도구의 네비게이션이 반복적으로 튕겨나가 재현 실패, 아래 concerns 참고).

**따라서 지시에 명시된 대로 안전한 대안으로 전환했다:** `mix-blend-mode`를 쓰지 않고, 노이즈
자체가 이미 "검정 + 가변 알파"이므로 블렌드 모드 없이 낮은 불투명도(0.13)로만 얹는 **일반
저투명도 오버레이**로 구현했다(`app/globals.css`의 `.paper-grain`). 이렇게 하면 브라우저·캡처
방식과 무관하게 항상 같은 픽셀이 나온다. 시각적으로는 곱연산보다 살짝 밝게 보이지만
0.10–0.16 지시 범위 안에서 미세하게 조정 가능한 수준의 차이다.

```css
.paper-grain {
  background-image: url("data:image/svg+xml,...feTurbulence baseFrequency='0.8' numOctaves='3'...feColorMatrix(luminance→alpha)...");
  background-size: 120px 120px;
  opacity: 0.13;
  pointer-events: none;
}
```

`npm run build`에서 CSS/타입 오류 없이 컴파일됐고, 개발 서버에서 `/ilju`, `/ilju/byeong-in`을
직접 렌더링해 카드 색 + 결 텍스처 + 먹 일러스트가 올바른 순서로 겹치는 것을 스크린샷으로 확인했다.

## 색 토큰 (`lib/ilju/palette.ts`)
```ts
export interface IljuPalette {
  paper: string;   // branch.paperColor
  ink: string;      // "#1F1A1A" — 카드 위 텍스트용. 가장 어두운 카드(#6E8EE0)에서도 4.5:1
  artInk: string;   // "#332A2A" — PNG 일러스트의 먹색과 맞춘 모티프 대체용
}
```
- `Motif.tsx`는 이제 `artInk`를 받아 그려서(`IljuVisual.tsx`에서 `ilju.palette.artInk` 전달)
  이미지가 없을 때의 대체 모티프가 실제 PNG의 먹색(#332A2A)과 시각적으로 맞는다.
- 사이트 전역 Tailwind 토큰 `--color-ink`(`app/globals.css`)도 `#1F1A1A`로 맞췄다. 이 토큰은
  히어로/도감 카드/상세 페이지/요약 내보내기 카드의 `text-ink` 클래스가 그대로 참조하는
  값이라 팔레트의 `ink`와 동일하게 유지해야 카드 위 텍스트가 실제로 4.5:1을 만족한다.
  같은 이유로 하드코딩돼 있던 `#16181d`(구 ink) 리터럴도 `#1F1A1A`로 맞췄다:
  `app/result/page.tsx`, `app/ilju/[id]/page.tsx`, `components/result/ResultView.tsx`,
  `components/result/SummaryCardExport.tsx`의 `bg-[#16181d]/N` 클래스들.
  `components/input/InputForm.tsx`의 체크박스 `accent-[#16181d]`는 입력 화면 범위 밖이라
  (텍스트 색 스왑이 아닌 폼 컨트롤 틴트) 건드리지 않았다.
- "원국 일주 셀"(`PillarGrid`), "대운 현재 항목"(`DaeunStrip`), "섹션 번호"(`SectionCard`)는
  여전히 `ilju.palette.ink`를 `accent`로 받아 배경/텍스트 색으로 쓴다 — 코드 변경 없이 팔레트
  값이 바뀌면서 자동으로 새 ink(#1F1A1A) 위 흰 글자로 갱신된다.

## 대비 검사
### `tests/ilju/palette-contrast.test.ts`
변경 없음 — 60개 엔트리 모두 `contrastRatio(ink, paper) >= 4.5` 를 그대로 검증한다.
**최소 대비: 5.41:1** (`sin-mi`, paper `#6E8EE0`) — 요구된 4.5:1보다 여유 있게 통과.

### `lib/ilju/imageContrast.ts` + `scripts/check-ilju-contrast.ts`
일러스트가 투명 PNG로 바뀌면서, 텍스트 존 검사도 "이미지 픽셀 그대로"가 아니라
**카드 색(paper) 위에 알파 합성한 뒤** 먹색과 대비를 재도록 바꿨다.

```ts
export function textZoneContrast(
  pixels: Uint8Array, width: number, height: number, channels: number, paper: string
): number
```
- `INK`를 `#1F1A1A`로 갱신.
- 채널이 4개(RGBA)면 `alpha = pixels[i+3]/255`, 아니면(3채널) 완전 불투명(1)으로 취급.
- `composited = mixRgb(paperRgb, pixelRgb, alpha)` (= over 합성, `paper + (pixel-paper)*alpha`)
- 임계값(4.5)과 출력 형식(✔/✘, 하위 2% 값)은 그대로.
- `scripts/check-ilju-contrast.ts`: `sharp(...).removeAlpha()`를 제거해 알파를 보존하고,
  `entry.palette.paper`를 새 파라미터로 넘기도록 수정.

`tests/ilju/imageContrast.test.ts`는 새 시그니처를 의미 있게 검증하도록 다시 작성:
완전 투명(카드 색 그대로 → 밝은 카드는 통과/어두운 카드는 실패), 완전 불투명 먹색(#332A2A,
먹색 텍스트와 비슷해 대비 낮음 → 실패), 중간 알파의 단조성(투명 > 반투명 > 불투명 순으로
대비 감소), 알파 채널 없는 3채널 입력(완전 불투명 취급) — 5개 케이스.

## 그 외 확인한 것 (opaque 일러스트/구 ink 가정 grep)
- `paperColor`, `.palette.ink`, `.palette.artInk`, `removeAlpha` 전체 grep으로 다른 잔재 없음 확인.
- `tests/ilju/color.test.ts`의 `#16181d` 라운드트립 테스트는 ink 토큰과 무관한 범용
  `hexToRgb`/`rgbToHex` 유틸 테스트라서 그대로 뒀다.
- saju 계산/해석/라우팅/입력 화면/다운로드 로직(`lib/export/download.ts`)은 손대지 않았다.

## 명령 실행 결과
- `npm test` → 27 files / **179 tests passed**
- `npx tsc --noEmit` → 오류 없음
- `npm run lint` → 오류 없음 (eslint 경고/에러 없음)
- `npm run build` → 성공. 기존에도 있던 무관한 경고(`lib/interpret/runClaude.ts`의 `child_process.spawn` 동적 파일시스템 접근 추적 경고, Claude CLI 프로세스 실행 관련) 외에는 문제 없음.

## 브라우저로 확인한 것
개발 서버(`npm run dev`, 이미 실행 중이던 걸 재사용)로 `/ilju`(도감 그리드, radius 8px)와
`/ilju/byeong-in`(상세 페이지, radius 20px)을 스크린샷으로 확인 — 카드 색이 코드에서 오고,
결 텍스처(`getComputedStyle`로 `.paper-grain`의 `background-image`/`opacity: 0.13` 적용 확인),
투명 PNG 먹 그림이 그 위에 올바른 순서로 겹치는 것을 확인했다.

## Concerns
1. **실제 PNG 내보내기(html-to-image) 픽셀 검증은 못 했다.** `/result` 페이지로 가는 입력 폼 →
   제출 → 다운로드 흐름을 이 세션의 브라우저 자동화로 재현하려 했으나, 네비게이션이 계속
   `/ilju` 도감 페이지로 튕겨나가 안정적으로 재현하지 못했다(자동화 툴링/타이밍 문제로 보이며
   앱 버그로 보이지는 않음). 이 리스크 때문에 위에서 설명한 대로 `mix-blend-mode`를 아예
   빼고 블렌드 모드 없는 저투명도 오버레이로 전환해 export 경로에 대한 리스크 자체를
   제거했다 — 실제 다운로드 PNG를 열어 픽셀로 재확인하는 건 남아 있는 일이다.
2. `public/ilju/` 아래 PNG들은 배경 프로세스가 계속 생성 중이라 건드리지 않았고,
   `npm run images:*`/Cloudflare/`claude` CLI도 호출하지 않았다. 전체 60개 중 12개만
   존재하는 상태에서 확인했다(나머지는 `Motif` 대체 렌더링으로 확인).
3. `--color-ink`(전역 Tailwind 토큰)를 `#1F1A1A`로 바꾸면서 카드 밖 일반 본문 텍스트 색도
   같이 살짝 바뀐다(`#16181d`→`#1F1A1A`, 둘 다 거의 검정이라 실사용상 체감 차이는 없음).
   이 토큰이 카드 위 텍스트(`text-ink`)와 사이트 전역 텍스트에 동시에 쓰이는 구조라
   분리하지 않는 한 불가피했다.
