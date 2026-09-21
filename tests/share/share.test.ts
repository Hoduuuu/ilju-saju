import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as sharePost } from "@/app/api/share/route";
import { POST as interpretPost } from "@/app/api/interpret/route";
import { SHARE_ID_PATTERN, createShareId, loadSharedReading } from "@/lib/share/store";

const input = { name: "테스트", calendar: "solar", isLeapMonth: false, year: 1990, month: 5, day: 15, time: null, gender: "male", placeId: "seoul" };
const request = (url: string, body: unknown) =>
  new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

afterEach(() => {
  delete process.env.VERCEL;
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  vi.unstubAllGlobals();
});

describe("공유 링크 ID", () => {
  it("헷갈리는 글자 없이 10자리로 만든다", () => {
    for (let i = 0; i < 50; i += 1) expect(createShareId()).toMatch(SHARE_ID_PATTERN);
  });

  it("형식이 틀린 ID는 Supabase를 부르지 않고 없음으로 본다", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await loadSharedReading("../../etc")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("공유 사이트(Vercel)", () => {
  it("AI 풀이를 부르지 않고 disabled 안내를 돌려준다", async () => {
    process.env.VERCEL = "1";
    const response = await interpretPost(request("http://localhost/api/interpret", input));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("disabled");
  });

  it("새 공유 링크를 만들 수 없다", async () => {
    process.env.VERCEL = "1";
    const response = await sharePost(request("http://localhost/api/share", { input, interpretation: "풀이" }));
    expect(response.status).toBe(403);
  });
});

describe("POST /api/share (로컬)", () => {
  it("풀이가 비어 있으면 저장하지 않는다", async () => {
    const response = await sharePost(request("http://localhost/api/share", { input, interpretation: "  " }));
    expect(response.status).toBe(400);
  });

  it("비밀 키로 한 건 저장하고 ID를 돌려준다", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    const fetchSpy = vi.fn(async () => new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchSpy);
    const response = await sharePost(request("http://localhost/api/share", { input, interpretation: "## [summary]\n키워드: 사색" }));
    expect(response.status).toBe(200);
    const { id } = await response.json();
    expect(id).toMatch(SHARE_ID_PATTERN);
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/rest/v1/shared_readings");
    expect((init.headers as Record<string, string>).apikey).toBe("sb_secret_test");
    expect(JSON.parse(init.body as string)).toMatchObject({ id, input: { name: "테스트" } });
  });
});
