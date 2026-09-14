import { describe, expect, it, vi } from "vitest";
import { computePixelRatio, exportFileName, isUsablePngDataUrl, triggerDownload, waitForImagesLoaded } from "@/lib/export/download";

describe("exportFileName", () => {
  it("일주·종류·날짜로 파일 이름을 만든다", () => {
    expect(exportFileName("갑자", "summary", new Date(2026, 8, 14))).toBe("갑자일주-요약카드-20260914.png");
    expect(exportFileName("계해", "full", new Date(2026, 0, 3))).toBe("계해일주-전체결과-20260103.png");
  });
});

describe("computePixelRatio", () => {
  it("크기가 고정된 요약 카드는 항상 pixelRatio 1을 쓴다", () => {
    expect(computePixelRatio(1920, true)).toBe(1);
    expect(computePixelRatio(200, true)).toBe(1);
  });

  it("높이가 낮으면 최대 2배까지 확대한다", () => {
    expect(computePixelRatio(1000, false)).toBe(2);
    expect(computePixelRatio(0, false)).toBe(2);
  });

  it("긴 전체 결과는 캔버스 한도(약 4000px)를 넘지 않도록 축소한다", () => {
    // height 8000 -> maxScale = 4000/8000 = 0.5 -> clamp to min 1
    expect(computePixelRatio(8000, false)).toBe(1);
    // height 5000 -> maxScale = 0.8 -> clamp to min 1
    expect(computePixelRatio(5000, false)).toBe(1);
    // height 2000 -> maxScale = 2 -> stays 2
    expect(computePixelRatio(2000, false)).toBe(2);
    // height 3000 -> maxScale ≈ 1.33
    expect(computePixelRatio(3000, false)).toBeCloseTo(4000 / 3000, 5);
  });
});

describe("isUsablePngDataUrl", () => {
  it("비어 있거나 너무 짧은 결과는 사용할 수 없다고 판단한다", () => {
    expect(isUsablePngDataUrl(undefined)).toBe(false);
    expect(isUsablePngDataUrl(null)).toBe(false);
    expect(isUsablePngDataUrl("")).toBe(false);
    expect(isUsablePngDataUrl("data:,")).toBe(false);
    expect(isUsablePngDataUrl("data:image/png;base64,AAAA")).toBe(false);
  });

  it("이미지 타입이 아니면 사용할 수 없다고 판단한다", () => {
    const long = "x".repeat(1000);
    expect(isUsablePngDataUrl(`data:text/plain;base64,${long}`)).toBe(false);
  });

  it("충분히 긴 PNG data URL은 사용 가능하다고 판단한다", () => {
    const long = "A".repeat(1000);
    expect(isUsablePngDataUrl(`data:image/png;base64,${long}`)).toBe(true);
  });
});

describe("triggerDownload", () => {
  it("다운로드용 <a> 엘리먼트를 만들어 클릭한 뒤 제거한다", () => {
    const clicked = vi.fn();
    const removed = vi.fn();
    const appended = vi.fn();
    const anchor = {
      href: "",
      download: "",
      click: clicked,
      remove: removed,
    };
    const fakeDoc = {
      createElement: vi.fn(() => anchor),
      body: { appendChild: appended },
    } as unknown as Document;

    triggerDownload("data:image/png;base64,AAAA", "test.png", fakeDoc);

    expect(fakeDoc.createElement).toHaveBeenCalledWith("a");
    expect(anchor.href).toBe("data:image/png;base64,AAAA");
    expect(anchor.download).toBe("test.png");
    expect(appended).toHaveBeenCalledWith(anchor);
    expect(clicked).toHaveBeenCalledOnce();
    expect(removed).toHaveBeenCalledOnce();
  });
});

function fakeImg(overrides: Partial<HTMLImageElement> = {}): HTMLImageElement {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    complete: false,
    addEventListener: vi.fn((event: string, handler: () => void) => {
      listeners[event] ??= [];
      listeners[event].push(handler);
    }),
    removeEventListener: vi.fn(),
    ...overrides,
  } as unknown as HTMLImageElement;
}

describe("waitForImagesLoaded", () => {
  it("모든 이미지의 decode()가 끝나면 resolve된다", async () => {
    const img1 = fakeImg({ decode: vi.fn(() => Promise.resolve()) });
    const img2 = fakeImg({ decode: vi.fn(() => Promise.resolve()) });
    const node = { querySelectorAll: vi.fn(() => [img1, img2]) } as unknown as ParentNode;

    await expect(waitForImagesLoaded(node, 3000)).resolves.toBeUndefined();
  });

  it("이미지가 404 등으로 decode()에서 실패해도 저장을 막지 않는다", async () => {
    const broken = fakeImg({ decode: vi.fn(() => Promise.reject(new Error("404"))) });
    const node = { querySelectorAll: vi.fn(() => [broken]) } as unknown as ParentNode;

    await expect(waitForImagesLoaded(node, 3000)).resolves.toBeUndefined();
  });

  it("이미지가 응답하지 않으면 타임아웃 후 resolve된다", async () => {
    vi.useFakeTimers();
    try {
      const hangingImg = fakeImg({ decode: vi.fn(() => new Promise<void>(() => {})) });
      const node = { querySelectorAll: vi.fn(() => [hangingImg]) } as unknown as ParentNode;

      const promise = waitForImagesLoaded(node, 3000);
      let settled = false;
      promise.then(() => {
        settled = true;
      });

      await vi.advanceTimersByTimeAsync(2999);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(2);
      expect(settled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("decode가 없는 환경에서는 load/error 이벤트를 기다린다", async () => {
    const img = fakeImg();
    const node = { querySelectorAll: vi.fn(() => [img]) } as unknown as ParentNode;

    const promise = waitForImagesLoaded(node, 3000);
    const addEventListener = img.addEventListener as unknown as ReturnType<typeof vi.fn>;
    expect(addEventListener).toHaveBeenCalledWith("load", expect.any(Function), { once: true });
    expect(addEventListener).toHaveBeenCalledWith("error", expect.any(Function), { once: true });

    const loadHandler = addEventListener.mock.calls.find((call) => call[0] === "load")?.[1] as () => void;
    loadHandler();

    await expect(promise).resolves.toBeUndefined();
  });
});
