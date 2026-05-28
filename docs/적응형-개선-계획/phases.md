# 적응형 UI/UX 개선 Phase 계획

작성일: 2026-05-29  
범위: `auth`, `client`, `lawyer`, `admin` 전체 프론트엔드 화면  
참고 문서: [변호사 전용 페이지 UI/UX 정합성 감사](../lawyer-ui-ux-consistency-audit.md)

## 개요

현재 앱은 모바일 우선 화면 구현은 비교적 잘 되어 있지만, 전체적으로는 완전한 적응형 UI라기보다 "모바일 앱 프레임을 데스크톱에서 가운데 배치"한 화면이 많다. 일부 화면만 데스크톱 사이드바, 2열 그리드, drawer 전환을 적용하고 있어 태블릿과 데스크톱에서 공간 활용, 정보 밀도, sticky CTA 겹침, 가로 overflow 리스크가 남아 있다.

이 문서는 전체 앱을 단계적으로 적응형화하기 위한 실행 계획이다. 목표는 모바일 품질을 유지하면서 태블릿과 데스크톱에서 화면별 목적에 맞는 레이아웃을 제공하는 것이다.

## 공통 원칙

- 최소 지원 폭은 `320px`로 유지하고, 모든 화면에서 가로 스크롤이 생기지 않도록 한다.
- 기본 breakpoint는 Tailwind 기준 `sm`, `md`, `lg`, `xl`을 사용한다.
- 모바일은 단일 컬럼과 하단 nav 중심, 태블릿은 1~2컬럼 혼합, 데스크톱은 sidebar와 2컬럼 또는 master-detail 배치를 기본값으로 삼는다.
- `safe-area-top`, `safe-area-bottom`, bottom nav, sticky CTA가 같은 화면에 있을 때는 공통 spacing 규칙을 사용한다.
- `body` 또는 layout 수준의 `overflow-x: hidden`에 의존해 문제를 숨기지 않고, 컴포넌트 단위에서 `min-w-0`, wrapping, truncation, grid constraints를 명시한다.
- 정보 탐색 화면은 데스크톱에서 지나치게 좁은 단일 컬럼으로 남기지 않는다.
- 입력, 채팅, 상세 확인처럼 모바일 집중도가 높은 화면도 데스크톱에서는 보조 패널이나 요약 패널을 둘 수 있는 구조로 확장한다.

## Phase 0. 기준 측정

목표: 현재 반응형 상태를 화면별로 고정하고, 개선 전후 비교 기준을 만든다.

주요 작업:

- 주요 화면을 `360x800`, `768x1024`, `1440x900` 기준으로 캡처하거나 수동 QA한다.
- `max-w-[390px]` 사용처를 목록화하고, 유지할 화면과 확장할 화면을 분리한다.
- `overflow-x-auto`, `overflow-x-hidden`, `overflow-hidden` 사용처를 점검해 의도된 스크롤인지 확인한다.
- bottom nav와 sticky CTA가 함께 있는 화면을 목록화한다.
- 각 화면별 문제를 `모바일`, `태블릿`, `데스크톱` 열로 나누어 기록한다.

점검 대상:

- Auth: `LoginPage`, `RoleSelectPage`, `ClientRegisterPage`, `LawyerRegisterPage`
- Client: `HomePage`, `NewConsultationPage`, `ChatPage`, `BriefDetailPage`, `FinalReviewPage`, `LawyerListPage`, `LawyerProfilePage`, `RequestTrackingPage`
- Lawyer: `DashboardPage`, `InboxPage`, `InboxDetailPage`, `CasesPage`, `LawyerProfilePage`, `VerificationPage`, `DocumentsPage`
- Admin: `AdminDashboardPage`, `LawyerPendingPage`, `LawyerReviewPage`, `LogsPage`

완료 기준:

- viewport별 캡처 또는 QA 메모가 존재한다.
- `max-w-[390px]`, `overflow-x-*`, sticky CTA 사용처 목록이 존재한다.
- Phase 1 이후 회귀 비교에 사용할 대표 화면이 정해져 있다.

