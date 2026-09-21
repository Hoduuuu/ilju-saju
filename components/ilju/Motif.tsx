import { useId, type CSSProperties } from "react";
import type { EarthlyBranch } from "manseryeok";
import type { Motif as MotifKind } from "@/lib/ilju/stems";
import { VIEW_H, VIEW_W, motifSvg } from "@/lib/ilju/motifs";

interface Props {
  motif: MotifKind;
  /** null이면 일지 변주·마커 없이 상징 기본 모습 */
  branch: EarthlyBranch | null;
  /** 일지 마커(우측 상단 아이콘)를 그릴지. 기본은 그린다 */
  marker?: boolean;
  /** 상징 그림을 그릴지. 마커만 따로 그릴 때 false */
  art?: boolean;
  style?: CSSProperties;
  /** 카드 전체가 아니라 일부만 보여 줄 때의 viewBox. 기본은 카드 전체 */
  viewBox?: string;
  /** 기본은 카드처럼 아래 기준으로 꽉 채운다(xMidYMax slice) */
  fit?: "slice" | "meet";
  /** 남는 공간에서 어디에 붙일지. 기본은 가운데 아래 */
  align?: "xMidYMax" | "xMaxYMax" | "xMidYMin";
  className?: string;
}

/** 일간 상징 + 일지 색 변주로 그린 일러스트. 기본은 카드 전체를 덮고 아래쪽을 기준으로 맞춘다 */
export default function Motif({ motif, branch, marker = true, art = true, style, viewBox, fit = "slice", align = "xMidYMax", className = "absolute inset-0 h-full w-full" }: Props) {
  const prefix = `m${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      aria-hidden
      viewBox={viewBox ?? `0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio={`${align} ${fit}`}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: motifSvg(motif, branch, prefix, { marker, art }) }}
    />
  );
}
