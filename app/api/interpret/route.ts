import { calculateSaju, parseSajuInput } from "@/lib/saju/calculate";
import { SajuInputError, type SajuResult } from "@/lib/saju/types";
import { getIlju } from "@/lib/ilju/data";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/interpret/prompt";
import { runClaude } from "@/lib/interpret/runClaude";
import type { InterpretEvent } from "@/lib/interpret/claudeEvents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let result: SajuResult;
  try {
    result = calculateSaju(parseSajuInput(await request.json()));
  } catch (error) {
    const message = error instanceof SajuInputError ? error.message : "요청을 읽지 못했어요.";
    return Response.json({ message }, { status: 400 });
  }

  const ilju = getIlju(result.iljuId);
  if (!ilju) return Response.json({ message: "일주 정보를 찾지 못했어요." }, { status: 500 });

  const userPrompt = buildUserPrompt(result, ilju);
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: InterpretEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          abort.abort();
        }
      };
      void runClaude({ systemPrompt: SYSTEM_PROMPT, userPrompt, model: process.env.CLAUDE_MODEL, signal: abort.signal }, send).finally(() => {
        try {
          controller.close();
        } catch {
          // 이미 닫힘
        }
      });
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