## Phase 1. 공통 Shell/Layout 정리

목표: 화면별 임시 대응을 줄이고, 전체 앱이 같은 viewport, scroll, navigation 계약을 따르게 한다.

주요 작업:

- `ClientLayout`, `LawyerLayout`, `AuthLayout`, `AdminLayout`의 역할을 문서화하고 중복된 viewport 처리 방식을 정리한다.
- `h-dvh`, `min-h-dvh`, 내부 `overflow-y-auto`, `min-h-0` 사용 규칙을 통일한다.
- `ClientLayout`의 `overflow-x-auto`는 원칙적으로 제거하고, 필요한 경우 특정 컴포넌트 내부에서만 가로 스크롤을 허용한다.
- 모바일 bottom nav 높이, safe-area, sticky CTA를 위한 공통 padding 토큰 또는 utility를 정의한다.
- `PageHeader`, `Header`, `LawyerHeader`의 높이와 sticky 기준을 맞춘다.
- desktop sidebar가 있는 `lg` 이상 화면에서 페이지 내부 최대 폭 정책을 정한다.

완료 기준:

- 모바일에서 bottom nav가 콘텐츠와 겹치지 않는다.
- sticky CTA가 iOS safe-area와 bottom nav 위에 안정적으로 배치된다.
- 데스크톱에서 layout 자체 때문에 불필요한 가로 스크롤이 생기지 않는다.
- 공통 layout 변경 후 `npm run lint`, `npm run build`가 통과한다.

## Phase 2. 클라이언트 핵심 플로우 적응형화

목표: 클라이언트 주요 여정을 모바일 고정 프레임에서 실제 적응형 화면으로 확장한다.

주요 작업:

- `NewConsultationPage`의 `max-w-[390px]` 고정 프레임을 해소하고, 태블릿 이상에서 선택 목록과 선택 결과를 2열로 배치한다.
- `ChatPage`는 모바일 채팅 경험을 유지하되, 데스크톱에서 상담 진행률, 요약, 다음 액션을 보조 패널로 분리할 수 있는 구조로 바꾼다.
- `BriefDetailPage`, `FinalReviewPage`, `RequestTrackingPage`는 데스크톱에서 요약 카드와 본문/타임라인을 분리한다.
- `LawyerListPage`는 `md` 이상에서 카드 grid 또는 list + filter/sidebar 구조를 제공한다.
- `LawyerProfilePage`는 데스크톱에서 프로필 요약, 경력, 전문분야, CTA 영역을 한 화면에서 스캔 가능하게 재배치한다.
- 모바일에서 사용하는 sticky CTA는 유지하되, 데스크톱에서는 inline 또는 side panel CTA로 전환한다.

완료 기준:

- 클라이언트 핵심 화면에서 `1440x900` 기준으로 390px 단일 프레임만 보이는 화면이 사라진다.
- `360x800`에서 기존 모바일 사용성이 유지된다.
- `768x1024`에서 주요 카드와 CTA가 과도하게 늘어나거나 겹치지 않는다.
- 채팅과 문서 상세 화면에서 입력 영역, CTA, safe-area가 충돌하지 않는다.

## Phase 3. 변호사 화면 적응형 개선

목표: 변호사 업무 화면의 단일 컬럼 한계를 줄이고, 데스크톱에서 업무 처리 속도를 높인다.

주요 작업:

- `DashboardPage`는 데스크톱에서 통계 카드와 최근 의뢰 목록을 2열로 구성한다.
- `InboxPage`는 필터, 목록, 빈 상태를 데스크톱 폭에 맞게 재배치하고, 긴 제목과 상태 pill wrapping을 점검한다.
- `InboxDetailPage`는 상세 본문과 의뢰 요약/액션 패널을 분리한다.
- `CasesPage`는 진행 중 사건 목록이 넓은 화면에서 지나치게 늘어나지 않도록 카드 grid 또는 summary + list 구조를 검토한다.
- `LawyerProfilePage`, `VerificationPage`, `DocumentsPage`는 `max-w-3xl` 단일 컬럼을 유지할지, `lg` 이상에서 보조 패널을 둘지 화면 목적별로 결정한다.
- `bottom-20`, `pb-24`, `pb-28` 등 화면별 spacing 값을 공통 규칙으로 치환한다.

