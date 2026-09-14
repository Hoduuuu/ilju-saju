import type { ReactNode } from "react";
import type { Motif as MotifKind } from "@/lib/ilju/stems";

/**
 * 이미지가 없을 때의 대체 모티프. 실제 PNG 일러스트와 같은 먹색(artInk, #332A2A)을
 * 두 단계 불투명도로 써서 한지 위 먹 그림처럼 보이게 한다. (호출부에서 palette.artInk를 넘긴다)
 */
const SHAPES: Record<MotifKind, (main: string, sub: string) => ReactNode> = {
  tree: (l, d) => (
    <g>
      <rect x="141" y="285" width="18" height="110" rx="6" fill={d} />
      <circle cx="150" cy="252" r="60" fill={l} />
      <circle cx="106" cy="290" r="40" fill={l} opacity="0.85" />
      <circle cx="194" cy="290" r="40" fill={l} opacity="0.85" />
    </g>
  ),
  flower: (l, d) => (
    <g>
      <g stroke={d} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M150 390 C150 335 140 305 120 270" />
        <path d="M150 390 C152 340 170 315 190 295" />
        <path d="M150 390 V305" />
      </g>
      <g fill={l}>
        <circle cx="120" cy="258" r="22" />
        <circle cx="190" cy="284" r="18" />
        <circle cx="150" cy="296" r="15" />
      </g>
    </g>
  ),
  sun: (l) => (
    <g>
      <circle cx="150" cy="300" r="110" fill={l} opacity="0.35" />
      <circle cx="150" cy="300" r="76" fill={l} />
    </g>
  ),
  lamp: (l, d) => (
    <g>
      <line x1="150" y1="200" x2="150" y2="240" stroke={d} strokeWidth="4" />
      <rect x="112" y="240" width="76" height="108" rx="30" fill={l} />
      <ellipse cx="150" cy="294" rx="14" ry="22" fill={d} opacity="0.55" />
      <rect x="128" y="346" width="44" height="10" rx="4" fill={d} />
    </g>
  ),
  mountain: (l, d) => (
    <g>
      <polygon points="-10,400 130,215 290,400" fill={l} />
      <polygon points="120,400 235,275 330,400" fill={d} opacity="0.55" />
    </g>
  ),
  field: (l, d) => (
    <g>
      <path d="M-10 330 Q150 290 310 330 V400 H-10Z" fill={l} />
      <path d="M-10 362 Q150 326 310 362 V400 H-10Z" fill={d} opacity="0.45" />
      <path d="M150 330 V292 M150 304 q-14 -14 -26 -10 M150 304 q14 -14 26 -10" stroke={d} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  rock: (l, d) => (
    <g>
      <path d="M40 400 L70 300 L130 250 L205 262 L255 320 L275 400Z" fill={l} />
      <path d="M130 250 L150 320 L255 320" stroke={d} strokeWidth="4" fill="none" opacity="0.6" />
    </g>
  ),
  gem: (l, d) => (
    <g>
      <polygon points="150,215 215,285 150,375 85,285" fill={l} />
      <polyline points="85,285 215,285" stroke={d} strokeWidth="3" fill="none" />
      <polyline points="120,285 150,215 180,285 150,375 120,285" stroke={d} strokeWidth="3" fill="none" opacity="0.6" />
    </g>
  ),
  sea: (l, d) => (
    <g>
      <path d="M-10 300 Q40 275 90 300 T190 300 T310 300 V400 H-10Z" fill={l} />
      <path d="M-10 336 Q40 312 90 336 T190 336 T310 336 V400 H-10Z" fill={d} opacity="0.5" />
    </g>
  ),
  rain: (l, d) => (
    <g>
      <ellipse cx="150" cy="372" rx="130" ry="26" fill={l} />
      <ellipse cx="150" cy="372" rx="70" ry="12" fill={d} opacity="0.4" />
      {[
        [90, 230],
        [150, 262],
        [210, 226],
        [120, 312],
        [185, 302],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} q-9 16 0 22 q9 -6 0 -22Z`} fill={l} />
      ))}
    </g>
  ),
};

export default function Motif({ motif, ink }: { motif: MotifKind; ink: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <ellipse cx="150" cy="430" rx="260" ry="90" fill={ink} opacity="0.2" />
      {SHAPES[motif](
        `${ink}D1` /* main shape, opacity 0.82 */,
        `${ink}73` /* secondary shape, opacity 0.45 */,
      )}
    </svg>
  );
}
