import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ART_TOP, BAND_EXTENT, VIEW_H, VIEW_W, motifSvg } from "@/lib/ilju/motifs";
import type { Motif } from "@/lib/ilju/stems";

/** 카카오톡 등에 링크를 보냈을 때 보이는 미리보기 이미지(1200×630) */
export const alt = "나와 닮은 자연을 찾아볼까요 — 만세력 사주와 60일주 도감";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const svgUri = (motif: Motif, viewBox: string, preserve: string) =>
  `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="${preserve}">${motifSvg(motif, null, `og${motif}`, { marker: false })}</svg>`,
  ).toString("base64")}`;

export default async function Image() {
  const [black, semibold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Black.otf")),
    readFile(join(process.cwd(), "assets/fonts/Pretendard-SemiBold.otf")),
  ]);
  const artH = VIEW_H - ART_TOP;
  const bandW = BAND_EXTENT.right - BAND_EXTENT.left;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#F8F8F8", fontFamily: "Pretendard" }}>
        {/* 아래 먼 산 능선이 화면 폭을 채우고, 오른쪽에 나무가 선다 */}
        <img src={svgUri("mountain", `${BAND_EXTENT.left} ${ART_TOP} ${bandW} ${artH}`, "xMidYMax slice")} width={1200} height={230} style={{ position: "absolute", left: 0, bottom: 0 }} alt="" />
        {/* 오른쪽 위에 작은 해. 해 아래 가로선은 빼고 원만 잘라 보여 준다(원: 중심 190,348 · 반지름 104) */}
        <img src={svgUri("sun", "82 240 216 216", "xMidYMid meet")} width={100} height={100} style={{ position: "absolute", right: 330, top: 79 }} alt="" />
        <img src={svgUri("tree", `0 ${ART_TOP} ${VIEW_W} ${artH}`, "xMaxYMax meet")} width={360} height={264} style={{ position: "absolute", right: 40, bottom: 120 }} alt="" />

        <div style={{ display: "flex", flexDirection: "column", padding: "72px 80px" }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#6B6560", letterSpacing: 2 }}>ILJU · 만세력</div>
          <div style={{ marginTop: 20, fontSize: 76, fontWeight: 900, color: "#1F1A1A", lineHeight: 1.18, letterSpacing: -2, display: "flex", flexDirection: "column" }}>
            <span>나와 닮은 자연을</span>
            <span>찾아볼까요</span>
          </div>
          <div style={{ marginTop: 24, fontSize: 28, fontWeight: 600, color: "#5B6170" }}>생년월일로 사주를 계산하고, 나를 닮은 자연을 알려 드려요</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: black, weight: 900, style: "normal" },
        { name: "Pretendard", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
