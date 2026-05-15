# Figma 마이그레이션 — Phase별 실행 계획

> 분석 문서: [figma-migration-analysis.md](./figma-migration-analysis.md)
> 본 문서는 그 분석 결과를 **실행 순서**로 풀어 둔 것이다. Phase 0 → 7 순서로 진행.

---

## 작업 원칙 (전 Phase 공통)

- **커밋 단위**: 한 커밋 = 한 논리적 변경 (CLAUDE.md 규칙). Phase 안에서도 여러 커밋으로 분리
- **커밋 전 필수**: `pnpm lint && pnpm build` 통과
- **시각 검수 필수**: 코드 변경마다 `pnpm dev` → 브라우저로 figma-export HTML과 사이드-바이-사이드 비교
- **롤백 안전**: 각 Phase 시작 시 main 동기화 + 별도 작업 브랜치 권장 (`feature/figma-migration`)
- **토큰 우선**: 인라인 `#1f8cf9` 같은 값을 발견하면 **무조건 토큰(`bg-brand`)으로 치환** (예외: 워드마크 `#3688f4`, 분류 라벨 `#0680f9`)

---

## Phase 0 — 준비 (1~2시간)

**목표**: 기준선 캡처 + 작업 환경 정리

| # | 작업 | 검증 |
|---|---|---|
| 0-1 | 작업 브랜치 생성 (`feature/figma-migration` 또는 사용자가 이미 사용 중인 브랜치 유지) | `git branch --show-current` |
| 0-2 | `pnpm dev` 띄우고 현재 13개 페이지를 브라우저로 1회씩 순회, **현재 상태 스크린샷 캡처** (`docs/screenshots/before/` 임시 폴더) | 페이지별 PNG 존재 |
| 0-3 | `figma-export/*.html`을 별도 브라우저 창에서 동시에 열어 두기 (작업 중 항상 참조) | 13개 탭 오픈 |
| 0-4 | 현재 modified 파일 14개의 작업 중 변경분 확인 (`git diff`) — 충돌 없도록 정리 | diff 검토 완료 |

**커밋 없음** (준비 단계).

---

## Phase 1 — 전역 디자인 토큰 정합화 (Critical, 30분)

**목표**: `src/index.css` 토큰을 Figma 기준으로 교정. 한 번에 전 페이지가 영향 받음.

**파일**: `src/index.css` 단일 파일

### 변경 사항

```diff
:root {
-  --color-brand: #3B82F6;
+  --color-brand: #1f8cf9;
   --color-kakao: #FEE500;
   --color-naver: #03C75A;
   --color-google-border: #DADCE0;
-  --color-surface: #F8FAFC;
+  --color-surface: #F8FAFC;  /* 유지 — 외곽 shell */
-  --color-info-bg: #EFF6FF;
+  --color-info-bg: #f0f7ff;
-  --color-error: #EF4444;
+  --color-error: #e42020;     /* 폼 검증 */
+  --color-alert: #ef6a6a;     /* 경고 배너 */
-  --color-text-primary: #1E293B;
+  --color-text-primary: #171a1f;
-  --color-text-secondary: #64748B;
+  --color-text-secondary: #575e6b;
+  --color-border: #e0e2e6;
   --radius-card: 12px;
+  --radius-sm: 8px;
+  --radius-md: 12px;
+  --radius-lg: 14px;
+  --radius-frame: 24px;
   --radius-pill: 9999px;
+  --shadow-btn: 0 4px 8px rgba(35, 37, 41, 0.08);
+  --shadow-card: 0 2px 4px rgba(35, 37, 41, 0.06);
}

@theme {
-  --color-brand: #3B82F6;
-  --color-brand-primary: #258cf4;
-  --color-brand-deep: #0680f9;
+  --color-brand: #1f8cf9;
   /* brand-primary, brand-deep 제거 → 페이지에서 #3688f4/#0680f9 인라인 */
   ...
}
```

### 검증

1. `pnpm build` 통과
2. `pnpm dev` → 13개 페이지 순회 시각 확인. 다음만 체크:
   - Primary 버튼 색이 살짝 더 밝아짐 (`#3B82F6` → `#1f8cf9`)
   - 본문 텍스트 색온도가 따뜻해짐 (slate → 뉴트럴)
