import type { EarthlyBranch } from "manseryeok";
import type { Motif } from "./stems";

/**
 * 일주 일러스트를 코드로 그린다(SVG 문자열).
 * - 모양: 일간 상징(10종)이 정한다.
 * - 색: 상징이 색 계열(hue)을 정하고, 일지(계절·시간대)가 채도·명도를 조절한다.
 * - 배치: 위쪽 45%는 글자 영역이라 비워 두고, 미들 센터(좌우 20% 여백) / 미들 우측 / 하단 전체로만 놓는다.
 * 좌표계는 380×506(도감 카드 190×253의 2배)이다.
 */
export const VIEW_W = 380;
export const VIEW_H = 506;

/** 그림이 차지하는 영역(카드 좌표). 텍스트 영역 없이 그림만 보여 줄 때 쓴다 */
export const ART_TOP = 228;

/** 카드 가운데에 홀로 떠 있는 상징. 아래가 가려지면 모양이 잘려 보인다 */
export const SINGLE_MOTIFS: ReadonlySet<Motif> = new Set(["sun", "lamp", "gem"]);

/** 화면 폭을 꽉 채우는 가로 띠 그림. 잘라 보여 줄 때는 폭을 채우고(slice), 나머지는 전체가 보이게(meet) 맞춘다 */
export const HORIZONTAL_BAND_MOTIFS: ReadonlySet<Motif> = new Set(["mountain", "field", "rock", "sea", "rain"]);


interface Hsl { h: number; s: number; l: number }
interface Modulation { sm: number; lm: number }

const STEM_COLOR: Record<Motif, Hsl> = {
  tree: { h: 142, s: 62, l: 38 },
  flower: { h: 340, s: 78, l: 60 },
  sun: { h: 14, s: 88, l: 54 },
  lamp: { h: 30, s: 92, l: 56 },
  mountain: { h: 168, s: 26, l: 30 },
  field: { h: 88, s: 52, l: 44 },
  rock: { h: 205, s: 20, l: 44 },
  gem: { h: 197, s: 64, l: 67 },
  sea: { h: 200, s: 70, l: 44 },
  rain: { h: 196, s: 72, l: 50 },
};

