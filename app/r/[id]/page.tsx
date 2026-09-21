import { notFound } from "next/navigation";
import SharedResult from "@/components/result/SharedResult";
import { loadSharedReading } from "@/lib/share/store";
import { parseSajuInput } from "@/lib/saju/calculate";

// 공유 링크는 저장된 뒤에 생기므로 요청할 때마다 Supabase에서 읽는다
export const dynamic = "force-dynamic";

async function load(id: string) {
  const reading = await loadSharedReading(id);
  if (!reading) return null;
  try {
    return { input: parseSajuInput(reading.input), interpretation: reading.interpretation };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await load(id);
  return { title: reading ? `${reading.input.name}님의 사주 · 일주` : "공유된 사주" };
}

export default async function SharedReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await load(id);
  if (!reading) notFound();
  return <SharedResult input={reading.input} interpretation={reading.interpretation} />;
}
