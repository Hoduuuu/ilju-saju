import { calculateSaju, parseSajuInput } from "@/lib/saju/calculate";
import { SajuInputError } from "@/lib/saju/types";
import { isShareSite, saveSharedReading } from "@/lib/share/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 풀이 글 최대 길이. 정상 풀이는 1만 자 안팎이라 넉넉히 둔다 */
const MAX_INTERPRETATION = 40_000;

/** 로컬에서 만든 결과를 공유 링크로 저장한다. 공유 사이트(Vercel)에서는 막는다 */
export async function POST(request: Request): Promise<Response> {
  if (isShareSite()) return Response.json({ message: "공유 사이트에서는 새 공유 링크를 만들 수 없어요." }, { status: 403 });

  let body: { input?: unknown; interpretation?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "요청을 읽지 못했어요." }, { status: 400 });
  }
  const { interpretation } = body;
  if (typeof interpretation !== "string" || interpretation.trim().length === 0 || interpretation.length > MAX_INTERPRETATION) {
    return Response.json({ message: "공유할 풀이가 없어요." }, { status: 400 });
  }
  try {
    const input = parseSajuInput(body.input);
    calculateSaju(input);
    const id = await saveSharedReading(input, interpretation);
    return Response.json({ id });
  } catch (error) {
    if (error instanceof SajuInputError) return Response.json({ message: error.message }, { status: 400 });
    console.error("[share]", error);
    return Response.json({ message: "공유 링크를 만들지 못했어요. Supabase 설정을 확인해 주세요." }, { status: 500 });
  }
}
