export interface Place {
  id: string;
  province: string;
  city: string;
  longitude: number;
}

export const DEFAULT_PLACE_ID = "seoul";

export const PLACES: Place[] = [
  { id: "seoul", province: "서울", city: "서울", longitude: 126.978 },
  { id: "busan", province: "부산", city: "부산", longitude: 129.075 },
  { id: "daegu", province: "대구", city: "대구", longitude: 128.601 },
  { id: "incheon", province: "인천", city: "인천", longitude: 126.705 },
  { id: "gwangju", province: "광주", city: "광주", longitude: 126.853 },
  { id: "daejeon", province: "대전", city: "대전", longitude: 127.385 },
  { id: "ulsan", province: "울산", city: "울산", longitude: 129.311 },
  { id: "sejong", province: "세종", city: "세종", longitude: 127.289 },
  { id: "suwon", province: "경기", city: "수원", longitude: 127.029 },
  { id: "seongnam", province: "경기", city: "성남", longitude: 127.137 },
  { id: "goyang", province: "경기", city: "고양", longitude: 126.832 },
  { id: "yongin", province: "경기", city: "용인", longitude: 127.178 },
  { id: "bucheon", province: "경기", city: "부천", longitude: 126.766 },
  { id: "ansan", province: "경기", city: "안산", longitude: 126.831 },
  { id: "uijeongbu", province: "경기", city: "의정부", longitude: 127.034 },
  { id: "pyeongtaek", province: "경기", city: "평택", longitude: 127.112 },
  { id: "chuncheon", province: "강원", city: "춘천", longitude: 127.73 },
  { id: "wonju", province: "강원", city: "원주", longitude: 127.92 },
  { id: "gangneung", province: "강원", city: "강릉", longitude: 128.876 },
  { id: "cheongju", province: "충북", city: "청주", longitude: 127.489 },
  { id: "chungju", province: "충북", city: "충주", longitude: 127.926 },
  { id: "cheonan", province: "충남", city: "천안", longitude: 127.114 },
  { id: "gongju", province: "충남", city: "공주", longitude: 127.119 },
  { id: "asan", province: "충남", city: "아산", longitude: 127.002 },
  { id: "jeonju", province: "전북", city: "전주", longitude: 127.148 },
  { id: "gunsan", province: "전북", city: "군산", longitude: 126.737 },
  { id: "iksan", province: "전북", city: "익산", longitude: 126.957 },
  { id: "mokpo", province: "전남", city: "목포", longitude: 126.392 },
  { id: "yeosu", province: "전남", city: "여수", longitude: 127.662 },
  { id: "suncheon", province: "전남", city: "순천", longitude: 127.487 },
  { id: "pohang", province: "경북", city: "포항", longitude: 129.343 },
  { id: "gyeongju", province: "경북", city: "경주", longitude: 129.225 },
  { id: "andong", province: "경북", city: "안동", longitude: 128.729 },
  { id: "gumi", province: "경북", city: "구미", longitude: 128.344 },
  { id: "changwon", province: "경남", city: "창원", longitude: 128.681 },
  { id: "jinju", province: "경남", city: "진주", longitude: 128.108 },
  { id: "gimhae", province: "경남", city: "김해", longitude: 128.889 },
  { id: "jeju", province: "제주", city: "제주", longitude: 126.531 },
  { id: "seogwipo", province: "제주", city: "서귀포", longitude: 126.561 },
  { id: "other", province: "기타", city: "목록에 없음(한반도 평균)", longitude: 127.5 },
];

export function findPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function placesByProvince(): { province: string; places: Place[] }[] {
  const groups: { province: string; places: Place[] }[] = [];
  for (const place of PLACES) {
    const group = groups.find((g) => g.province === place.province);
    if (group) group.places.push(place);
    else groups.push({ province: place.province, places: [place] });
  }
  return groups;
}
