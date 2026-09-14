import { describe, expect, it } from "vitest";
import { classifyError, createClaudeEventParser } from "@/lib/interpret/claudeEvents";

const line = (o: unknown) => `${JSON.stringify(o)}\n`;
const delta = (text: string) => line({ type: "stream_event", event: { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } } });

describe("createClaudeEventParser", () => {
  it("텍스트 델타와 성공 결과", () => {
    const p = createClaudeEventParser();
    const all = [
      ...p.push(line({ type: "system", subtype: "init" })),
      ...p.push(delta("안녕") + delta("하세요").slice(0, 20)),
      ...p.push(delta("하세요").slice(20)),
      ...p.push(line({ type: "result", subtype: "success", is_error: false, result: "안녕하세요" })),
      ...p.flush(),
    ];
    expect(all).toEqual([{ type: "text", text: "안녕" }, { type: "text", text: "하세요" }, { type: "done" }]);
  });

  it("델타가 없었으면 result 텍스트를 대신 쓴다", () => {
    const p = createClaudeEventParser();
    expect(p.push(line({ type: "result", subtype: "success", is_error: false, result: "전체" }))).toEqual([
      { type: "text", text: "전체" },
      { type: "done" },
    ]);
  });

  it("로그인 안 됨은 auth 오류", () => {
    const p = createClaudeEventParser();
    const events = p.push(line({ type: "result", subtype: "success", is_error: true, result: "Not logged in · Please run /login" }));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "error", code: "auth" });
  });

  it("JSON이 아닌 줄은 무시한다", () => {
    expect(createClaudeEventParser().push("warning: something\n")).toEqual([]);
  });
});

describe("classifyError", () => {
  it("사용량 한도와 기타 오류", () => {
    expect(classifyError("Claude AI usage limit reached").code).toBe("limit");
    expect(classifyError("boom")).toMatchObject({ code: "failed" });
    expect(classifyError("boom").message).toContain("boom");
  });
});
