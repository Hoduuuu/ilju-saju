import { calculateSaju, parseSajuInput } from "@/lib/saju/calculate";
import { SajuInputError, type SajuResult } from "@/lib/saju/types";
import { getIlju } from "@/lib/ilju/data";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/interpret/prompt";
import { runClaude } from "@/lib/interpret/runClaude";
import { runAnthropic } from "@/lib/interpret/runAnthropic";
import { consumeQuota } from "@/lib/interpret/quota";
import { ERROR_MESSAGES, type InterpretEvent } from "@/lib/interpret/claudeEvents";
import { isShareSite } from "@/lib/share/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 긴 풀이를 스트리밍하는 동안 서버 함수가 끊기지 않도록 넉넉히 둔다(Vercel 최대 실행 시간)
export const maxDuration = 300;

/**
 * 풀이 스트리밍.
 * - ANTHROPIC_API_KEY가 있으면(배포 사이트) Claude API로 부르고, 방문자별 하루 횟수 제한을 건다.
 * - 없으면(내 컴퓨터) 설치된 claude CLI를 구독 로그인으로 부른다.
 */
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

  const useApi = Boolean(process.env.ANTHROPIC_API_KEY);
  // 배포 사이트에서 API 키가 없으면 구독 CLI를 쓸 수 없으므로(서버에 없고, 약관상 남이 쓰게 할 수 없음) 막는다
  if (!useApi && isShareSite()) return Response.json({ code: "disabled", message: ERROR_MESSAGES.disabled }, { status: 503 });

  let refund: (() => Promise<void>) | null = null;
  let remaining: number | null = null;
  if (useApi) {
    const quota = await consumeQuota(request);
    if (!quota.ok) {
      const code = quota.reason === "exceeded" ? "quota" : "disabled";
      return Response.json({ code, message: ERROR_MESSAGES[code] }, { status: quota.reason === "exceeded" ? 429 : 503 });
    }
    refund = quota.refund;
    remaining = quota.remaining;
  }

  const userPrompt = buildUserPrompt(result, ilju);
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let gotText = false;
      const send = (event: InterpretEvent) => {
        if (event.type === "text") gotText = true;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          abort.abort();
        }
      };
      // 글이 한 줄도 오기 전에 실패하면 차감한 횟수를 되돌린다
      const sendWithRefund = (event: InterpretEvent) => {
        if (event.type === "error" && !gotText && refund) void refund();
        send(event);
      };
      const run = useApi
        ? runAnthropic({ systemPrompt: SYSTEM_PROMPT, userPrompt, model: process.env.CLAUDE_API_MODEL || undefined, signal: abort.signal }, sendWithRefund)
        : runClaude({ systemPrompt: SYSTEM_PROMPT, userPrompt, model: process.env.CLAUDE_MODEL || undefined, signal: abort.signal }, send);
      void run.finally(() => {
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

  const headers: Record<string, string> = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" };
  if (remaining !== null) headers["X-AI-Remaining"] = String(remaining);
  return new Response(stream, { headers });
}
