import { afterEach, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { runClaude } from "@/lib/interpret/runClaude";
import type { InterpretEvent } from "@/lib/interpret/claudeEvents";

const BIN = fileURLToPath(new URL("../fixtures/fake-claude.mjs", import.meta.url));

async function collect(mode: string, extra: Partial<Parameters<typeof runClaude>[0]> = {}) {
  process.env.FAKE_CLAUDE_MODE = mode;
  const events: InterpretEvent[] = [];
  await runClaude({ systemPrompt: "SYS", userPrompt: "사용자 질문", bin: BIN, ...extra }, (e) => events.push(e));
  return events;
}

const textOf = (events: InterpretEvent[]) => events.map((e) => (e.type === "text" ? e.text : "")).join("");

afterEach(() => {
  delete process.env.FAKE_CLAUDE_MODE;
  delete process.env.ANTHROPIC_API_KEY;
});

describe("runClaude", () => {
  it("stdin으로 프롬프트를 넘기고, API 키를 빼고, 필요한 옵션으로 실행한다", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    const events = await collect("ok");
    const text = textOf(events);
    expect(text).toContain("STDIN:사용자 질문");
    expect(text).toContain("LEAKED:false");
    expect(text).toContain("-p|--output-format|stream-json|--verbose|--include-partial-messages|--tools||--no-session-persistence");
    expect(text).toContain("--strict-mcp-config");
    expect(text).toContain("--setting-sources|project|--model|sonnet|--system-prompt|SYS");
    expect(events.at(-1)).toEqual({ type: "done" });
    expect(events.filter((e) => e.type !== "text")).toHaveLength(1);
  });

  it("로그인 안 됨", async () => {
    const events = await collect("auth");
    expect(events.at(-1)).toMatchObject({ type: "error", code: "auth" });
  });

  it("비정상 종료", async () => {
    const events = await collect("exit1");
    expect(events.at(-1)).toMatchObject({ type: "error", code: "failed" });
  });

  it("시간 초과", async () => {
    const events = await collect("hang", { timeoutMs: 300 });
    expect(events).toEqual([{ type: "error", code: "timeout", message: expect.any(String) }]);
  });

  it("중단하면 종료 이벤트 없이 끝난다", async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);
    const events = await collect("hang", { signal: controller.signal, timeoutMs: 5_000 });
    expect(events).toEqual([]);
  });

  it("실행 파일이 없으면 not_installed", async () => {
    const events = await collect("ok", { bin: "/nonexistent/claude" });
    expect(events).toEqual([{ type: "error", code: "not_installed", message: expect.any(String) }]);
  });

  it("이미 중단된 신호면 실행하지 않고 끝난다", async () => {
    const controller = new AbortController();
    controller.abort();
    const events = await collect("ok", { signal: controller.signal, bin: "/nonexistent/claude" });
    expect(events).toEqual([]);
  });
});