3. **회귀 주의**: `bg-brand-primary` / `bg-brand-deep` / `text-brand-primary` 등을 직접 쓰는 곳 → ToolSearch `Grep`로 검색하여 모두 `bg-brand` 또는 인라인 `bg-[#258cf4]`로 치환
4. `git diff src/` 결과로 의도하지 않은 색 변화가 있는 페이지 식별

### 커밋

```
refactor(tokens): align design tokens with figma export

- brand → #1f8cf9 (was #3B82F6)
- text-primary → #171a1f (warm neutral, was slate)
- text-secondary → #575e6b
- add --color-border, --color-alert, radius-sm/md/lg, shadow-btn/card
- remove brand-primary/brand-deep (use inline for word-mark exceptions)
```

---

## Phase 2 — 공용 컴포넌트 정합화 (Critical, 1~2시간)

**목표**: Button 모양/사이즈를 Figma에 맞추고, UnderlineField를 재사용 컴포넌트로 추출.

### 2-A. `src/components/ui/Button.tsx`

```diff
- 'inline-flex items-center justify-center font-medium rounded-pill',
+ 'inline-flex items-center justify-center font-medium rounded-md',

  sizeClasses:
-  sm: 'h-8 px-3 text-sm gap-1.5',
-  md: 'h-10 px-4 text-sm gap-2',
-  lg: 'h-12 px-6 text-base gap-2.5',
+  sm: 'h-9 px-3 text-sm gap-1.5 rounded-[8px]',
+  md: 'h-11 px-4 text-base gap-2 rounded-[12px]',
+  lg: 'h-14 px-6 text-lg font-bold gap-2.5 rounded-[12px] shadow-[var(--shadow-btn)]',

  primary variant:
-  'bg-brand text-white hover:bg-blue-600 active:bg-blue-700 ...'
+  'bg-brand text-white hover:brightness-95 active:brightness-90 ...'
```

- 핵심: **`rounded-pill` 기본값 제거** → 사이즈별 `rounded-[*]` 명시
- `lg` 사이즈가 Figma의 primary CTA 스펙(`h-14`·`text-lg`·`font-bold`·shadow)과 일치
- 알약형이 필요한 곳(chip/badge)은 별도 컴포넌트 사용 또는 `rounded-pill` className 직접 부여

**영향 페이지**: 10개. Phase 2 완료 후 모든 페이지 1회 순회 확인.

**커밋**: `refactor(button): align Button shape and sizing with figma`

### 2-B. `src/components/mobile/UnderlineField.tsx` 신규 추출

현재 `src/routes/auth/ClientRegisterPage.tsx`에 인라인 정의된 `UnderlineField`를 그대로 옮긴다.

```
src/components/mobile/UnderlineField.tsx  (신규)
src/routes/auth/ClientRegisterPage.tsx    (수정: import로 교체)
```

Props 그대로 유지: `label`, `required`, `placeholder`, `type`, `autoComplete`, `error`, `register`.

**커밋**: `refactor(mobile): extract UnderlineField from ClientRegisterPage`

### 2-C. `src/components/mobile/PageHeader.tsx` 점검

- 뒤로가기 아이콘이 24px chevron-left인지 확인
- 타이틀 `text-[16px] font-semibold` 인지 확인
- 차이 있으면 수정, 없으면 스킵

**커밋 (있을 시)**: `fix(page-header): match figma chevron size and title weight`

---

## Phase 3 — 인증 흐름 (01~03, 1~2시간)

| 순서 | 페이지 | Figma | 핵심 작업 |
|---|---|---|---|
| 3-1 | `LoginPage` | `01-login.html` | 토큰 치환만으로 거의 정합. 워드마크 `text-[#3688f4]`는 인라인 유지. blur-halo 위치/크기 미세 확인 |
| 3-2 | `ClientRegisterPage` | `02-client-signup.html` | 제목 `text-[21px] tracking-[-0.6px]` + `<span>` 분할(SHIELD만 `#3688f4`). 체크박스 `rounded-[2px] size-[20px] border-[#565d6d]`. 제출 버튼 → Button `lg` 사용 |
| 3-3 | `RoleSelectPage` | `03-role-selection.html` | RoleCard `rounded-[13px] border-2`, 아이콘 컨테이너 `bg-[var(--color-info-bg)]`(=`#f0f7ff`). 하단 안내 `text-[12px] text-text-secondary` |

