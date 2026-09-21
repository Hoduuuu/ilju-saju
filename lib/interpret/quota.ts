import { createHash } from "node:crypto";

/**
 * AI 풀이(API) 하루 사용 횟수 제한.
 * - 방문자는 IP를 그대로 저장하지 않고, IP + 서버 비밀값을 섞은 해시로만 구분한다(원래 IP는 알 수 없다).
 * - 날짜는 한국 시간 기준으로 자정에 초기화된다.
 * - 횟수는 Supabase의 consume_ai_quota 함수가 원자적으로 센다(supabase/schema.sql).
 */
export const DAILY_AI_LIMIT = 4;

export type QuotaResult =
  | { ok: true; remaining: number; refund: () => Promise<void> }
  | { ok: false; reason: "exceeded" | "unavailable" };

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** 한국 시간 기준 오늘 날짜(YYYY-MM-DD) */
export function kstDay(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function visitorId(ip: string, secret: string): string {
  return createHash("sha256").update(`${ip}|${secret}`).digest("hex").slice(0, 32);
}

async function rpc(name: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/+$/, "")}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/** 한 번 쓸 수 있으면 1회 차감하고, 풀이가 실패하면 refund()로 되돌린다 */
export async function consumeQuota(request: Request): Promise<QuotaResult> {
  const secret = process.env.ANTHROPIC_API_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !secret) {
    console.error("[quota] Supabase 또는 API 키 설정이 없어 AI 풀이를 막았어요.");
    return { ok: false, reason: "unavailable" };
  }
  const visitor = visitorId(clientIp(request), secret);
  const day = kstDay();
  try {
    const response = await rpc("consume_ai_quota", { visitor_id: visitor, quota_day: day, max_uses: DAILY_AI_LIMIT });
    if (!response.ok) throw new Error(`consume_ai_quota ${response.status}: ${(await response.text()).slice(0, 200)}`);
    const remaining = (await response.json()) as number;
    if (remaining < 0) return { ok: false, reason: "exceeded" };
    return {
      ok: true,
      remaining,
      refund: async () => {
        await rpc("refund_ai_quota", { visitor_id: visitor, quota_day: day }).catch(() => undefined);
      },
    };
  } catch (error) {
    // 횟수를 셀 수 없으면 비용을 막기 위해 AI를 부르지 않는다
    console.error("[quota]", error);
    return { ok: false, reason: "unavailable" };
  }
}
