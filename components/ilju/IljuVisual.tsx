import type { ReactNode } from "react";
import type { IljuEntry } from "@/lib/ilju/data";
import type { Motif as MotifKind } from "@/lib/ilju/stems";
import { TEXT_ZONE } from "@/lib/ilju/layout";
import { ART_TOP, HORIZONTAL_BAND_MOTIFS, SINGLE_MOTIFS, VIEW_H, VIEW_W } from "@/lib/ilju/motifs";
import Motif from "./Motif";

interface Props {
  ilju: IljuEntry;
  rounded?: boolean;
  /** rounded일 때 적용할 모서리 반경. 기본은 카드 반경(12px)이다. */
  radius?: string;
  /**
   * 아래에서 겹쳐 올라오는 시트의 높이(px, 375px 폭 기준). 주면 그림 바닥을 그만큼 올려 시트에 잘려 보이지 않게 한다.
   * - 가로 띠·홀로 뜬 상징: 그림 바닥을 시트 윗선에 맞추고, 띠는 아래로 더 그린 여분만 시트 뒤로 들어간다.
   * - 나무·풀꽃: 절반만 올려 줄기 끝이 시트 뒤로 조금 들어가 땅에 선 느낌을 낸다.
   */
  sheetOverlap?: number;
  /** 가로 띠를 뺀 상징(나무·풀꽃·태양·촛불·보석)을 이 비율로 줄여 그린다. 도감처럼 카드가 작은 곳에서 쓴다 */
  objectScale?: number;
  /** 일지 마커를 그림 안에 그릴지. 글자 줄에 마커를 따로 두는 히어로·상세에서는 false */
  marker?: boolean;
  className?: string;
  children?: ReactNode;
}

/** 기준 폭 375px일 때 3:4 카드 높이 */
const BASE_HEIGHT = 500;

/**
 * 그림 윗선(ART_TOP)은 제자리에 두고 바닥만 lift 비율만큼 올리는 viewBox.
 * 그림을 위로 통째로 옮기면 윗부분이 글자 영역을 침범하므로, 윗선 기준으로 살짝 줄인다.
 * 카드 높이 대비 비율로 계산해 화면 폭이 달라도 같은 모양이 된다.
 */
function liftedViewBox(liftRatio: number): string {
  const perUnit = 1 / VIEW_H - liftRatio / (VIEW_H - ART_TOP);
  const height = 1 / perUnit;
  const top = ART_TOP - (ART_TOP * (1 / VIEW_H)) / perUnit;
  return `0 ${top.toFixed(1)} ${VIEW_W} ${height.toFixed(1)}`;
}

/**
 * 상징을 줄일 때 고정할 기준점(카드 좌표). 줄여도 제자리에 앉아 있도록
 * - 홀로 뜬 상징: 가로 가운데, 상징 바닥 근처
 * - 나무·풀꽃: 그림의 가로 중심, 카드 바닥(줄기가 바닥에 붙어 있게)
 */
const SCALE_ANCHOR: Partial<Record<MotifKind, { x: number; y: number }>> = {
  sun: { x: 190, y: 480 },
  lamp: { x: 190, y: 480 },
  gem: { x: 190, y: 480 },
  tree: { x: 262, y: VIEW_H },
  flower: { x: 230, y: VIEW_H },
};

/** 기준점을 고정한 채 k배로 줄여 보이는 viewBox(카드와 같은 3:4 비율) */
function scaledViewBox(motif: MotifKind, k: number): string {
  const { x, y } = SCALE_ANCHOR[motif] ?? { x: VIEW_W / 2, y: VIEW_H };
  return `${(x - x / k).toFixed(1)} ${(y - y / k).toFixed(1)} ${(VIEW_W / k).toFixed(1)} ${(VIEW_H / k).toFixed(1)}`;
}

export default function IljuVisual({ ilju, rounded = true, radius = "var(--radius-card)", sheetOverlap = 0, objectScale = 1, marker = true, className = "", children }: Props) {
  const shrink = objectScale !== 1 && !HORIZONTAL_BAND_MOTIFS.has(ilju.motif) ? objectScale : 1;
  const lift = HORIZONTAL_BAND_MOTIFS.has(ilju.motif) || SINGLE_MOTIFS.has(ilju.motif) ? sheetOverlap : sheetOverlap / 2;
  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden ${className}`}
      style={{ background: ilju.palette.paper, borderRadius: rounded ? radius : undefined }}
    >
      {lift > 0 ? (
        <>
          {/* 그림 바닥만 올리고, 아래로 넘치는 띠의 여분은 보이게 둔다. 마커는 제자리에 따로 그린다 */}
          <Motif
            motif={ilju.motif}
            branch={ilju.branch}
            marker={false}
            viewBox={liftedViewBox(lift / BASE_HEIGHT)}
            fit="meet"
            align="xMidYMin"
            className="absolute inset-0 h-full w-full overflow-visible"
          />
          {marker && <Motif motif={ilju.motif} branch={ilju.branch} art={false} />}
        </>
      ) : shrink !== 1 ? (
        <>
          {/* 상징만 줄이고, 마커는 제 크기·제자리에 따로 그린다 */}
          <Motif motif={ilju.motif} branch={ilju.branch} marker={false} viewBox={scaledViewBox(ilju.motif, shrink)} />
          {marker && <Motif motif={ilju.motif} branch={ilju.branch} art={false} />}
        </>
      ) : (
        <Motif motif={ilju.motif} branch={ilju.branch} marker={marker} />
      )}
      {/* 글자 영역: 기본 높이는 위쪽 45%이고, 좁은 화면에서 글자가 더 길어지면 잘리지 않고 늘어난다 */}
      <div className="absolute inset-x-0 top-0 flex flex-col" style={{ minHeight: `${TEXT_ZONE * 100}%` }}>
        {children}
      </div>
    </div>
  );
}
