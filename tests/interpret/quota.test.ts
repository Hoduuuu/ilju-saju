import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/interpret/route";
import { DAILY_AI_LIMIT, kstDay, visitorId } from "@/lib/interpret/quota";

const input = { name: "테스트", calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: null, gender: "male", placeId: "seoul" };
const post = () =>
  POST(
    new Request("http://localhost/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
      body: JSON.stringify(input),
    }),
  );

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  vi.unstubAllGlobals();
});

describe("하루 AI 횟수 제한", () => {
  it("하루 4번이다", () => {
    expect(DAILY_AI_LIMIT).toBe(4);
  });

  it("한국 시간 자정에 날짜가 바뀐다", () => {
    expect(kstDay(new Date("2026-09-21T14:59:00Z"))).toBe("2026-09-21");
    expect(kstDay(new Date("2026-09-21T15:00:00Z"))).toBe("2026-09-22");
  });

  it("IP를 그대로 저장하지 않고 비밀값을 섞은 해시로 바꾼다", () => {
    const id = visitorId("203.0.113.7", "secret-a");
    expect(id).not.toContain("203");
    expect(id).toHaveLength(32);
    expect(visitorId("203.0.113.7", "secret-a")).toBe(id);
    expect(visitorId("203.0.113.7", "secret-b")).not.toBe(id);
  });

  it("오늘 횟수를 다 쓰면 AI를 부르지 않고 quota 안내를 돌려준다", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    const fetchSpy = vi.fn(async () => Response.json(-1));
    vi.stubGlobal("fetch", fetchSpy);
    const response = await post();
    expect(response.status).toBe(429);
    expect((await response.json()).code).toBe("quota");
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/rest/v1/rpc/consume_ai_quota");
    expect(JSON.parse(init.body as string)).toMatchObject({ max_uses: 4 });
  });

  it("횟수를 셀 수 없으면(Supabase 오류) 비용을 막기 위해 AI를 부르지 않는다", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const response = await post();
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("disabled");
  });
});
