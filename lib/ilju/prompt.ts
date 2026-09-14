import { BRANCH_SEASONS } from "./branches";
import { STEM_NATURES } from "./stems";
import type { IljuEntry } from "./data";

export const IMAGE_STYLE =
  "Flat vector illustration with soft gradient shading, clean simple shapes, calm poetic mood, smooth grain-free colors, no text, no letters, no people, no frame, no border.";

export function imagePrompt(entry: IljuEntry): string {
  const stem = STEM_NATURES[entry.stem];
  const branch = BRANCH_SEASONS[entry.branch];
  return [
    IMAGE_STYLE,
    `Main subject: ${stem.promptSubject}, placed in the lower half of the frame.`,
    `Setting: ${branch.promptScene}.`,
    `Background colors: deep ${entry.palette.top} at the top, blending into ${entry.palette.bottom} near the bottom.`,
    "Keep the top 45% of the image an empty, smooth, dark background with no objects so white text stays readable.",
    "Portrait composition, 3:4 aspect ratio.",
  ].join(" ");
}
