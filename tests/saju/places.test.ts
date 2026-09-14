import { describe, expect, it } from "vitest";
import { DEFAULT_PLACE_ID, PLACES, findPlace, placesByProvince } from "@/lib/saju/places";

describe("places", () => {
  it("id가 고유하고 경도가 한반도 범위다", () => {
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length);
    for (const p of PLACES) {
      expect(p.longitude).toBeGreaterThanOrEqual(124);
      expect(p.longitude).toBeLessThanOrEqual(132);
    }
  });

  it("기본 출생지는 서울이다", () => {
    expect(findPlace(DEFAULT_PLACE_ID)?.longitude).toBe(126.978);
  });

  it("시·도별로 묶는다", () => {
    const groups = placesByProvince();
    expect(groups[0].province).toBe("서울");
    expect(groups.flatMap((g) => g.places)).toHaveLength(PLACES.length);
  });
});
