# Playwright E2E — 적응형 회귀 방지

Phase 5 의 일부로 도입된 viewport 별 스크린샷 회귀 테스트.

## 구조

```
tests/e2e/
├─ fixtures/
│   ├─ mockData.ts        # 화면별 mock payload (MSW handlers 와 동일 shape)
│   └─ mockApi.ts         # page.route 기반 API stub + localStorage 토큰 주입
├─ screenshots/
│   └─ adaptive-layouts.spec.ts   # 14 screen × 3 viewport
└─ README.md
```

## 실행

```bash
# 최초 1회 — 브라우저 binary 설치
npx playwright install --with-deps chromium

# 베이스라인 생성/갱신
npm run test:e2e:update

# 회귀 확인
npm run test:e2e
```

dev server 가 자동 기동되며 `http://localhost:5174` 를 사용한다. 이미 켜져 있다면 `playwright.config.ts` 의 `reuseExistingServer` 가 재사용한다.

## viewport 매트릭스

| project          | 너비 × 높이 | 용도                                    |
| ---------------- | ----------- | --------------------------------------- |
| `mobile-360`     | 360 × 800   | 모바일 최소폭 — BottomNav, sticky CTA   |
| `tablet-768`     | 768 × 1024  | 태블릿 — AdminLayout sidebar 전환 경계  |
| `desktop-1440`   | 1440 × 900  | 데스크톱 — SideNav 노출, max-width 정책 |

## 캡처 대상 (14 screens)

`phases.md §Phase 5` 의 초기 대상 (auth 2, client 5, lawyer 4, admin 3) 와 정합.

## 운영 정책

- 초기에는 visual regression 을 **warning 용도**로만 사용한다 (CI gate 아님).
- layout 깨짐이 안정화되면 `.github/workflows/` 에 e2e job 을 추가하고 gate 로 승격한다.
- false positive 가 자주 발생하는 화면은 `expect.toHaveScreenshot` 의 `mask` 또는 `clip` 옵션을 활용해 동적 영역을 제외한다.

## 새 화면 추가

1. `adaptive-layouts.spec.ts` 의 `SCREENS` 배열에 `{ name, role, url, waitFor }` 항목 추가
2. 필요한 mock 이 부족하면 `mockApi.ts` 에 핸들러 추가
3. `npm run test:e2e:update` 로 3 viewport baseline 생성
4. PR 에 baseline png 포함

## diff 발생 시

1. `test-results/` 에서 `actual.png`, `diff.png` 확인
2. 의도된 변경이면 `npm run test:e2e:update` 로 baseline 갱신 후 PR 에 포함
3. 회귀라면 코드 수정
