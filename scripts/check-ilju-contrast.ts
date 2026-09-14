import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ILJU_LIST } from "@/lib/ilju/data";
import { textZoneContrast } from "@/lib/ilju/imageContrast";

async function main() {
  const failures: string[] = [];
  let missing = 0;
  for (const entry of ILJU_LIST) {
    const file = path.join(process.cwd(), "public", "ilju", `${entry.id}.png`);
    try {
      await access(file);
    } catch {
      missing += 1;
      continue;
    }
    const { data, info } = await sharp(file).resize(60, 80, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const ratio = textZoneContrast(new Uint8Array(data), info.width, info.height, info.channels, entry.palette.paper);
    const mark = ratio >= 4.5 ? "✔" : "✘";
    console.log(`${mark} ${entry.id.padEnd(12)} ${ratio.toFixed(2)}:1`);
    if (ratio < 4.5) failures.push(entry.id);
  }
  console.log(`\n이미지 없음(더미 사용): ${missing}개`);
  if (failures.length > 0) {
    console.log(`대비 부족 ${failures.length}개 → 다른 seed로 다시 만드세요:\n  npm run images:only -- ${failures.join(",")} --seed 777`);
    process.exit(1);
  }
  console.log("모든 이미지가 먹색 텍스트 대비 4.5:1 이상이에요.");
}

void main();
