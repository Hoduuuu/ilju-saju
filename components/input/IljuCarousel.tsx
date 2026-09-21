"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Motif from "@/components/ilju/Motif";
import { STEM_NATURES, type Motif as MotifKind } from "@/lib/ilju/stems";
import { ART_TOP, BAND_EXTENT, HORIZONTAL_BAND_MOTIFS, SINGLE_MOTIFS, VIEW_H, VIEW_W } from "@/lib/ilju/motifs";

/** 일간 상징 10종을 일지 변주 없이 기본 색으로 甲→癸 순서대로 끝없이 돌린다 */
const ITEMS: MotifKind[] = Object.values(STEM_NATURES).map((stem) => stem.motif);
const INTERVAL_MS = 4000;

const ART_H = VIEW_H - ART_TOP;
/** 그래픽을 그리는 최대 폭. 확대하지 않고 이 폭 안에서 원래 비율로 그린다 */
const MAX_ART_W = 300;
const MAX_ART_H = (MAX_ART_W * ART_H) / VIEW_W;

/** 나무·풀꽃: 카드와 같은 구도(0~380) 그대로, 오른쪽 아래에 붙인다 */
const OBJECT_VIEWBOX = `0 ${ART_TOP} ${VIEW_W} ${ART_H}`;

/**
 * 카드 가운데에 홀로 놓이는 상징(태양·촛불·보석)은 viewBox를 넓혀 나무·풀꽃보다 조금 작게(약 92%) 그리고,
 * 그림 오른쪽 끝(태양 기준 x=294)이 viewBox 오른쪽에서 20만큼 안쪽에 오도록 오른쪽으로 옮긴다.
 */
const SINGLE_SCALE = 1.3 / 1.2;
const SINGLE_W = VIEW_W * SINGLE_SCALE;
const SINGLE_H = ART_H * SINGLE_SCALE;
const SINGLE_VIEWBOX = `${294 + 20 - SINGLE_W} ${VIEW_H - SINGLE_H} ${SINGLE_W} ${SINGLE_H}`;
/**
 * 가로 띠 그래픽: 카드 밖까지 이어 그린 넓은 viewBox를 높이 기준으로 맞춘다(slice).
 * 높이를 다른 그래픽과 같게 두므로 확대되지 않고, 화면 폭만큼 좌우가 더 보인다.
 */
const BAND_VIEWBOX = `${BAND_EXTENT.left} ${ART_TOP} ${BAND_EXTENT.right - BAND_EXTENT.left} ${ART_H}`;

const noopSubscribe = () => () => {};
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const readReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * 입력 화면 가운데에서 일간 상징 그래픽이 4초마다 초점이 흐려지며 사라지고, 다음 그래픽이 또렷해지며 나타난다.
 * 누르거나 마우스를 올리면 멈춘다.
 */
export default function IljuCarousel({ className = "" }: { className?: string }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);
  const running = hydrated && !paused && !hovered && !reducedMotion;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ITEMS.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [running]);

  return (
    <button
      type="button"
      aria-label={paused ? "일주 그래픽 다시 넘기기" : "일주 그래픽 넘기기 멈추기"}
      aria-pressed={paused}
      onClick={() => setPaused((p) => !p)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative block w-full cursor-pointer overflow-hidden focus-visible:outline-offset-[-2px] ${className}`}
    >
      {ITEMS.map((motif, i) => {
        const active = i === index;
        const band = HORIZONTAL_BAND_MOTIFS.has(motif);
        return (
          <div
            key={motif}
            aria-hidden
            className={`absolute motion-safe:transition-[opacity,filter,transform] motion-safe:duration-1000 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] ${
              band
                ? // 가로 띠: 그림 바닥(506)을 시트 윗선에 맞추고, 아래로 더 그린 여분만 시트 뒤로 들어간다
                  "inset-x-0 bottom-8 origin-bottom"
                : SINGLE_MOTIFS.has(motif)
                  ? // 홀로 뜬 상징: 시트 윗선 위에 놓는다
                    "bottom-8 right-5 top-0 origin-bottom-right"
                  : // 나무·풀꽃: 줄기 끝 16px만 시트 뒤로 들어가 땅에 선 느낌을 낸다
                    "bottom-4 right-5 top-0 origin-bottom-right"
            }`}
            style={{
              ...(band
                ? { height: `min(${MAX_ART_H}px, calc(100% - 32px))` }
                : { width: `min(${MAX_ART_W}px, calc(100% - 40px))` }),
              opacity: active ? 1 : 0,
              filter: active ? "blur(0px)" : "blur(10px)",
              transform: active ? "scale(1)" : "scale(0.96)",
            }}
          >
            {/* 첫 장은 서버에서도 그려 빈 화면이 보이지 않게 하고, 나머지는 브라우저에서만 그린다 */}
            {(hydrated || i === 0) && (
              <Motif
                motif={motif}
                branch={null}
                marker={false}
                viewBox={band ? BAND_VIEWBOX : SINGLE_MOTIFS.has(motif) ? SINGLE_VIEWBOX : OBJECT_VIEWBOX}
                fit={band ? "slice" : "meet"}
                align={band ? "xMidYMax" : "xMaxYMax"}
                // 가로 띠는 viewBox 아래로 더 그린 부분이 보이도록 넘침을 허용한다(시트 뒤로 들어감)
                className={`h-full w-full ${band ? "overflow-visible" : ""}`}
              />
            )}
          </div>
        );
      })}
    </button>
  );
}