완료 기준:

- `1440x900`에서 변호사 dashboard와 inbox가 업무용 화면답게 정보 밀도를 가진다.
- `InboxDetailPage`의 수락/거절 CTA가 모바일 nav와 겹치지 않는다.
- `max-w-3xl`은 의도된 읽기 폭으로만 사용되고, 목록/대시보드 화면에는 적절한 확장 레이아웃이 적용된다.

## Phase 4. 관리자 화면 정보 구조 개선

목표: 관리자 화면의 모바일 drawer 구조는 유지하면서, `md+`에서 검토 업무에 맞는 정보 구조를 제공한다.

주요 작업:

- `AdminLayout`의 `md` sidebar 전환은 유지하되, main content의 최대 폭과 grid 정책을 정한다.
- `AdminDashboardPage` 통계 카드는 `md` 이상에서 4열 배치 또는 주요 카드 강조 구조로 확장한다.
- `LawyerPendingPage`는 데스크톱에서 검색, 필터, 목록을 더 넓은 업무형 layout으로 재구성한다.
- `LawyerReviewPage`는 기본 정보, 제출 서류, 자동 검증, 처리 액션을 데스크톱에서 2컬럼으로 배치한다.
- 고정 높이 `h-[20px]`, `h-[22px]`, `h-[76px]`가 긴 한국어 텍스트와 충돌하지 않는지 점검하고 필요한 곳은 최소 높이 기반으로 전환한다.
- 긴 이메일, 파일명, 전문분야 chip은 `min-w-0`, `truncate`, wrapping 정책을 명확히 한다.

완료 기준:

- 관리자 화면이 `360x800`에서 drawer 기반으로 정상 동작한다.
- `768x1024` 이상에서 목록과 상세 정보가 과도하게 좁거나 한 줄에 눌리지 않는다.
- 긴 텍스트가 버튼, badge, 카드 경계를 깨지 않는다.

## Phase 5. 검증 및 회귀 방지

목표: 적응형 개선이 화면별로 유지되도록 검증 절차를 고정한다.

수동 QA 체크리스트:

- `360x800`: bottom nav, sticky CTA, 입력창, 모달, 긴 텍스트 겹침 확인
- `768x1024`: 단일 컬럼이 과도하게 넓어지지 않는지, 2열 전환 시 카드 높이가 깨지지 않는지 확인
- `1440x900`: sidebar, max-width, grid, 정보 밀도, 빈 공간 과다 여부 확인
- 모바일 브라우저 주소창 변화에 대해 `100dvh` 기반 화면이 잘 버티는지 확인
- 모든 화면에서 수평 스크롤이 발생하지 않는지 확인

자동 검증:

- `npm run lint`
- `npm run build`
- 핵심 컴포넌트 변경 시 관련 unit test 실행

향후 자동화 후보:

- Playwright screenshot 테스트를 도입해 대표 화면을 `360x800`, `768x1024`, `1440x900`에서 캡처한다.
- 캡처 대상은 auth 2개, client 5개, lawyer 4개, admin 3개로 시작한다.
- visual regression은 초기에는 warning 용도로만 운영하고, layout 깨짐이 안정화되면 CI gate로 승격한다.

## 우선순위 요약

1. 공통 layout의 scroll, safe-area, bottom spacing 계약을 먼저 정리한다.
2. 클라이언트 핵심 플로우의 `max-w-[390px]` 고정 프레임을 해소한다.
3. 변호사 업무 화면을 데스크톱에서 2열 또는 업무형 layout으로 확장한다.
4. 관리자 검토 화면의 긴 텍스트와 고정 높이 리스크를 줄인다.
5. viewport별 QA와 screenshot 기반 회귀 방지를 도입한다.
