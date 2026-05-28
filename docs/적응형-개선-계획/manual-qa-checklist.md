# 수동 QA 체크리스트 (Phase 5)

작성일: 2026-05-29
범위: `auth`, `client`, `lawyer`, `admin` 전체 화면
참고: [phases.md](./phases.md)

이 문서는 Phase 2~4 작업이 회귀를 일으키지 않았는지, 화면별 적응형 계약이 유지되는지 사람이 직접 확인하는 절차다. PR 머지 전, 또는 layout 관련 공통 컴포넌트(`ClientLayout`, `LawyerLayout`, `AdminLayout`, `AuthLayout`, `BottomNav`, `SideNav`, `PageHeader`)를 변경했을 때 실행한다.

## 0. 준비

1. `npm run dev` 실행
2. Chrome DevTools → Device Toolbar (`Ctrl+Shift+M`)
3. 다음 3개 viewport를 차례대로 검증한다.
   - `360x800` (Mobile, Galaxy S 계열)
   - `768x1024` (Tablet, iPad mini)
   - `1440x900` (Desktop, 13인치 노트북)
4. 각 화면에서 새로고침(`Ctrl+R`) 후 첫 paint와 스크롤 동작을 함께 확인한다.

## 1. Viewport 공통 체크 (모든 화면에 적용)

### `360x800` — Mobile
- [ ] 가로 스크롤바가 보이지 않는다 (`overflow-x` 누수 없음)
- [ ] bottom nav가 콘텐츠 위에 떠 있고 마지막 항목/CTA를 가리지 않는다
- [ ] sticky CTA(`app-sticky-mobile-cta`)가 bottom nav 위에 안정적으로 위치한다
- [ ] iOS Safari 시뮬레이션 시 safe-area 패딩이 적용된다 (`safe-area-bottom`)
- [ ] 긴 한국어 텍스트(이름, 전문분야, 파일명)가 줄바꿈/truncate 되며 카드 경계를 깨지 않는다
- [ ] 입력 focus 시 키보드가 입력창을 가리지 않는다 (chat / register / form)

### `768x1024` — Tablet
- [ ] 단일 컬럼이 너무 넓어져 한 줄 텍스트가 과도하게 늘어지지 않는다
- [ ] 2열 grid가 적용된 화면에서 카드 높이가 흔들리지 않는다
- [ ] bottom nav는 여전히 노출된다 (lg 이상에서만 사라짐)
- [ ] AdminLayout: `md` 이상에서 sidebar가 고정 노출되고 햄버거가 사라진다

### `1440x900` — Desktop
- [ ] `lg` 이상에서 `SideNav` (240px) 가 고정 노출되고 BottomNav는 숨겨진다
- [ ] main content 너비가 `--app-content-max-width` (80rem) 를 넘지 않는다
- [ ] 정보 탐색/대시보드 화면에 빈 공간이 과도하지 않다
- [ ] sticky CTA가 데스크톱에서는 inline 또는 side panel로 전환된 화면은 nav 아래로 떨어지지 않는다
- [ ] sidebar offset 누락으로 콘텐츠가 sidebar 아래로 깔리지 않는다

## 2. 화면별 체크리스트

### Auth (2)

#### `LoginPage` (`/login`)
- 모바일: 소셜 버튼 3개의 아이콘과 라벨이 좁은 폭에서 겹치지 않는다
- 태블릿/데스크톱: 컨테이너가 `sm:max-w-[448px]` 로 중앙 정렬된다
- 약관 링크 footer가 화면 하단에 고정되지 않고 자연 흐름 안에 있다

#### `RoleSelectPage` (`/role-select`)
- 카드 2개(USER/LAWYER)가 모바일에서 세로, 데스크톱에서 좌우 정렬되는지 확인
- 카드 hover/focus 상태가 키보드로도 접근 가능

### Client (5)

#### `HomePage` (`/home`)
- 모바일: 진행 중 상담/의뢰서 카드가 한 줄 영역을 넘지 않고 truncate 됨
- 데스크톱: BottomNav 숨김 + SideNav 노출, content가 max-width 안에서 적절히 배치됨

#### `NewConsultationPage` (`/consultations/new`)
- 모바일: 단계별 카테고리 선택 시 sticky CTA 노출
- 태블릿 이상: 선택 목록과 선택 결과가 2열로 보이는지 (Phase 2 완료 시)
- `max-w-[390px]` 고정 프레임이 잡혀 있지 않은지

