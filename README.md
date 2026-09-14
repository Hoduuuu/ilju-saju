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

## 일러스트 만들기 (선택)
이미지가 없어도 오행 도형 더미로 동작해요.

1. Cloudflare 대시보드 → Workers AI → "Use REST API"
   - Account ID를 복사해요.
   - "Create a Workers AI API Token"을 눌러 토큰을 만들어요.
2. `.env.example`을 `.env.local`로 복사하고 두 값을 붙여넣어요. 이 파일은 git에 올라가지 않아요.
3. 샘플 1장 만들기: `npm run images:sample -- gap-ja` → `public/ilju/_sample-gap-ja.png` 확인
4. 마음에 들면 기준으로 확정: `npx tsx scripts/generate-ilju-images.ts --accept-sample gap-ja`
5. 전체 생성: `npm run images:all`
   - 무료 한도(하루 1만 Neurons, 약 90장)를 넘으면 멈춰요. 다음 날 같은 명령으로 이어서 만들 수 있어요.
6. 대비 검사: `npm run images:check`
   - 실패한 것은 안내된 `images:only` 명령으로 다시 만들어요.
