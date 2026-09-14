export function exportFileName(korean: string, kind: "summary" | "full", date: Date = new Date()): string {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `${korean}일주-${kind === "summary" ? "요약카드" : "전체결과"}-${ymd}.png`;
}

/**
 * Safari/iOS는 캔버스 한 변을 약 4096px로 제한한다. 긴 전체 결과를 내보낼 때
 * 그 한도를 넘기면 빈 이미지가 나오므로, 출력 높이가 4000px을 넘지 않도록
 * pixelRatio를 낮춘다 (최소 1, 기본 최대 2). 요약 카드처럼 크기가 고정된
 * 경우에는 항상 pixelRatio 1을 써서 1080×1920 크기를 정확히 유지한다.
 */
export function computePixelRatio(height: number, hasFixedSize: boolean): number {
  if (hasFixedSize) return 1;
  const maxScale = height > 0 ? 4000 / height : 2;
  return Math.max(1, Math.min(2, maxScale));
}

/**
 * `dataUrl`이 실제로 이미지를 담고 있는지 최소한으로 확인한다.
 * html-to-image는 캡처에 실패해도 예외를 던지지 않고 빈 캔버스나 "data:,"를
 * 반환할 수 있으므로, 별도로 검사해야 사용자에게 실패를 알릴 수 있다.
 */
export function isUsablePngDataUrl(dataUrl: string | null | undefined): boolean {
  if (!dataUrl) return false;
  if (dataUrl === "data:,") return false;
  if (!dataUrl.startsWith("data:image/")) return false;
  return dataUrl.length >= 1000;
}

export function triggerDownload(dataUrl: string, fileName: string, doc: Document): void {
  const link = doc.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  doc.body.appendChild(link);
  link.click();
  link.remove();
}

function waitForOneImage(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);
    const settle = () => {
      clearTimeout(timer);
      finish();
    };
    // 이미지가 깨졌거나(404) 로딩에 실패해도 캡처 자체는 막지 않는다 —
    // decode()가 reject되든 load/error 이벤트가 뭐든 오든 항상 settle한다.
    if (typeof img.decode === "function") {
      img.decode().then(settle, settle);
    } else if (img.complete) {
      settle();
    } else {
      img.addEventListener("load", settle, { once: true });
      img.addEventListener("error", settle, { once: true });
    }
  });
}

/**
 * `node` 내부의 모든 <img>가 로드(또는 실패) 완료될 때까지 기다린다.
 * 이미지 하나가 404 등으로 영원히 응답하지 않아도 저장 전체가 멈추지
 * 않도록 이미지별 타임아웃을 둔다.
 */
export async function waitForImagesLoaded(node: ParentNode, timeoutMs = 3000): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map((img) => waitForOneImage(img, timeoutMs)));
}

export async function downloadElementAsPng(node: HTMLElement, fileName: string, size?: { width: number; height: number }): Promise<void> {
  const { toPng } = await import("html-to-image");
  await document.fonts.ready;
  await waitForImagesLoaded(node);
  const pixelRatio = computePixelRatio(node.scrollHeight, Boolean(size));
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio,
    width: size?.width,
    height: size?.height,
    filter: (element) => !(element instanceof HTMLElement && element.dataset.exportIgnore === "true"),
  });
  if (!isUsablePngDataUrl(dataUrl)) {
    throw new Error(`PNG 캡처 결과가 비어 있어요 (length=${dataUrl?.length ?? 0})`);
  }
  triggerDownload(dataUrl, fileName, document);
}