#### `ChatPage` (`/consultations/:id`)
- 모바일: 채팅 입력창이 키보드와 충돌하지 않고 sticky로 유지됨
- 입력창 위에 진행률 / 액션 버튼이 겹치지 않음
- 데스크톱: 본문과 보조 패널(요약/다음 액션) 분리 여부 확인 (Phase 2 완료 시)
- 메시지 리스트가 chat-viewport 안에서만 스크롤 (전체 스크롤 발생 X)

#### `BriefDetailPage` (`/briefs/:id`)
- 모바일: 상단 PageHeader sticky, 본문 스크롤 부드러움
- 데스크톱: 요약 카드 / 본문 / 타임라인 분리 가능 여부

#### `LawyerListPage` (`/lawyers`)
- 모바일: 카드 단일 컬럼, 긴 변호사 이름/전문분야 chip wrapping
- 데스크톱: `md+` 카드 grid 또는 list+sidebar 구조

추가 화면 (시간 허용 시): `FinalReviewPage`, `LawyerProfilePage`, `RequestTrackingPage`

### Lawyer (4)

#### `DashboardPage` (`/lawyer`)
- 모바일: 통계 카드 세로 스택, BottomNav와 겹침 없음
- 데스크톱: 통계 카드 + 최근 의뢰 2열 (Phase 3 완료 시)

#### `InboxPage` (`/lawyer/inbox`)
- 모바일: 필터 chip wrapping, 카드 truncate
- 빈 상태 일러스트가 화면 중앙에 정상 표시
- 데스크톱: 목록이 과도하게 늘어나지 않고 max-width 적용

#### `InboxDetailPage` (`/lawyer/inbox/:id`)
- 모바일: 수락/거절 CTA가 BottomNav와 안전하게 분리됨
- 데스크톱: 본문 + 요약/액션 패널 분리 (Phase 3 완료 시)

#### `CasesPage` (`/lawyer/cases`)
- 진행 중 사건 카드가 데스크톱에서 너무 늘어나지 않음

### Admin (3)

#### `AdminDashboardPage` (`/admin`)
- 모바일: 햄버거로 sidebar drawer 열림/닫힘, backdrop 클릭으로 닫힘
- `md+`: sidebar 고정 노출, 햄버거 숨김
- 데스크톱: 통계 카드 4열 또는 강조 구조 (Phase 4 완료 시)

#### `LawyerPendingPage` (`/admin/lawyers`)
- 긴 이메일이 카드 폭을 깨지 않는다 (`min-w-0` + `truncate`)
- 검색/필터 영역과 목록이 데스크톱에서 자연스럽게 배치

#### `LawyerReviewPage` (`/admin/lawyers/:id`)
- 고정 높이 cell (`h-[20px]`, `h-[22px]`, `h-[76px]`) 가 긴 한국어 텍스트와 충돌하지 않는다
- 데스크톱: 기본 정보 / 제출 서류 / 자동 검증 / 처리 액션이 2컬럼 (Phase 4 완료 시)

## 3. 회귀 비교

Phase 0에서 캡처한 기준 이미지가 있다면 다음 항목을 비교한다.
- 동일 viewport에서 카드 높이/간격이 크게 변하지 않았는가
- sticky 요소(헤더, BottomNav, CTA) 위치가 일관된가
- 컬러/타이포 토큰이 변경 의도 외에 깨지지 않았는가

## 4. 모바일 브라우저 주소창 변화

- iOS Safari 시뮬레이션에서 페이지를 스크롤할 때 주소창이 줄어들면서 `100dvh` 기반 화면(`min-h-dvh`, `h-dvh`)이 자연스럽게 늘어나는지 확인
- ChatPage와 같이 입력창이 sticky인 화면에서 주소창 변화로 입력창이 사라지지 않는지 확인

## 5. 자동 검증 (PR 머지 전 필수)

```bash
npm run lint        # ESLint
npm run build       # tsc -b && vite build (타입체크 게이트)
npm test            # vitest run
```

핵심 layout 컴포넌트(`BottomNav`, `SideNav`, `PageHeader`, layouts) 를 변경했다면 관련 unit test도 함께 실행한다.

선택 사항 (인프라 준비 후):

```bash
npm run test:e2e          # Playwright 스크린샷 테스트 (3 viewport × 14 screen)
npm run test:e2e:update   # 기준 스크린샷 업데이트
```

## 6. 보고 양식

QA 진행 시 결과를 다음 표로 정리한다.

| 화면 | 360x800 | 768x1024 | 1440x900 | 비고 |
| ---- | ------- | -------- | -------- | ---- |
| LoginPage | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ | 발견 이슈 / PR 링크 |

이슈를 발견하면 GitHub Issue 또는 PR 코멘트로 화면 캡처와 함께 기록한다.
