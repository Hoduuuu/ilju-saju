import { hexToRgb, hslToRgb, mixRgb, rgbToHex, type Rgb } from "./color";
import type { StemNature } from "./stems";
import type { BranchSeason } from "./branches";
import { TEXT_ZONE } from "./scrim";

export interface IljuPalette {
  top: string;
  mid: string;
  bottom: string;
}

export const GRADIENT_MID_STOP = 0.55;

export function paletteFor(stem: StemNature, branch: BranchSeason): IljuPalette {
  return {
    top: rgbToHex(hslToRgb(stem.hue, stem.saturation, branch.topLightness)),
    mid: rgbToHex(hslToRgb(stem.hue, stem.saturation, branch.topLightness + 6)),
    bottom: rgbToHex(hslToRgb(branch.bottomHue, 45, branch.bottomLightness)),
  };
}

export function gradientCss(p: IljuPalette): string {
  return `linear-gradient(180deg, ${p.top} 0%, ${p.mid} ${GRADIENT_MID_STOP * 100}%, ${p.bottom} 100%)`;
}

/** 텍스트 영역 맨 아래(상단 45% 지점)의 배경색 — 텍스트 영역에서 가장 밝은 지점 */
export function textZoneEdgeColor(p: IljuPalette): Rgb {
  return mixRgb(hexToRgb(p.top), hexToRgb(p.mid), TEXT_ZONE / GRADIENT_MID_STOP);
}
