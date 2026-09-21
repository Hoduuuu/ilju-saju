import { createLineSplitter } from "./lines";

export type InterpretErrorCode = "not_installed" | "auth" | "limit" | "timeout" | "failed" | "disabled" | "quota";

export type InterpretEvent =
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; code: InterpretErrorCode; message: string };

export const ERROR_MESSAGES: Record<InterpretErrorCode, string> = {
  not_installed: "claude 명령어를 찾을 수 없어요. Claude Code가 설치되어 있는지 확인해 주세요.",
  auth: "Claude Code 로그인이 필요해요. 터미널에서 claude를 실행해 /login 한 뒤 다시 시도해 주세요.",
  limit: "Claude 사용량 한도에 도달했어요. 잠시 후 다시 시도해 주세요.",
  timeout: "풀이가 2분을 넘겨서 중단했어요. 다시 시도해 주세요.",
  failed: "풀이를 만들지 못했어요. 다시 시도해 주세요.",
  disabled: "지금은 AI 풀이를 불러올 수 없어요. 사주 계산과 일주 도감은 그대로 볼 수 있어요.",
  quota: "AI 풀이는 하루 4번까지 볼 수 있어요. 오늘은 모두 사용했어요. 내일 다시 이용해 주세요.",
};

export function classifyError(raw: string): { code: InterpretErrorCode; message: string } {
  if (/not logged in|\/login|log in|authenticat|oauth|credential|unauthorized|\b401\b/i.test(raw)) {
    return { code: "auth", message: ERROR_MESSAGES.auth };
  }
  if (/usage limit|rate limit|limit reached|quota|\b429\b|overloaded/i.test(raw)) {
    return { code: "limit", message: ERROR_MESSAGES.limit };
  }
  const detail = raw.trim().slice(0, 120);
  return { code: "failed", message: detail ? `${ERROR_MESSAGES.failed} (${detail})` : ERROR_MESSAGES.failed };
}

interface ClaudeLine {
  type?: string;
  subtype?: string;
  is_error?: boolean;
  result?: unknown;
  event?: { type?: string; delta?: { type?: string; text?: unknown } };
}

export function createClaudeEventParser(): { push(chunk: string): InterpretEvent[]; flush(): InterpretEvent[] } {
  const splitter = createLineSplitter();
  let streamedText = false;

  const handle = (line: string): InterpretEvent[] => {
    let message: ClaudeLine;
    try {
      message = JSON.parse(line) as ClaudeLine;
    } catch {
      return [];
    }
    const delta = message.event?.delta;
    if (message.type === "stream_event" && message.event?.type === "content_block_delta" && delta?.type === "text_delta" && typeof delta.text === "string") {
      streamedText = true;
      return [{ type: "text", text: delta.text }];
    }
    if (message.type === "result") {
      if (message.is_error || message.subtype !== "success") {
        return [{ type: "error", ...classifyError(String(message.result ?? message.subtype ?? "")) }];
      }
      const fallback: InterpretEvent[] = !streamedText && typeof message.result === "string" && message.result ? [{ type: "text", text: message.result }] : [];
      return [...fallback, { type: "done" }];
    }
    return [];
  };

  return {
    push: (chunk) => splitter.push(chunk).flatMap(handle),
    flush: () => splitter.flush().flatMap(handle),
  };
}
