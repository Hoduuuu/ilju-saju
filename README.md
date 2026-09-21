# 일주 — 만세력 사주 (로컬 전용)

## 준비
1. Node.js 26, Claude Code 설치
2. 터미널에서 `claude` 실행 → `/login` (구독 계정). 이 사이트는 API 키가 아니라 이 로그인으로 풀이해요.
3. `npm install`

## 실행
```bash
npm run dev
```
브라우저에서 http://localhost:3000

## 테스트
```bash
npm test
```

## 일러스트
60일주 일러스트는 이미지 파일이 아니라 코드로 그려요(`lib/ilju/motifs.ts`).
- 모양은 일간 상징 10종, 색은 상징이 계열을 정하고 일지가 채도·명도를 조절해요.
- 일지마다 계절·시간대를 알려 주는 작은 표식이 붙어요.
- 색을 바꾸려면 `STEM_COLOR`(상징 기본색)나 `BRANCH_MODULATION`(일지 변주)만 고치면 돼요.
