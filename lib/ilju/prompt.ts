import { BRANCH_SEASONS } from "./branches";
import { STEM_NATURES } from "./stems";
import type { IljuEntry } from "./data";

/** 동양화·수묵화 + 목판화 질감. 배경까지 한지 결이 보이게 한다. */
export const IMAGE_STYLE = [
  "Korean traditional ink painting (sumukhwa) printed as a woodblock print.",
  "Black sumi ink only: dry-brush strokes, wet ink bleeding into the paper, fine stipple and hatching, visible woodcut carving grain.",
  "The whole image, background included, shows hanji mulberry paper texture: visible paper fibers, subtle specks, uneven hand-printed ink absorption, soft deckled tone.",
  "Flat single muted background color, low saturation, no gradient gloss.",
  "Minimal poster composition with generous empty space. No text, no letters, no seal, no signature, no people, no frame, no border.",
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
    `Background: flat ${branch.paperColor} hanji paper.`,
    `Main subject: ${stem.promptSubject}, drawn in deep black ink, large and clearly the focus.`,
    `Setting: ${branch.promptScene}.`,
    layout,
    "Keep the upper-left 45% of the image empty flat paper with no objects, so dark text can be placed there.",
    "Portrait composition, 3:4 aspect ratio.",
  ].join(" ");
}
