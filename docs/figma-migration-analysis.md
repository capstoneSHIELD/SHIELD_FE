# Figma Export vs 현재 구현 — CSS 차이 분석

## Context

`figma-export/` 폴더의 13개 HTML(피그마에서 그대로 익스포트한 모바일 디자인)과 현재 React/Tailwind v4 구현 사이의 CSS·디자인 토큰 차이를 전역적으로 정리한다. 사용자가 페이지 디자인 마이그레이션을 진행 중인 상태이며(`git status`상 14개 파일 modified), 어느 레벨(토큰/컴포넌트/페이지)에서 차이가 발생하는지 한눈에 보고 우선순위를 잡기 위함이다.

피그마는 `Roboto + Noto Sans KR + Inter`, 절대좌표·픽셀 단위·`#1f8cf9` 계열 블루를 사용하지만, 현재 코드는 `Pretendard Variable`, flex 레이아웃, `#3B82F6`(`brand`) + `#258cf4`(`brand-primary`)를 혼용한다. 토큰 자체가 일부 어긋나 있어 페이지별로 보정하는 것보다 **전역 토큰 정합화 → 컴포넌트 정합화 → 페이지별 미세조정** 순서가 효율적이다.

---

## 1. 전역 디자인 토큰 (`src/index.css`) — Critical

| 항목 | Figma Export | 현재 (`src/index.css`) | 정합화 권장 |
|---|---|---|---|
| **Primary blue** | `#1f8cf9` (버튼), `#258cf4`, `#0680f9`, `#3688f4` (워드마크) | `--color-brand: #3B82F6`(Tailwind blue-500) / `--color-brand-primary: #258cf4` / `--color-brand-deep: #0680f9` | **`--color-brand: #1f8cf9` 단일화 결정.** `brand-primary`/`brand-deep`는 제거. 워드마크(`#3688f4`)·도메인 라벨(`#0680f9`) 같은 예외만 페이지에서 인라인 처리 |
| **Primary text** | `#16181d` / `#171a1f` / `#181b20` (따뜻한 뉴트럴) | `--color-text-primary: #1E293B` (slate, 푸른빛) | `#171a1f`로 통일 |
| **Secondary text** | `#575e6b` / `#555d6d` | `--color-text-soft: #575e6b` ✅, `--color-text-secondary: #64748B` ❌ | `--color-text-secondary`도 `#575e6b` 계열로 |
| **Border (입력/카드)** | `#e0e2e6`, `#dee1e6` | 토큰 없음 (페이지마다 인라인) | `--color-border: #e0e2e6` 토큰 추가 |
| **Error/Warning red** | `#e42020`, `#e52e2e`, `#eb4747`, `#ef6a6a` | `--color-warning-red: #eb4747` ✅, `--color-error: #EF4444` | `--color-error`를 `#e42020`(폼) / `#ef6a6a`(alert) 두 가지 분리 |
| **Info bg (light blue)** | `#f0f7ff`, `#d8ebfd`, `#e1f1fd`, `#d7f1fe` | `--color-info-bg: #EFF6FF` | `#f0f7ff` 또는 `#d8ebfd`로 교체 |
| **Surface (shell bg)** | `#f3f4f6` (페이지-wrap 외곽) / `#fff` (프레임 내부) | `--color-surface: #F8FAFC` | `#f3f4f6` 또는 그대로 유지 가능 |
| **Font family** | `Roboto, Noto Sans KR` 본문 / `Inter` 후속 페이지 / `Russo One` 로고 | `Pretendard Variable` 본문 / `Russo One` 로고 | **Pretendard 유지 결정** — 국문 가독성 우선. Figma의 `tracking-[-0.5px]~-0.6px` letter-spacing과 `leading-[22~32px]` line-height는 페이지 단위로 그대로 반영 |
| **Radius** | 2, 8, 10, **12**, 13, 14, 24, 28, 40, 999 | `--radius-card: 12px`, `--radius-pill: 9999px` | `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 14px`, `--radius-frame: 24px` 추가 |
| **Shadow (button)** | `0 4px 8px rgba(35,37,41,0.08)` (primary), `0 2px 4px rgba(35,37,41,0.06)` (subtle) | 정의 없음 (페이지마다 인라인) | `--shadow-btn`, `--shadow-card` 토큰화 |

