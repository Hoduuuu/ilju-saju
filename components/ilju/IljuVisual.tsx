"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { IljuEntry } from "@/lib/ilju/data";
import { gradientCss } from "@/lib/ilju/palette";
import { scrimCss, TEXT_ZONE } from "@/lib/ilju/scrim";
import Motif from "./Motif";

const noopSubscribe = () => () => {};

interface Props {
  ilju: IljuEntry;
  rounded?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function IljuVisual({ ilju, rounded = true, className = "", children }: Props) {
  // img는 하이드레이션 뒤에만 그린다. 서버에서 그린 img가 먼저 로드되면 onLoad를 놓치기 때문이다.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const loaded = loadedId === ilju.id;

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden ${rounded ? "rounded-[20px]" : ""} ${className}`}
      style={{ background: gradientCss(ilju.palette) }}
    >
      {!loaded && <Motif motif={ilju.motif} light={ilju.palette.bottom} deep={ilju.palette.mid} />}
      {hydrated && (
        /* eslint-disable-next-line @next/next/no-img-element -- PNG 저장(html-to-image) 호환을 위해 일반 img 사용 */
        <img
          key={ilju.id}
          src={`/ilju/${ilju.id}.png`}
          alt=""
          aria-hidden
          onLoad={() => setLoadedId(ilju.id)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {loaded && <div aria-hidden className="absolute inset-0" style={{ background: scrimCss(ilju.palette.top) }} />}
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: `${TEXT_ZONE * 100}%` }}>
        {children}
      </div>
    </div>
  );
}
