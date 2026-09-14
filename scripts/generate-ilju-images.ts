import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ILJU_LIST, getIlju, type IljuEntry } from "@/lib/ilju/data";
import { imagePrompt } from "@/lib/ilju/prompt";

const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const OUT_DIR = path.join(process.cwd(), "public", "ilju");
const REFERENCE = path.join(OUT_DIR, "_style-reference.png");
const DEFAULT_SEED = 20260914;

function requireEnv(name: "CF_ACCOUNT_ID" | "CF_API_TOKEN"): string {
  const value = process.env[name];
  if (!value) {
    console.error(`.env.local에 ${name} 값이 없어요. README의 "일러스트 만들기"를 참고해 주세요.`);
    process.exit(1);
  }
  return value;
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

class DailyLimitError extends Error {}

async function generate(entry: IljuEntry, seed: number, useReference: boolean): Promise<Buffer> {
  const form = new FormData();
  form.append("prompt", imagePrompt(entry));
  form.append("width", "768");
  form.append("height", "1024");
  form.append("seed", String(seed));
  if (useReference && (await exists(REFERENCE))) {
    const small = await sharp(REFERENCE).resize(360, 480, { fit: "cover" }).png().toBuffer();
    form.append("input_image_0", new Blob([new Uint8Array(small)], { type: "image/png" }), "reference.png");
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${requireEnv("CF_ACCOUNT_ID")}/ai/run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${requireEnv("CF_API_TOKEN")}` },
    body: form,
  });
  const bodyText = await response.text();
  // 4006은 Workers AI 무료 일일 한도 오류 코드이고, "neuron(s)"는 한도 관련 메시지에 나타난다.
  // 성공 응답의 본문은 ~1MB base64 PNG라서 우연히 이 단어들이 나타날 수 있으니, 실패 응답일 때만 검사한다.
  if (response.status === 429 || (!response.ok && /\b4006\b|neurons?/i.test(bodyText))) throw new DailyLimitError(bodyText.slice(0, 300));
  let json: { success?: boolean; result?: { image?: string }; image?: string; errors?: unknown };
  try {
    json = JSON.parse(bodyText);
  } catch {
    throw new Error(`Cloudflare 응답을 읽지 못했어요 (${response.status}): ${bodyText.slice(0, 300)}`);
  }
  if (!response.ok || json.success === false) throw new Error(`Cloudflare 오류 (${response.status}): ${JSON.stringify(json.errors ?? json).slice(0, 300)}`);
  const base64 = json.result?.image ?? json.image;
  if (typeof base64 !== "string") throw new Error(`응답에 image가 없어요: ${bodyText.slice(0, 300)}`);
  return Buffer.from(base64, "base64");
}

async function savePng(buffer: Buffer, file: string): Promise<void> {
  await sharp(buffer).png().toFile(file);
}

function parseSeed(args: string[]): number {
  const index = args.indexOf("--seed");
  return index >= 0 ? Number(args[index + 1]) : DEFAULT_SEED;
}

async function main() {
  const args = process.argv.slice(2);
  const [mode, value] = args;

  if (mode !== "--sample" && mode !== "--accept-sample" && mode !== "--all" && mode !== "--only") {
    console.log("사용법: --sample <id> | --accept-sample <id> | --all | --only id1,id2 [--seed N]");
    return;
  }

  try {
    process.loadEnvFile(".env.local");
  } catch {
    // 파일이 없으면 requireEnv에서 안내한다
  }

  await mkdir(OUT_DIR, { recursive: true });
  const seed = parseSeed(args);

  if (mode === "--sample") {
    const entry = getIlju(value ?? "gap-ja");
    if (!entry) throw new Error(`없는 일주 id예요: ${value}`);
    const file = path.join(OUT_DIR, `_sample-${entry.id}.png`);
    await savePng(await generate(entry, seed, false), file);
    console.log(`샘플을 만들었어요: ${file}\n마음에 들면: npx tsx scripts/generate-ilju-images.ts --accept-sample ${entry.id}`);
    return;
  }

  if (mode === "--accept-sample") {
    const entry = getIlju(value ?? "");
    if (!entry) throw new Error(`없는 일주 id예요: ${value}`);
    const sample = path.join(OUT_DIR, `_sample-${entry.id}.png`);
    await copyFile(sample, REFERENCE);
    await copyFile(sample, path.join(OUT_DIR, `${entry.id}.png`));
    console.log("기준 이미지로 확정했어요. 이제 npm run images:all 을 실행하세요.");
    return;
  }

  const targets =
    mode === "--all"
      ? ILJU_LIST
      : (value ?? "").split(",").map((id) => {
          const entry = getIlju(id.trim());
          if (!entry) throw new Error(`없는 일주 id예요: ${id}`);
          return entry;
        });

  let made = 0;
  for (const entry of targets) {
    const file = path.join(OUT_DIR, `${entry.id}.png`);
    if (mode === "--all" && (await exists(file))) continue;
    try {
      await savePng(await generate(entry, seed, true), file);
      made += 1;
      console.log(`✔ ${entry.id} ${entry.symbol}`);
    } catch (error) {
      if (error instanceof DailyLimitError) {
        console.error(`오늘 무료 사용량을 다 썼어요(${made}장 생성). 내일 오전 9시(KST) 이후 같은 명령을 다시 실행하면 이어서 만들어요.`);
        process.exit(2);
      }
      throw error;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`완료: ${made}장 생성. 다음으로 npm run images:check 를 실행하세요.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