**→ 가장 큰 임팩트:** `--color-brand`(`#3B82F6` → `#1f8cf9`)와 `--color-text-primary` 색온도 교정.

---

## 2. 공용 컴포넌트 — Critical

### `src/components/ui/Button.tsx` ⚠️ 큰 차이

- 현재: `rounded-pill` (= `9999px`, **알약형**) 사용
- Figma: 모든 primary CTA가 **`rounded-[12px]`** (둥근 사각형), `h-[56px]`, `bg-[#1f8cf9]`, `shadow-[0px_4px_8px_0px_rgba(35,37,41,0.08)]`, `text-[18px] font-bold leading-[28px]`
- **권장:** `primary`/`secondary` variant의 radius를 `rounded-card`(12px)로 교체. `lg` 사이즈를 `h-14`(56px)·`text-lg`·`font-bold`로 변경. 알약형은 chip/badge 용으로만 사용
- 영향 페이지: `LoginPage`, `ClientRegisterPage`, `RoleSelectPage`, `NewConsultationPage`, `AnalyzingPage`, `BriefDetailPage`, `FinalReviewPage`, `PrivacySettingsPage`, `LawyerProfilePage`, `RequestTrackingPage` — 사실상 전부

### `src/components/ui/Input.tsx`

- 현재: `rounded-xl`(12px) 박스형 + `border-gray-300` + `focus:ring-2`
- Figma 02-client-signup: **언더라인-온리**(`vector8.svg`) + 라벨 위쪽, 빨간 `*` 표시
- Figma 04-manual-field-selection / 검색 input: **`rounded-[12px]` 박스형** + 좌측 아이콘
- **권장:** Input 컴포넌트를 그대로 두되, 회원가입은 별도 `UnderlineField`(이미 `ClientRegisterPage`에 인라인 정의됨)로 분리. 일관성을 위해 `src/components/mobile/UnderlineField.tsx`로 추출

### `src/components/mobile/PageHeader.tsx`

- 현재 `h-[68px]` + `border-b border-[#e0e2e6]` — Figma 헤더 영역(상태바 40px 제외) `68px`와 일치 ✅
- 단, Figma는 뒤로가기 아이콘이 24px chevron-left이고 헤더 타이틀이 `text-[16px] font-semibold` — 확인 필요

---

## 3. 페이지별 차이 요약

