/**
 * 배포 사이트용 "미리 만든 AI 풀이"를 로컬의 claude(구독)로 만든다.
 *
 *   npx -y tsx scripts/generate-readings.ts --only gye-yu,year:계   # 몇 개만(샘플)
 *   npx -y tsx scripts/generate-readings.ts --all                    # 60일주 + 10일간 전부
 *
 * - 결과는 data/readings/ilju.json(일주별), data/readings/year-2026.json(일간별)에 한 건마다 바로 저장한다.
 * - 이미 만든 항목은 건너뛰므로, 중간에 멈춰도 같은 명령으로 이어서 만들 수 있다(--force면 다시 만든다).
 * - 사용량 한도에 걸리면 멈추고, 한도가 풀린 뒤 다시 실행하면 이어서 만든다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getBranchTenGod, getTenGod, type HeavenlyStem } from "manseryeok";
import { ILJU_LIST, getIlju } from "@/lib/ilju/data";
import { SEUN_YEAR } from "@/lib/saju/calculate";
import { branchHanja, stemHanja, yearGanji } from "@/lib/saju/ganji";
import { runClaude } from "@/lib/interpret/runClaude";
import { ILJU_PRESET_SYSTEM, YEAR_PRESET_SYSTEM, iljuPresetPrompt, yearPresetPrompt } from "@/lib/interpret/presetPrompt";
import { parseSections } from "@/lib/interpret/sections";

const DIR = path.join(process.cwd(), "data", "readings");
const ILJU_FILE = path.join(DIR, "ilju.json");
const YEAR_FILE = path.join(DIR, `year-${SEUN_YEAR}.json`);
const STEMS: HeavenlyStem[] = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];

const read = (file: string): Record<string, string> => JSON.parse(readFileSync(file, "utf8"));
const write = (file: string, data: Record<string, string>) => {
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`);
};

class LimitError extends Error {}

async function ask(systemPrompt: string, userPrompt: string): Promise<string> {
  let text = "";
  let failure: { code: string; message: string } | null = null;
  await runClaude({ systemPrompt, userPrompt, model: process.env.CLAUDE_MODEL || undefined, timeoutMs: 240_000 }, (event) => {
    if (event.type === "text") text += event.text;
    if (event.type === "error") failure = event;
  });
  const error = failure as { code: string; message: string } | null;
  if (error?.code === "limit") throw new LimitError(error.message);
  if (error) throw new Error(`${error.code}: ${error.message}`);
  return text.trim();
}

/** 필요한 섹션이 다 들어 있는지 확인한다. 빠졌으면 실패로 보고 다시 만든다 */
function hasSections(text: string, ids: string[]): boolean {
  const sections = parseSections(text);
  return ids.every((id) => Boolean(sections[id as keyof typeof sections]));
}

type Job = { key: string; kind: "ilju" | "year"; run: () => Promise<string> };

function jobs(): Job[] {
  const seun = yearGanji(SEUN_YEAR);
  const seunHanja = stemHanja(seun.stem) + branchHanja(seun.branch);
  return [
    ...ILJU_LIST.map((ilju) => ({
      key: ilju.id,
      kind: "ilju" as const,
      run: () => ask(ILJU_PRESET_SYSTEM, iljuPresetPrompt(ilju)),
    })),
    ...STEMS.map((stem) => ({
      key: `year:${stem}`,
      kind: "year" as const,
      run: () => ask(YEAR_PRESET_SYSTEM, yearPresetPrompt(stem, SEUN_YEAR, seunHanja, getTenGod(stem, seun.stem), getBranchTenGod(stem, seun.branch))),
    })),
  ];
}

async function main() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // 없으면 기본 모델로 진행
  }
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? new Set((args[onlyIndex + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean)) : null;
  if (!only && !args.includes("--all")) {
    console.log("사용법: --only gye-yu,year:계 | --all [--force]");
    return;
  }
  for (const key of only ?? []) {
    if (!key.startsWith("year:") && !getIlju(key)) throw new Error(`없는 일주 id예요: ${key}`);
  }

  const ilju = read(ILJU_FILE);
  const year = read(YEAR_FILE);
  const targets = jobs().filter((job) => (only ? only.has(job.key) : true));
  let made = 0;
  for (const job of targets) {
    const store = job.kind === "ilju" ? ilju : year;
    const storeKey = job.kind === "ilju" ? job.key : job.key.slice("year:".length);
    if (!force && store[storeKey]) continue;
    const required = job.kind === "ilju" ? ["summary", "nature", "work", "relation"] : ["year"];
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const started = Date.now();
      try {
        let text = await job.run();
        // 세운 글은 섹션이 하나뿐이라, 모델이 제목을 "## 2026"처럼 바꿔 써도 "## [year]"로 맞춘다
        if (job.kind === "year" && !text.startsWith("## [year]")) text = `## [year]\n${text.replace(/^##[^\n]*\n/, "")}`;
        if (!hasSections(text, required)) throw new Error("형식이 맞지 않아요(섹션 누락)");
        store[storeKey] = text;
        write(job.kind === "ilju" ? ILJU_FILE : YEAR_FILE, store);
        made += 1;
        console.log(`✔ ${job.key} (${Math.round((Date.now() - started) / 1000)}초)`);
        break;
      } catch (error) {
        if (error instanceof LimitError) {
          console.error(`사용량 한도에 도달했어요(${made}개 생성). 한도가 풀린 뒤 같은 명령을 다시 실행하면 이어서 만들어요.`);
          process.exit(2);
        }
        const message = error instanceof Error ? error.message : String(error);
        console.error(`… ${job.key} 실패 ${attempt}/3: ${message.slice(0, 120)}`);
      }
    }
  }
  const total = ILJU_LIST.length + STEMS.length;
  console.log(`완료: 이번에 ${made}개 생성 · 전체 ${Object.keys(ilju).length + Object.keys(year).length}/${total}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
