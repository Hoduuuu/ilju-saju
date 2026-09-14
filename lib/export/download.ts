export function exportFileName(korean: string, kind: "summary" | "full", date: Date = new Date()): string {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `${korean}일주-${kind === "summary" ? "요약카드" : "전체결과"}-${ymd}.png`;
}

export async function downloadElementAsPng(node: HTMLElement, fileName: string, size?: { width: number; height: number }): Promise<void> {
  const { toPng } = await import("html-to-image");
  await document.fonts.ready;
  // Safari/iOS는 캔버스 한 변을 약 4096px로 제한한다. 긴 전체 결과를 내보낼 때
  // 그 한도를 넘기면 빈 이미지가 나오므로, 출력 높이가 4000px을 넘지 않도록
  // pixelRatio를 낮춘다 (최소 1, 기본 최대 2).
  const height = node.scrollHeight;
  const maxScale = height > 0 ? 4000 / height : 2;
  const pixelRatio = size ? 1 : Math.max(1, Math.min(2, maxScale));
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio,
    width: size?.width,
    height: size?.height,
    filter: (element) => !(element instanceof HTMLElement && element.dataset.exportIgnore === "true"),
  });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
