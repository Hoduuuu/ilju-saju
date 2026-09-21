import type { SajuInput } from "@/lib/saju/types";

/**
 * 공유 링크 저장소(Supabase).
 * - 저장: 내 컴퓨터(로컬)에서만, 비밀 키(SUPABASE_SECRET_KEY)로 표에 한 건 넣는다.
 * - 읽기: 공유 사이트에서 공개 키로 get_shared_reading 함수를 불러 링크 ID 한 건만 꺼낸다.
 *   표 자체에는 읽기 권한을 주지 않아, 링크를 모르는 사람은 목록을 볼 수 없다.
 */
export interface SharedReading {
  id: string;
  input: SajuInput;
  interpretation: string;
  createdAt: string;
}

const ID_LENGTH = 10;
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
export const SHARE_ID_PATTERN = new RegExp(`^[${ID_ALPHABET}]{${ID_LENGTH}}$`);

/** 헷갈리는 글자(0/O, 1/l/I)를 뺀 10자리 무작위 ID */
export function createShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았어요.");
  return url.replace(/\/+$/, "");
}

export async function saveSharedReading(input: SajuInput, interpretation: string): Promise<string> {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY가 설정되지 않았어요.");
  const id = createShareId();
  const response = await fetch(`${supabaseUrl()}/rest/v1/shared_readings`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ id, input, interpretation }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`공유 저장 실패 (${response.status}): ${(await response.text()).slice(0, 200)}`);
  return id;
}

export async function loadSharedReading(id: string): Promise<SharedReading | null> {
  if (!SHARE_ID_PATTERN.test(id)) return null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 설정되지 않았어요.");
  const response = await fetch(`${supabaseUrl()}/rest/v1/rpc/get_shared_reading`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ reading_id: id }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`공유 불러오기 실패 (${response.status}): ${(await response.text()).slice(0, 200)}`);
  const rows = (await response.json()) as { id: string; input: SajuInput; interpretation: string; created_at: string }[];
  const row = rows[0];
  return row ? { id: row.id, input: row.input, interpretation: row.interpretation, createdAt: row.created_at } : null;
}

/** Vercel에서 돌고 있으면 공유 사이트다. 공유 사이트에서는 AI를 부르지 않고 공유 저장도 하지 않는다 */
export function isShareSite(): boolean {
  return Boolean(process.env.VERCEL);
}
