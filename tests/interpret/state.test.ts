import { describe, expect, it } from "vitest";
import { INITIAL_INTERPRET_STATE, interpretReducer } from "@/lib/interpret/state";

describe("interpretReducer", () => {
  it("시작 → 텍스트 누적 → 완료", () => {
    let s = interpretReducer(INITIAL_INTERPRET_STATE, { type: "start" });
    s = interpretReducer(s, { type: "event", event: { type: "text", text: "안녕" } });
    s = interpretReducer(s, { type: "event", event: { type: "text", text: "하세요" } });
    expect(s).toEqual({ status: "streaming", text: "안녕하세요", error: null });
    s = interpretReducer(s, { type: "event", event: { type: "done" } });
    expect(s.status).toBe("done");
  });

  it("오류가 나도 받은 텍스트는 유지한다", () => {
    let s = interpretReducer(INITIAL_INTERPRET_STATE, { type: "start" });
    s = interpretReducer(s, { type: "event", event: { type: "text", text: "일부" } });
    s = interpretReducer(s, { type: "event", event: { type: "error", code: "timeout", message: "시간 초과" } });
    expect(s).toEqual({ status: "error", text: "일부", error: { code: "timeout", message: "시간 초과" } });
  });

  it("네트워크 오류", () => {
    const s = interpretReducer(INITIAL_INTERPRET_STATE, { type: "networkError", message: "끊김" });
    expect(s.error).toEqual({ code: "failed", message: "끊김" });
  });
});
