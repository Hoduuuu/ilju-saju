import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { POST } from "@/app/api/interpret/route";

const BIN = fileURLToPath(new URL("../fixtures/fake-claude.mjs", import.meta.url));
const input = { calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: null, gender: "male", placeId: "seoul" };

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/interpret", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

beforeEach(() => {
  process.env.CLAUDE_BIN = BIN;
  process.env.FAKE_CLAUDE_MODE = "ok";
});
afterEach(() => {
  delete process.env.CLAUDE_BIN;
  delete process.env.FAKE_CLAUDE_MODE;
  delete process.env.CLAUDE_MODEL;
});

describe("POST /api/interpret", () => {
  it("NDJSON 이벤트를 흘려보내고 프롬프트에 계산 결과를 담는다", async () => {
    const response = await post(input);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/x-ndjson");
    const events = (await response.text()).trim().split("\n").map((l) => JSON.parse(l));
    expect(events.at(-1)).toEqual({ type: "done" });
    const text = events.filter((e) => e.type === "text").map((e) => e.text).join("");
    expect(text).toContain("일주 庚辰");
    expect(text).toContain("notime 섹션을 반드시 쓴다");
  });

  it("잘못된 입력은 400", async () => {
    const response = await post({ ...input, month: 13 });
    expect(response.status).toBe(400);
    expect((await response.json()).message).toContain("생년월일");
  });

  it("CLAUDE_MODEL이 빈 문자열이면 기본 모델(sonnet)을 사용한다", async () => {
    process.env.CLAUDE_MODEL = "";
    const response = await post(input);
    const events = (await response.text()).trim().split("\n").map((l) => JSON.parse(l));
    const text = events.filter((e) => e.type === "text").map((e) => e.text).join("");
    expect(text).toContain("--model|sonnet");
  });
});
