"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { IljuEntry } from "@/lib/ilju/data";
import { paperCss } from "@/lib/ilju/palette";
import { TEXT_ZONE } from "@/lib/ilju/layout";
import Motif from "./Motif";

const noopSubscribe = () => () => {};

interface Props {
  ilju: IljuEntry;
  rounded?: boolean;
  /** rounded일 때 적용할 모서리 반경. 기본 20px, 도감 카드처럼 더 작은 값이 필요할 때만 넘긴다. */
  radius?: string;
  className?: string;
  children?: ReactNode;
}

export default function IljuVisual({ ilju, rounded = true, radius = "20px", className = "", children }: Props) {
  // img는 하이드레이션 뒤에만 그린다. 서버에서 그린 img가 먼저 로드되면 onLoad를 놓치기 때문이다.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const loaded = loadedId === ilju.id;

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden ${className}`}
      style={{ background: paperCss(ilju.palette), borderRadius: rounded ? radius : undefined }}
    >
      <div aria-hidden className="paper-grain absolute inset-0" />
      {!loaded && <Motif motif={ilju.motif} ink={ilju.palette.artInk} />}
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
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: `${TEXT_ZONE * 100}%` }}>
        {children}
      </div>
    </div>
  );
}
