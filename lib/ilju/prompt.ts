import { BRANCH_SEASONS } from "./branches";
import { STEM_NATURES } from "./stems";
import type { IljuEntry } from "./data";

/**
 * 색은 카드에서 코드로 입히므로, 생성 단계에서는 흰 종이 위의 먹 그림만 받는다.
 * 받은 그림은 밝기를 알파로 바꿔 투명 PNG로 저장한다(scripts/generate-ilju-images.ts).
 */
export const IMAGE_STYLE = [
  "Korean traditional ink painting (sumukhwa) printed as a woodblock print on plain white paper.",
  "Pure black sumi ink on white only — absolutely no color anywhere, no tinted paper, no colored wash.",
  "Ink work: dry-brush strokes, wet ink bleeding, fine stipple and hatching, visible woodcut carving grain, hand-printed feel.",
  "Pure white background, evenly lit, no paper sheet edges, no torn or deckled edge, no margin, no vignette, no drop shadow, no frame, no border.",
  "Minimal composition with generous empty space. No text, no letters, no seal, no signature, no people.",
].join(" ");

/**
 * 텍스트는 좌상단에 놓이므로, 주인공은 오른쪽에 두거나
 * 가운데일 때는 수평으로 퍼지는 요소로 배치한다.
 */
const HORIZONTAL_MOTIFS = new Set(["mountain", "field", "sea", "rain", "sun"]);

export function imagePrompt(entry: IljuEntry): string {
  const stem = STEM_NATURES[entry.stem];
  const branch = BRANCH_SEASONS[entry.branch];
  const layout = HORIZONTAL_MOTIFS.has(entry.motif)
    ? "Composition: the subject spreads horizontally across the lower half of the frame."
    : "Composition: the subject is large and sits on the right side of the frame, rising from the lower edge.";

  return [
    IMAGE_STYLE,
    `Main subject: ${stem.promptSubject}, drawn in deep black ink, large and clearly the focus.`,
    `Setting: ${branch.promptScene}, suggested with ink strokes only.`,
    layout,
    "Keep the upper-left 45% of the image empty white with no ink at all, so text can be placed there.",
    "Portrait composition, 3:4 aspect ratio.",
  ].join(" ");
}