/** 일지별 채도(sm)·명도(lm) 배율. 밤·겨울은 어둡고, 한낮·여름은 선명하다 */
export const BRANCH_MODULATION: Record<EarthlyBranch, Modulation> = {
  자: { sm: 0.95, lm: 0.72 }, 축: { sm: 0.62, lm: 1.22 }, 인: { sm: 0.8, lm: 1.1 },
  묘: { sm: 1.05, lm: 1.02 }, 진: { sm: 0.85, lm: 0.92 }, 사: { sm: 1.0, lm: 1.12 },
  오: { sm: 1.15, lm: 1.0 }, 미: { sm: 1.05, lm: 0.9 }, 신: { sm: 0.88, lm: 1.05 },
  유: { sm: 1.05, lm: 0.86 }, 술: { sm: 0.92, lm: 0.78 }, 해: { sm: 0.88, lm: 0.68 },
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const hsl = (h: number, s: number, l: number) => `hsl(${h} ${clamp(s).toFixed(1)}% ${clamp(l).toFixed(1)}%)`;

type Tone = (dl?: number, ds?: number, dh?: number) => string;
/** 상징 기본색에 일지 변주를 입힌다. dl/ds/dh는 같은 계열 안에서 톤을 나눌 때 쓴다 */
/** 일지 변주 없이 상징 기본색 그대로 그릴 때 */
const NO_MODULATION: Modulation = { sm: 1, lm: 1 };
const modulationOf = (branch: EarthlyBranch | null) => (branch ? BRANCH_MODULATION[branch] : NO_MODULATION);

function toneFor(motif: Motif, branch: EarthlyBranch | null): Tone {
  const c = STEM_COLOR[motif];
  const b = modulationOf(branch);
  // 밝은 상징(보석 등)이 밝은 일지(축·사)를 만나 배경에 묻히지 않도록 기준 명도를 70으로 막는다
  const base = Math.min(c.l * b.lm, 70);
  return (dl = 0, ds = 0, dh = 0) => hsl(c.h + dh, c.s * b.sm + ds, base + dl);
}
/** 상징 계열 밖의 보조색(줄기·흙 등)에도 같은 일지 변주를 적용한다 */
function modFor(branch: EarthlyBranch | null) {
  const b = modulationOf(branch);
  return (h: number, s: number, l: number) => hsl(h, s * b.sm, l * b.lm);
}

const circles = (list: number[][], fill: string) =>
  list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join("");
const stroke = (d: string, color: string, width: number) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;

/**
 * 가로 띠 그림은 카드(0~380) 밖 좌우(-410~790)까지 이어 그린다.
 * 카드에서는 밖이 잘려 보이지 않고, 입력 화면처럼 폭이 넓은 곳에서는 확대 없이 화면 폭을 채운다.
 */
export const BAND_EXTENT = { left: -410, right: 790 };
/**
 * 가로 띠의 바닥은 카드 아래(506)보다 더 내려 그린다. 카드에서는 잘려 보이지 않고,
 * 입력 화면에서는 이 여분이 겹쳐 올라오는 입력 시트 뒤로 들어가 그림 자체는 가려지지 않는다.
 */
const BAND_FLOOR = 600;

/** 카드 구간 곡선(0,y0)→(380,y1)의 좌우에 매끄럽게 이어지는 곡선을 붙인 띠 모양 */
function wave(y0: number, c1y: number, c2y: number, y1: number): string {
  const { left: L, right: R } = BAND_EXTENT;
  return `M${L},${BAND_FLOOR} L${L},${y1} L-380,${y1} C-285,${c1y} -95,${2 * y0 - c1y} 0,${y0} `
    + `C95,${c1y} 285,${c2y} 380,${y1} C475,${2 * y1 - c2y} 665,${c2y} 760,${y0} L${R},${y0} L${R},${BAND_FLOOR} Z`;
}

interface Ctx { tone: Tone; mod: ReturnType<typeof modFor>; id: (name: string) => string }

const DRAW: Record<Motif, (c: Ctx) => string> = {
  // 미들 우측: 모양이 다른 나무 세 그루가 겹친다(초록 3톤 + 줄기)
  tree: ({ tone, mod }) => {
    const deep = tone(-8, -16), mid = tone(4, -12, -28), light = tone(16, -20, -44), bark = mod(24, 34, 34);
    return `
      <rect x="244" y="440" width="14" height="70" fill="${bark}"/>
      <path d="M251,234 C286,264 300,340 298,400 C297,430 276,448 251,448 C226,448 205,430 204,400 C202,340 216,264 251,234 Z" fill="${deep}"/>
      ${stroke("M251,262 L251,440", light, 3.5)}
      <rect x="316" y="460" width="12" height="50" fill="${bark}"/>
      <path d="M322,290 C348,322 360,390 356,436 C354,460 340,472 322,472 C304,472 290,460 288,436 C284,390 296,322 322,290 Z" fill="${mid}"/>
      ${stroke("M322,312 L322,466", deep, 3.5)}
      <rect x="180" y="450" width="16" height="60" fill="${bark}"/>
      ${circles([[160, 418, 36], [216, 418, 36], [188, 388, 40], [188, 440, 34]], light)}`;
  },

  // 미들 센터~우측: 엇갈려 올라가는 줄기 끝에 네 잎 꽃
  flower: ({ tone, mod }) => {
    const stem = mod(132, 42, 40), stemDark = mod(138, 46, 29), petal = tone(12), core = tone(-18);
    const stems = [
      [140, 108, 336, 1], [162, 140, 292, 0], [186, 178, 262, 1], [210, 214, 310, 0],
      [232, 240, 270, 1], [252, 274, 300, 0], [274, 306, 268, 1], [296, 332, 322, 0],
      [174, 156, 368, 0], [244, 262, 348, 1], [312, 352, 296, 0], [128, 96, 300, 0],
      [220, 196, 352, 1], [288, 300, 350, 0],
    ];
    const blossom = (cx: number, cy: number) => {
      const r = 17, d = r * 0.62;
      return circles([[cx, cy - d, r], [cx + d, cy, r], [cx, cy + d, r], [cx - d, cy, r]], petal)
        + `<rect x="${cx - 3.6}" y="${cy - 3.6}" width="7.2" height="7.2" fill="${core}"/>`;
    };
    return stems.map(([bx, fx, fy, dark]) =>
      stroke(`M${bx},506 C${bx},${506 - (506 - fy) * 0.42} ${fx},${fy + (506 - fy) * 0.52} ${fx},${fy}`, dark ? stemDark : stem, 12)).join("")
      + stems.map(([, fx, fy]) => blossom(fx, fy)).join("");
  },

  // 미들 센터: 큰 원 + 아래 가는 수평선
  sun: ({ tone }) => {
    const c = tone();
    return `<circle cx="190" cy="348" r="104" fill="${c}"/><rect x="100" y="474" width="180" height="7" rx="3.5" fill="${c}"/>`;
  },

  // 미들 센터: 세 겹 촛불 불꽃 + 심지
  lamp: ({ tone }) => {
    const flame = (tip: number, w: number, base: number) => {
      const a = tip + (base - tip) * 0.46, b = base - (base - tip) * 0.16;
      return `M190,${tip} C${190 + w},${a} ${190 + w},${b} 190,${base} C${190 - w},${b} ${190 - w},${a} 190,${tip} Z`;
    };
    return `<path d="${flame(238, 78, 436)}" fill="${tone(17, -14)}"/>
      <path d="${flame(292, 50, 438)}" fill="${tone()}"/>
      <path d="${flame(354, 25, 440)}" fill="${tone(14, 0, 14)}"/>
      <rect x="185" y="434" width="10" height="36" rx="4" fill="${tone(-30, -40)}"/>`;
  },

  // 하단 전체: 두 겹 먼 산 능선
  mountain: ({ tone }) => `
    <path d="M-410,${BAND_FLOOR} L-410,368 C-330,356 -150,400 -90,396 C-50,394 -30,394 0,392 C40,388 70,330 112,318 C152,306 176,352 216,340 C256,328 286,288 330,296 C354,300 370,320 380,326 C390,332 440,360 500,356 C580,350 640,318 700,322 C740,325 770,338 790,342 L790,${BAND_FLOOR} Z" fill="${tone(12, -6)}"/>
    <path d="M-410,${BAND_FLOOR} L-410,432 C-300,424 -60,456 0,452 C50,448 90,404 142,412 C192,420 216,452 266,446 C310,441 346,418 380,424 C414,430 480,452 560,446 C640,440 700,420 790,428 L790,${BAND_FLOOR} Z" fill="${tone(-6)}"/>`,

  // 하단 전체: 비스듬한 초록 논 / 누런 밭(사선 결) / 흙
  field: ({ mod, id }) => {
    const band = (key: string, yL: number, yR: number, fill: string, line?: string, gap = 0, w = 0) => {
      // 카드 구간(-10~390)의 기울기를 좌우로 그대로 늘인다
      const { left: L, right: R } = BAND_EXTENT;
      const edge = (x: number) => yL + ((yR - yL) / 400) * (x + 10);
      const shape = `M${L},${BAND_FLOOR} L${L},${edge(L)} L${R},${edge(R)} L${R},${BAND_FLOOR} Z`;
      let rows = "";
      if (line) for (let k = 1; k * gap < 320; k += 1) {
        rows += `<line x1="${L}" y1="${edge(L) + k * gap}" x2="${R}" y2="${edge(R) + k * gap}" stroke="${line}" stroke-width="${w}"/>`;
      }
      return `<clipPath id="${id(key)}"><path d="${shape}"/></clipPath>
        <path d="${shape}" fill="${fill}"/><g clip-path="url(#${id(key)})">${rows}</g>`;
    };
    return band("fa", 336, 372, mod(90, 50, 40))
      + band("fb", 392, 422, mod(44, 80, 57), mod(30, 84, 48), 19, 7)
      + band("fc", 468, 482, mod(26, 46, 35));
  },

  // 하단 전체: 좌우를 꽉 채우는 각진 바위 세 덩어리
  rock: ({ tone }) => `
    <path d="M-420,${BAND_FLOOR} L-420,506 L-404,420 L-330,376 L-240,392 L-186,350 L-104,374 L-30,424 L-24,506 L-24,${BAND_FLOOR} Z" fill="${tone(-9)}"/>
    <path d="M150,${BAND_FLOOR} L150,506 L172,366 L246,330 L330,364 L404,432 L404,${BAND_FLOOR} Z" fill="${tone(-9)}"/>
    <path d="M380,${BAND_FLOOR} L380,506 L396,440 L470,382 L560,398 L622,352 L704,388 L800,436 L800,${BAND_FLOOR} Z" fill="${tone()}"/>
    <path d="M-24,${BAND_FLOOR} L-24,506 L-16,412 L48,352 L150,378 L186,506 L186,${BAND_FLOOR} Z" fill="${tone()}"/>
    <path d="M74,${BAND_FLOOR} L74,506 L110,444 L188,424 L262,458 L286,506 L286,${BAND_FLOOR} Z" fill="${tone(12)}"/>`,

  // 미들 센터: 윗면 한 덩어리 + 아랫면 4면
  gem: ({ tone }) => `
    <path d="M136,264 L244,264 L284,326 L96,326 Z" fill="${tone(14)}"/>
    <path d="M96,326 L143,326 L190,466 Z" fill="${tone(4)}"/>
    <path d="M143,326 L190,326 L190,466 Z" fill="${tone(-8)}"/>
    <path d="M190,326 L237,326 L190,466 Z" fill="${tone(8)}"/>
    <path d="M237,326 L284,326 L190,466 Z" fill="${tone(-16)}"/>`,

  // 하단 전체: 세 겹 물결 띠
  sea: ({ tone }) => `
    <path d="${wave(340, 320, 358, 334)}" fill="${tone(12, -10)}"/>
    <path d="${wave(400, 382, 418, 392)}" fill="${tone()}"/>
    <path d="${wave(458, 442, 474, 450)}" fill="${tone(-12)}"/>`,

  // 하단 전체: 흩어지는 빗방울 + 바닥 물웅덩이 띠
  rain: ({ tone }) => {
    const d = tone();
    const drop = (x: number, y: number, s: number) =>
      `<path d="M${x},${y} C${x + 10 * s},${y + 15 * s} ${x + 10 * s},${y + 28 * s} ${x},${y + 33 * s} C${x - 10 * s},${y + 28 * s} ${x - 10 * s},${y + 15 * s} ${x},${y} Z" fill="${d}"/>`;
    // 빗방울은 작게, 첫 줄도 글자 영역에서 넉넉히 떨어뜨려 둔다
    const drops = [[52, 282, 0.75], [128, 318, 0.9], [206, 276, 0.8], [286, 322, 0.75], [346, 286, 0.7],
      [90, 390, 0.85], [172, 408, 0.75], [254, 378, 0.9], [330, 410, 0.7]];
    // 빗방울 무늬를 카드 좌우로 한 칸씩 더 반복한다
    return `<path d="${wave(470, 458, 484, 464)}" fill="${tone(14, -12)}"/>`
      + [-380, 0, 380].flatMap((dx) => drops.map(([x, y, s]) => drop(x + dx, y, s))).join("");
  },
};

/**
 * 일지 마커: 계절·시간대를 알려 주는 작은 아이콘 하나.
 * 카드 오른쪽 위(한자 줄 높이)에 놓는다. 아이콘은 (0,0) 중심, 반지름 약 15 안에 그린다.
 */
export const MARKER_X = 340;
export const MARKER_Y = 52;

const ray = (cx: number, cy: number, a: number, r1: number, r2: number, color: string, w: number) =>
  stroke(`M${(cx + r1 * Math.cos(a)).toFixed(1)},${(cy + r1 * Math.sin(a)).toFixed(1)} L${(cx + r2 * Math.cos(a)).toFixed(1)},${(cy + r2 * Math.sin(a)).toFixed(1)}`, color, w);

const MARK: Record<EarthlyBranch, string> = {
  // 한겨울 밤: 초승달
  자: `<path d="M5,-14 A15,15 0 1,0 14,5 A12,12 0 0,1 5,-14 Z" fill="hsl(222 12% 40%)"/>`,
  // 늦겨울 눈: 눈송이
  축: [0, 60, 120].map((d) => ray(0, 0, (d * Math.PI) / 180, -14, 14, "hsl(205 48% 64%)", 3)).join(""),
  // 이른 봄 새벽: 안개 구름
  인: circles([[-6, 3, 7], [4, -1, 9]], "hsl(215 16% 70%)") + `<rect x="-13" y="2" width="26" height="8" rx="4" fill="hsl(215 16% 70%)"/>`,
  // 꽃 피는 봄: 꽃
  묘: circles([[0, -8, 6], [8, 0, 6], [0, 8, 6], [-8, 0, 6]], "hsl(342 62% 74%)") + `<circle r="4" fill="hsl(342 58% 62%)"/>`,
  // 늦봄 비 갠 뒤: 무지개
  진: stroke("M-15,9 A15,15 0 0,1 15,9", "hsl(8 72% 64%)", 4.5) + stroke("M-8,9 A8,8 0 0,1 8,9", "hsl(200 58% 62%)", 4.5),
  // 초여름 아침: 떠오르는 해
  사: `<path d="M-9,8 A9,9 0 0,1 9,8 Z" fill="hsl(44 90% 56%)"/>`
    + [-150, -120, -90, -60, -30].map((d) => ray(0, 8, (d * Math.PI) / 180, 12, 17, "hsl(44 90% 56%)", 2.6)).join("")
    + stroke("M-15,11 L15,11", "hsl(44 90% 56%)", 2.6),
  // 한여름 한낮: 빛이 사방으로 뻗는 해
  오: `<circle r="7" fill="hsl(30 92% 56%)"/>`
    + Array.from({ length: 8 }, (_, i) => ray(0, 0, (i * Math.PI) / 4, 11, 16, "hsl(30 92% 56%)", 2.6)).join(""),
  // 늦여름 노을: 수평선에 걸린 해
  미: `<path d="M-12,4 A12,12 0 0,1 12,4 Z" fill="hsl(14 82% 58%)"/>`
    + stroke("M-16,9 L16,9", "hsl(14 82% 58%)", 2.6) + stroke("M-9,14 L9,14", "hsl(14 82% 58%)", 2.6),
  // 초가을 맑은 하늘: 선선한 바람
  신: stroke("M-15,-5 L6,-5 A5,5 0 1,0 1,-10", "hsl(200 36% 60%)", 3)
    + stroke("M-15,4 L10,4 A5,5 0 1,1 5,9", "hsl(200 36% 60%)", 3),
  // 가을 저녁: 떨어지는 잎
  유: `<path d="M0,-15 Q11,-2 0,13 Q-11,-2 0,-15 Z" transform="rotate(20)" fill="hsl(28 70% 52%)"/>`
    + stroke("M-3,8 L3,-10", "hsl(28 60% 40%)", 1.8),
  // 늦가을 해 질 녘: 날아가는 새 둘
  술: stroke("M-15,-3 Q-10,-9 -5,-3 Q0,-9 5,-3", "hsl(20 14% 34%)", 2.6)
    + stroke("M1,8 Q5,3 9,8 Q13,3 17,8", "hsl(20 14% 34%)", 2.6),
  // 초겨울 깊은 밤: 반짝이는 별
  해: `<path d="M0,-15 L4,-4 L15,0 L4,4 L0,15 L-4,4 L-15,0 L-4,-4 Z" fill="hsl(42 68% 58%)"/>`,
};

/** 일지 마커만 따로 그릴 때의 SVG 내용. 중심 (0,0), 반지름 약 15 — viewBox "-17 -17 34 34"에 맞는다 */
export function markerMarkup(branch: EarthlyBranch): string {
  return MARK[branch];
}

/**
 * branch가 null이면 일지 변주와 마커 없이 상징 기본 모습만 그린다(입력 화면 캐러셀).
 * idPrefix는 한 페이지에 카드가 여러 장 있을 때 filter·clipPath id가 겹치지 않게 붙인다.
 * 영문자·숫자만 넘겨야 한다.
 */
export function motifSvg(
  motif: Motif,
  branch: EarthlyBranch | null,
  idPrefix: string,
  options: { marker?: boolean; art?: boolean } = {},
): string {
  const { marker = true, art = true } = options;
  const id = (name: string) => `${idPrefix}-${name}`;
  const ctx: Ctx = { tone: toneFor(motif, branch), mod: modFor(branch), id };
  // 손도장 질감: 가장자리를 살짝 흔들고 잔입자를 얹는다
  const stamp = `<filter id="${id("stamp")}" x="-12%" y="-12%" width="124%" height="124%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" result="grain"/>
    <feComposite in="grain" in2="d" operator="in" result="gin"/>
    <feBlend in="d" in2="gin" mode="multiply"/>
  </filter>`;
  return `<defs>${stamp}</defs><g filter="url(#${id("stamp")})">${art ? DRAW[motif](ctx) : ""}${marker && branch ? `<g transform="translate(${MARKER_X} ${MARKER_Y})">${MARK[branch]}</g>` : ""}</g>`;
}