| 페이지 | Figma 파일 | 핵심 차이 |
|---|---|---|
| **LoginPage** | `01-login.html` | 거의 정합. 다만 `text-[#3688f4]` 워드마크가 페이지 인라인. `text-text-soft`(`#575e6b`) ✅. 토큰만 정합화하면 OK |
| **ClientRegisterPage** | `02-client-signup.html` | 인라인 `UnderlineField` 정의 중. 제목 `text-[21px] tracking-[-0.6px]` + `SHIELD` 부분만 `#3688f4` 처리되어야 함(`<span>` 분할). 체크박스 `rounded-[2px] size-[20px] border-[#565d6d]` |
| **RoleSelectPage** | `03-role-selection.html` | RoleCard `rounded-[13px] border-2`, 아이콘 컨테이너 `bg-[#f0f7ff]` 또는 `#d8ebfd`. 하단 보안 안내 텍스트는 Figma 기준 `text-[12px] text-[#575e6b]` |
| **NewConsultationPage** | `04-manual-field-selection.html` | 검색 input `rounded-[12px]` + 좌측 아이콘. 도메인 리스트는 한 컨테이너에 묶어 `rounded-[12px] overflow-hidden border-[#e0e2e6]`. 분리된 카드 X |
| **ChatPage** | `05-chat-consultation.html` | 봇 버블 `bg-white border`, 유저 버블 `bg-[#1f8cf9] text-white`. TIP 카드는 `border-dashed border-[#1f8cf9]/40 bg-[#f0f7ff]`. 진행률 바 색상 점검 |
| **BriefDetailPage** | `06-classification-results.html`, `08-case-analysis.html` | 분류 결과는 큰 gavel 아이콘 + `text-[36px] text-[#0680f9] font-bold` 도메인 라벨. 키워드 칩은 흰 배경 + `border-[#e0e2e6]`. Warning bar `bg-[#fef6f6] border-[#fad3d3] text-[#e42020]` |
| **AnalyzingPage** | `07-processing-case.html` | 결과 카드 배경 `bg-[#d8ebfd]` 또는 `bg-[#e1f1fd]`. 로더 SVG 자산 사용 중 ✅ |
| **PrivacySettingsPage** | `09-privacy-settings.html` | 옵션 카드 `rounded-[12px] border-2`, 선택 시 `border-[#1f8cf9]`. 프리뷰 박스 `bg-[#f0f7ff]`/`bg-[#f3f4f6]` |
| **FinalReviewPage** | `10-final-review.html` | 카드 헤더의 수정 링크는 `text-[#0680f9] text-[13px]`. Warning box `bg-[#fef6f6] border-[#fad3d3]` (현재 red-500/5 — 색 미스매치) |
| **LawyerProfilePage** | `11-lawyer-profile.html` | 아바타 `size-[80px] rounded-[40px]` (현재 20×20 = 80px ✅). 경력 배지 `bg-[#f0f7ff] text-[#0680f9] text-[12px] px-2 py-1 rounded-[8px]`. 매칭 키워드 카드 배경 `bg-[#d8ebfd]` 또는 `bg-[#e1f1fd]` |
| **RequestTrackingPage** | `12-request-tracking.html` | 스테퍼 라인 `bg-[#1f8cf9]`(완료) / `bg-[#e0e2e6]`(대기). 인포 박스 `bg-[#f0f7ff] border-[#d8ebfd]` |
| **LawyerListPage** | `13-lawyer-search-results.html` | 카드 rating/review 부분 확인 필요. (현재 modified 목록에 없음 — 작업 미진행) |
| **BriefDeliveryPage** | (대응 Figma 없음) | 디자인 가이드 부재 — 기존 패턴 유지하되 토큰만 정합 |

---

## 4. 권장 작업 순서

1. **`src/index.css` 토큰 갱신** (1번 표 기준)
   - `--color-brand`, `--color-text-primary`, `--color-text-secondary` 교체
   - `--color-border`, `--color-info-bg`, `--radius-sm/md/lg`, `--shadow-btn` 토큰 신설
   - 폰트는 사용자 결정 필요 (아래 질문)
2. **`Button.tsx` 정합화** — `rounded-pill` → `rounded-card`(12px), `lg` 사이즈를 56px·18px로 조정. 이 한 컴포넌트가 10개 페이지에 영향
3. **`UnderlineField` 추출** → `src/components/mobile/UnderlineField.tsx`로 분리해 ClientRegister 외 재사용 대비
4. **페이지별 인라인 컬러를 토큰으로 치환** — `bg-[#1f8cf9]` → `bg-brand`, `text-[#171a1f]` → `text-text-primary` 등 (sed-스타일 일괄 치환 + 시각 검수)
5. **페이지별 미세조정** — 위 3절 표의 각 항목을 페이지 순서대로 적용

---

## 5. 확정된 결정 사항

- **폰트:** Pretendard Variable 유지. Figma 스펙의 `tracking`·`line-height`는 페이지별로 그대로 반영하여 시각 차이 보정
- **Primary 색상:** `--color-brand: #1f8cf9` 단일 토큰. `brand-primary`/`brand-deep`는 제거하고 `#3688f4`(워드마크), `#0680f9`(분류 라벨) 등 1~2곳의 예외만 페이지에서 인라인 사용
- **이번 세션 범위:** 본 분석 plan 승인까지만. 실제 코드 수정은 사용자가 페이지/컴포넌트별로 다음 턴에 지시할 때 진행

---

## 6. 검증 방법 (정합화 작업 시)

- `pnpm dev` 띄우고 13개 페이지를 figma-export HTML과 사이드-바이-사이드 비교 (브라우저 두 창)
- Chrome DevTools MCP로 각 페이지 스크린샷 → figma-export HTML 스크린샷과 시각 비교
- `pnpm build`로 타입체크 통과 확인
- 토큰 변경 후 영향 페이지 전수 확인: Login, ClientRegister, RoleSelect, NewConsultation, Chat, BriefDetail, Analyzing, PrivacySettings, FinalReview, LawyerProfile, RequestTracking