**각 페이지별 커밋**: `style(login): match figma 01 layout` / `style(client-register): ...` / `style(role-select): ...`

**검증**: 각 페이지마다 figma-export HTML과 브라우저 두 창 사이드-바이-사이드 비교. 차이 발견 즉시 수정.

---

## Phase 4 — 상담 흐름 (04~07, 2~3시간)

| 순서 | 페이지 | Figma | 핵심 작업 |
|---|---|---|---|
| 4-1 | `NewConsultationPage` | `04-manual-field-selection.html` | 검색 input `rounded-[12px]` + 좌측 아이콘. 도메인 리스트는 **한 컨테이너**(`rounded-[12px] overflow-hidden border-[var(--color-border)]`)에 묶기 |
| 4-2 | `ChatPage` | `05-chat-consultation.html` | 봇 버블 `bg-white border-[var(--color-border)]`, 유저 버블 `bg-brand text-white`. TIP 카드 `border-dashed border-brand/40 bg-[var(--color-info-bg)]`. 진행률 바 색상 점검 |
| 4-3 | `BriefDetailPage` (분류 결과 부분만) | `06-classification-results.html` | 큰 gavel 아이콘 + 도메인 라벨 `text-[36px] text-[#0680f9] font-bold`(인라인 예외). 키워드 칩 `bg-white border-[var(--color-border)]`. Warning bar `bg-[#fef6f6] border-[#fad3d3] text-[var(--color-error)]` |
| 4-4 | `AnalyzingPage` | `07-processing-case.html` | 결과 카드 배경 `bg-[#d8ebfd]` 또는 `bg-[#e1f1fd]` (둘 중 Figma 정확값 확인 후 토큰 또는 인라인). 로더 SVG 그대로 |

**페이지별 커밋**: `style(new-consultation): ...` / `style(chat): ...` / `style(brief-detail): match figma 06 classification result` / `style(analyzing): ...`

---

## Phase 5 — 검토/제출 (08~10, 2시간)

| 순서 | 페이지 | Figma | 핵심 작업 |
|---|---|---|---|
| 5-1 | `BriefDetailPage` (분석 부분) | `08-case-analysis.html` | 다크 배경 카드, 해시태그 키워드(`#` 아이콘), 섹션 구분 라인 |
| 5-2 | `PrivacySettingsPage` | `09-privacy-settings.html` | 옵션 카드 `rounded-[12px] border-2`, 선택 시 `border-brand`. 프리뷰 박스 `bg-[var(--color-info-bg)]` / `bg-[#f3f4f6]` |
| 5-3 | `FinalReviewPage` | `10-final-review.html` | 카드 헤더 수정 링크 `text-[#0680f9] text-[13px]`. Warning box **현재 `red-500/5` 미스매치 → `bg-[#fef6f6] border-[#fad3d3]`로 교체** |

**커밋**: 페이지별 분리.

---

## Phase 6 — 변호사 페이지 (11~13, 2시간)

| 순서 | 페이지 | Figma | 핵심 작업 |
|---|---|---|---|
| 6-1 | `LawyerProfilePage` | `11-lawyer-profile.html` | 아바타 `size-20 rounded-full` (80px). 경력 배지 `bg-[var(--color-info-bg)] text-[#0680f9] text-[12px] px-2 py-1 rounded-[8px]`. 매칭 키워드 카드 `bg-[#d8ebfd]` 또는 `bg-[#e1f1fd]` |
| 6-2 | `RequestTrackingPage` | `12-request-tracking.html` | 스테퍼 라인 완료=`bg-brand` / 대기=`bg-[var(--color-border)]`. 인포 박스 `bg-[var(--color-info-bg)] border-[#d8ebfd]` |
| 6-3 | `LawyerListPage` | `13-lawyer-search-results.html` | **현재 modified 목록에 없음 — Figma 디자인 처음 적용**. 작업량 가장 클 수 있음. 별도 PR 분리 고려 |

