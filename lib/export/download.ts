export function exportFileName(korean: string, kind: "summary" | "full", date: Date = new Date()): string {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `${korean}일주-${kind === "summary" ? "요약카드" : "전체결과"}-${ymd}.png`;
}

export async function downloadElementAsPng(node: HTMLElement, fileName: string, size?: { width: number; height: number }): Promise<void> {
  const { toPng } = await import("html-to-image");
  await document.fonts.ready;
  const tooTall = node.scrollHeight * 2 > 16_000;
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: (size || tooTall) ? 1 : 2,
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
