import Anthropic from "@anthropic-ai/sdk";
import type { InterpretEvent } from "./claudeEvents";

/**
 * 배포 사이트용: Claude API(API 키)로 풀이를 스트리밍한다.
 * 로컬에서는 API 키가 없으면 이 함수 대신 claude CLI(구독)를 쓴다.
 *
 * - 모델: 기본 Claude Opus 5. 비용을 줄이려면 CLAUDE_API_MODEL에 claude-sonnet-5 등을 넣는다.
 * - 거절 대비: 안전 분류기가 요청을 거절하면 서버에서 권장 모델로 다시 돌리도록 fallbacks: "default"를 켠다.
 */
export const DEFAULT_API_MODEL = "claude-opus-5";

export interface RunAnthropicOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  signal?: AbortSignal;
  /** 테스트에서 가짜 클라이언트를 넣을 때 */
  client?: Anthropic;
}

export async function runAnthropic(options: RunAnthropicOptions, onEvent: (event: InterpretEvent) => void): Promise<void> {
  const client = options.client ?? new Anthropic();
  try {
    const stream = client.beta.messages.stream(
      {
        model: options.model || DEFAULT_API_MODEL,
        // 풀이 글(6~8천 자)과 생각 과정을 넉넉히 담는다. 스트리밍이라 시간 초과 걱정이 없다
        max_tokens: 32000,
        system: options.systemPrompt,
        messages: [{ role: "user", content: options.userPrompt }],
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      },
      { signal: options.signal },
    );

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        onEvent({ type: "text", text: event.delta.text });
      }
    }

    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") {
      onEvent({ type: "error", code: "failed", message: "이 요청은 풀이를 만들 수 없었어요. 입력을 확인해 주세요." });
      return;
    }
    onEvent({ type: "done" });
  } catch (error) {
    if (options.signal?.aborted) return;
    onEvent(toErrorEvent(error));
  }
}

function toErrorEvent(error: unknown): InterpretEvent {
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    console.error("[anthropic] 인증 실패", error.status);
    return { type: "error", code: "auth", message: "AI 서비스 설정에 문제가 있어요. 잠시 후 다시 시도해 주세요." };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { type: "error", code: "limit", message: "지금 요청이 많아요. 잠시 후 다시 시도해 주세요." };
  }
  if (error instanceof Anthropic.APIError) {
    console.error("[anthropic] API 오류", error.status, error.message);
    // 529(과부하)·5xx는 일시적인 문제다
    const busy = typeof error.status === "number" && error.status >= 500;
    return { type: "error", code: busy ? "limit" : "failed", message: busy ? "AI 서버가 잠시 붐벼요. 잠시 후 다시 시도해 주세요." : "풀이를 만들지 못했어요. 다시 시도해 주세요." };
  }
  console.error("[anthropic] 알 수 없는 오류", error);
  return { type: "error", code: "failed", message: "풀이를 만들지 못했어요. 다시 시도해 주세요." };
}