**커밋**: 페이지별 분리. 6-3은 별도 PR 권장.

---

## Phase 7 — 마무리 (1시간)

| # | 작업 | 검증 |
|---|---|---|
| 7-1 | 인라인 컬러 전수 점검: `Grep`로 `#3B82F6`, `#1E293B`, `#64748B`, `#EFF6FF`, `#EF4444` 잔존 확인 → 발견 시 토큰 치환 | grep 결과 0건 |
| 7-2 | `pnpm lint` 통과 | exit 0 |
| 7-3 | `pnpm build` 통과 (타입 + 번들) | exit 0 |
| 7-4 | Chrome DevTools MCP로 13개 페이지 모바일 viewport(390×844) 스크린샷 → figma-export 스크린샷과 최종 시각 비교 | 페이지별 PASS/FAIL 기록 |
| 7-5 | `before/`(Phase 0) ↔ `after/`(Phase 7) 비교 결과를 PR description에 첨부 | PR draft |
| 7-6 | PR 생성 (`develop` 타깃) | PR URL |

**커밋**: 정리/마무리 커밋 1개 — `chore: replace residual inline colors with design tokens`

---

## 위험·주의 사항

1. **Phase 1 토큰 변경의 파급력** — `#3B82F6` 기반의 hover(`hover:bg-blue-600`)는 토큰 변경 후에도 `blue-600`(Tailwind 기본 팔레트)에 묶여 있어 어색해질 수 있음. Button 컴포넌트에서 `hover:brightness-95`로 바꾸는 Phase 2-A에서 같이 해결됨. **단, Button 외에 `hover:bg-blue-*`를 직접 쓰는 다른 컴포넌트가 있는지 검색 필요**.
2. **`brand-primary` / `brand-deep` 제거 시 빌드 깨짐** — Tailwind v4가 이 이름을 사용하는 곳을 모두 찾아야 함. Phase 1에서 `Grep`로 `bg-brand-primary`, `text-brand-primary`, `bg-brand-deep`, `text-brand-deep` 전수 확인 → 모두 `bg-brand` 또는 페이지 인라인으로 치환 **후** 토큰 제거.
3. **워드마크/도메인 라벨 색 예외** — `#3688f4`(SHIELD 워드마크, login·signup 2곳), `#0680f9`(분류 라벨·수정 링크, 3~4곳)는 의도적으로 인라인 유지. 토큰화 강요 X.
4. **`BriefDetailPage`의 view/edit 모드** — 한 페이지가 분류 결과(06)와 분석 리포트(08) 두 Figma를 다 커버. Phase 4-3과 Phase 5-1에서 같은 파일을 두 번 만짐 → 충돌 주의, 가능하면 한 PR로 묶기.
5. **`LawyerListPage`(6-3)** — 현재 modified 목록에 없음. 디자인 적용이 시작되지 않은 상태로 추정. 다른 페이지보다 작업량이 클 수 있어 별도 PR로 분리하는 것이 안전.

---

## 진행 추적 체크리스트

```
[ ] Phase 0 — 준비
[ ] Phase 1 — 전역 토큰 (src/index.css)
[ ] Phase 2 — 공용 컴포넌트
    [ ] 2-A Button.tsx
    [ ] 2-B UnderlineField 추출
    [ ] 2-C PageHeader 점검
[ ] Phase 3 — 인증 (01~03)
    [ ] 3-1 LoginPage
    [ ] 3-2 ClientRegisterPage
    [ ] 3-3 RoleSelectPage
[ ] Phase 4 — 상담 (04~07)
    [ ] 4-1 NewConsultationPage
    [ ] 4-2 ChatPage
    [ ] 4-3 BriefDetailPage (분류)
    [ ] 4-4 AnalyzingPage
[ ] Phase 5 — 검토 (08~10)
    [ ] 5-1 BriefDetailPage (분석)
    [ ] 5-2 PrivacySettingsPage
    [ ] 5-3 FinalReviewPage
[ ] Phase 6 — 변호사 (11~13)
    [ ] 6-1 LawyerProfilePage
    [ ] 6-2 RequestTrackingPage
    [ ] 6-3 LawyerListPage (별도 PR 권장)
[ ] Phase 7 — 마무리 + PR
```
