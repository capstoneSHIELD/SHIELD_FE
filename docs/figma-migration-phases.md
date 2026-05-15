# Figma 마이그레이션 — Phase별 실행 계획

> 분석 문서: [figma-migration-analysis.md](./figma-migration-analysis.md)
> 본 문서는 그 분석 결과를 **실행 순서**로 풀어 둔 것이다. Phase 0 → 7 순서로 진행.

---

## 작업 원칙 (전 Phase 공통)

- **커밋 단위**: 한 커밋 = 한 논리적 변경 (CLAUDE.md 규칙). Phase 안에서도 여러 커밋으로 분리
- **커밋 전 필수**: `npm run lint && npm run build` 통과
- **시각 검수 필수**: 코드 변경마다 `npm run dev` → 브라우저로 figma-export HTML과 사이드-바이-사이드 비교
- **PR 묶음**: Phase 1 + Phase 2-A는 **같은 PR**로 묶는다. Phase 1만 단독 머지되면 Button의 `hover:bg-blue-600`이 새 brand(`#1f8cf9`)와 어긋난 상태가 노출됨
- **롤백 안전**: 각 Phase 시작 시 main 동기화 + 별도 작업 브랜치 권장 (`feature/figma-migration`)
- **토큰 우선**: 인라인 `#1f8cf9` 같은 값을 발견하면 **무조건 토큰(`bg-brand`)으로 치환** (예외: 워드마크 `#3688f4`, 분류 라벨 `#0680f9`)
- **시간 추정 버퍼**: 본 문서의 Phase별 추정치에 50% 버퍼를 곱해서 PR description에 적을 것

---

## Phase 0 — 준비 (1~2시간)

**목표**: 기준선 캡처 + 작업 환경 정리

| # | 작업 | 검증 |
|---|---|---|
| 0-1 | 작업 브랜치 생성 (`feature/figma-migration` 또는 사용자가 이미 사용 중인 브랜치 유지) | `git branch --show-current` |
| 0-2 | `npm run dev` 띄우고 현재 13개 페이지를 브라우저로 1회씩 순회, **현재 상태 스크린샷 캡처** (`docs/screenshots/before/` 임시 폴더) | 페이지별 PNG 존재 |
| 0-3 | `figma-export/*.html`을 별도 브라우저 창에서 동시에 열어 두기 (작업 중 항상 참조). 또한 figma-export HTML이 인라인 스타일 기반인지 클래스 기반인지 확인(클래스 기반이면 src 스캔에 포함 안 됨에 유의) | 13개 탭 오픈 + 스타일링 방식 확인 |
| 0-4 | 현재 modified 파일 14개의 작업 중 변경분 확인 (`git diff`) | diff 검토 완료 |
| 0-5 | **modified 파일 동결** — 작업 가능한 상태면 1~2개 WIP 커밋으로 묶거나 `git stash push -u -m "pre-migration WIP"`로 격리. Phase 1 토큰 변경이 이 변경분과 충돌하지 않도록 한다 | `git status` clean 또는 stash 항목 존재 |

**커밋**: 0-5에서 WIP 커밋 가능. 그 외는 준비 단계.

---

## Phase 1 — 전역 디자인 토큰 정합화 (Critical, 1~1.5시간)

**목표**: `src/index.css` 토큰을 Figma 기준으로 교정. 한 번에 전 페이지가 영향 받음.

**파일**: `src/index.css` 단일 파일

> ⚠️ **두 커밋으로 분리한다**. Tailwind v4에서 `@theme`의 토큰을 제거하면, 그 토큰을 className으로만 쓰는 JSX(예: `<div className="bg-brand-primary" />`)는 **빌드는 통과하지만 색이 사라진다**(런타임 무음 실패). 추가는 안전, 제거는 명시 — 두 단계로 나눈다.

> ⚠️ **Tailwind v4 네임스페이스 주의**. `--radius-*`, `--shadow-*`는 v4의 예약 네임스페이스로, `@theme`에 선언하면 기본 `rounded-sm` / `shadow-md` 같은 유틸리티 값을 **전역 오버라이드**한다. 우리는 Figma 스케일을 별도 네임스페이스(`--shape-radius-*`)로 분리해 기본 유틸리티를 보존한다. `--shadow-btn`/`--shadow-card`는 의도적으로 `@theme`에 두어 `shadow-btn`/`shadow-card` 유틸리티가 자동 생성되도록 한다(임의 값 `shadow-[var(--shadow-btn)]` 대신 단축 유틸 사용).

### Phase 1-A. 토큰 추가·교체 (안전한 변경)

`brand-primary`/`brand-deep`는 **남겨둔 채로** brand 값만 교체 + 신규 토큰 추가. 빌드/런타임 모두 안전.

#### `:root` diff

```diff
:root {
-  --color-brand: #3B82F6;
+  --color-brand: #1f8cf9;
   --color-kakao: #FEE500;
   --color-naver: #03C75A;
   --color-google-border: #DADCE0;
   --color-surface: #F8FAFC;            /* 유지 */
-  --color-info-bg: #EFF6FF;
+  --color-info-bg: #f0f7ff;
-  --color-error: #EF4444;
+  --color-error: #e42020;               /* 폼 검증 */
+  --color-alert: #ef6a6a;               /* 경고 배너 */
-  --color-text-primary: #1E293B;
+  --color-text-primary: #171a1f;
-  --color-text-secondary: #64748B;
+  --color-text-secondary: #575e6b;
+  --color-border: #e0e2e6;
   --radius-card: 12px;
   --radius-pill: 9999px;
+  --shape-radius-sm: 8px;               /* Tailwind --radius-* 네임스페이스 회피 */
+  --shape-radius-md: 12px;
+  --shape-radius-lg: 14px;
+  --shape-radius-frame: 24px;
}
```

#### `@theme` diff (이 단계에서는 brand-primary/deep 제거 X)

```diff
@theme {
-  --color-brand: #3B82F6;
+  --color-brand: #1f8cf9;
   --color-brand-primary: #258cf4;       /* Phase 1-B에서 제거 — 지금은 유지 */
   --color-brand-deep: #0680f9;          /* Phase 1-B에서 제거 — 지금은 유지 */
   ...
+  --shadow-btn: 0 4px 8px rgba(35, 37, 41, 0.08);   /* @theme에 두어야 shadow-btn 유틸 생성 */
+  --shadow-card: 0 2px 4px rgba(35, 37, 41, 0.06);
}
```

#### 검증

1. `npm run build` 통과
2. `npm run dev` → 13개 페이지 순회. 기존 색이 살짝 따뜻해진 정도만 변화. `bg-brand-primary`/`bg-brand-deep` 사용처는 아직 동작
3. `:root`와 `@theme` 두 블록이 점차 비대칭화되는 것을 추적 (Phase 7-1 cleanup에서 통일)

#### 커밋

```
refactor(tokens): add figma tokens and refresh brand value (additive)

- brand: #3B82F6 → #1f8cf9
- text-primary: #1E293B → #171a1f
- text-secondary: #64748B → #575e6b
- info-bg, error 값 교정, --color-alert, --color-border 신설
- --shape-radius-* 추가 (Tailwind --radius-* 네임스페이스 회피)
- --shadow-btn/--shadow-card를 @theme에 추가하여 자동 유틸 생성
- brand-primary/brand-deep는 1-B에서 제거 예정 — 이 커밋에서는 유지
```

---

### Phase 1-B. 구 토큰 제거 (명시적 변경)

**게이트가 0건일 때까지 커밋 금지.**

#### 게이트 1 — 구 brand alias 사용처 grep

```bash
grep -rnE "(bg|text|border|ring|from|via|to)-brand-(primary|deep)" src/
```

- 결과가 모두 토큰(`bg-brand`) 또는 인라인 hex(`bg-[#258cf4]`, `text-[#3688f4]`, `text-[#0680f9]`)로 치환되어 **결과 0건**이 될 때까지 진행 금지
- 워드마크/분류 라벨 예외는 인라인 hex로 유지하되 alias 이름은 제거

#### 게이트 2 — Tailwind blue-* 직접 사용 광역 grep

`--color-brand`가 `#1f8cf9`로 바뀌면 Tailwind 기본 blue 팔레트(blue-500/600/700)와 더 이상 어울리지 않음. **prefix·속성·shade를 모두 잡는 한 줄**:

```bash
grep -rnE "(hover:|active:|focus:|focus-visible:|group-hover:|peer-focus:)?(bg|text|border|ring|from|via|to)-blue-[0-9]+" src/
```

- Button.tsx의 `hover:bg-blue-600`/`active:bg-blue-700`은 Phase 2-A에서 `brightness-95`/`brightness-90`로 치환됨 (해당 결과는 Phase 2-A 작업 후 사라짐)
- 그 외 결과는 페이지별로 토큰화하거나 `brightness-*` 변조로 치환

#### `@theme` 토큰 제거 (두 게이트 통과 후)

```diff
@theme {
   --color-brand: #1f8cf9;
-  --color-brand-primary: #258cf4;
-  --color-brand-deep: #0680f9;
   ...
}
```

#### 검증

1. 게이트 1, 2 grep 모두 0건
2. `npm run build` 통과 (`@apply bg-brand-primary` 같은 CSS 측 사용이 남았으면 여기서 에러로 잡힘)
3. `npm run dev` → **모든 페이지 1회 시각 확인**. 빌드가 통과해도 className만 남은 사용처는 색이 사라진 채로 보임 — 시각 검수가 유일한 안전망
4. primary 버튼/카드 배경/배지 색을 페이지별로 spot check

#### 커밋

```
refactor(tokens): remove brand-primary/brand-deep aliases

- 사용처 모두 bg-brand 또는 인라인 hex로 치환 완료 (게이트 1, 2 통과)
- @theme에서 alias 제거
- 워드마크 #3688f4 (login·signup), 분류 라벨 #0680f9 (brief·final-review)는 인라인 유지
```

---

## Phase 2 — 공용 컴포넌트 정합화 (Critical, 1~2시간)

**목표**: Button 모양/사이즈를 Figma에 맞추고, UnderlineField를 재사용 컴포넌트로 추출.

### 2-A. `src/components/ui/Button.tsx`

```diff
- 'inline-flex items-center justify-center font-medium rounded-pill',
+ 'inline-flex items-center justify-center font-medium',

  sizeClasses:
-  sm: 'h-8 px-3 text-sm gap-1.5',
-  md: 'h-10 px-4 text-sm gap-2',
-  lg: 'h-12 px-6 text-base gap-2.5',
+  sm: 'h-9 px-3 text-sm gap-1.5 rounded-[8px]',
+  md: 'h-11 px-4 text-base gap-2 rounded-[12px]',
+  lg: 'h-14 px-6 text-lg font-bold gap-2.5 rounded-[12px] shadow-btn',

  primary variant:
-  'bg-brand text-white hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-brand/40'
+  'bg-brand text-white hover:brightness-95 active:brightness-90 focus-visible:ring-brand/40'
```

- 핵심: **`rounded-pill` 기본값 제거** → 사이즈별 `rounded-[*]` 명시
- `lg` 사이즈가 Figma의 primary CTA 스펙(`h-14`·`text-lg`·`font-bold`·`shadow-btn`)과 일치 — `shadow-btn`은 Phase 1-A에서 `@theme`에 추가한 토큰의 자동 생성 유틸
- 알약형이 필요한 곳(chip/badge)은 별도 컴포넌트 사용 또는 `rounded-pill` className 직접 부여
- `active:bg-blue-700`도 `active:brightness-90`로 함께 교체됨에 유의(Phase 1-B 게이트 2의 blue-* grep 결과 0건 만들기 위해 필요)

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

### 2-C. `src/components/mobile/PageHeader.tsx` — 확인만 (스킵 후보)

현재 코드(`ChevronLeft size={24}` + `text-base font-semibold leading-7` + `h-[68px] border-b border-[#e0e2e6]`)가 이미 Figma 사양과 정합. **육안 확인 1회 후 스킵**. 변경 있으면 별도 커밋.

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
| 7-1 | **인라인 컬러 전수 점검 + `:root`/`@theme` 동기화**: 화이트리스트(`#3688f4`, `#0680f9`, kakao/naver/google 등) 외 hex가 src에 잔존하는지 `grep -rnE "#[0-9a-fA-F]{3,6}" src/`로 확인. 두 블록의 토큰 셋이 비대칭이면 통일 | 화이트리스트 외 hex 0건 + `:root`/`@theme` 일치 |
| 7-2 | `npm run lint` 통과 | exit 0 |
| 7-3 | `npm run build` 통과 (타입 + 번들) | exit 0 |
| 7-4 | Chrome DevTools MCP로 13개 페이지 모바일 viewport(390×844) 스크린샷 → figma-export 스크린샷과 최종 시각 비교. **`BriefDeliveryPage`도 포함**(대응 Figma는 없지만 토큰 회귀 여부 확인) | 페이지별 PASS/FAIL 기록 |
| 7-5 | **접근성/모바일 spot check**: Chrome DevTools 모바일 에뮬레이션(터치 이벤트 활성)에서 primary 버튼의 `active:brightness-90` 동작 확인. primary 버튼 disabled/focus 상태의 WCAG 대비(3:1 비텍스트, 4.5:1 본문) spot check | 인터랙션 색 변화 시인 + 대비 통과 |
| 7-6 | **Vercel preview 갱신·CDN 폰트 폴백 확인**: PR이 생성하는 preview URL이 최신 빌드를 가리키는지 확인. Pretendard CDN 차단 시 한글 폴백이 받아들일 만한지 1회 점검 | preview 정상 + 폰트 폴백 OK |
| 7-7 | `before/`(Phase 0) ↔ `after/` 비교 결과 + 실제 소요 시간을 PR description에 첨부 | PR draft |
| 7-8 | PR 생성 (`develop` 타깃) | PR URL |

**커밋**: 정리/마무리 커밋 1개 — `chore: replace residual inline colors and sync :root/@theme`

---

## 위험·주의 사항

1. **Phase 1 토큰 변경의 파급력** — `--color-brand`가 `#1f8cf9`로 바뀐 후 Tailwind 기본 blue 팔레트(`blue-500/600/700`)와 더 이상 어울리지 않음. Phase 1-B 게이트 2의 광역 grep — `(hover:|active:|focus:|focus-visible:|group-hover:|peer-focus:)?(bg|text|border|ring|from|via|to)-blue-[0-9]+` — 한 줄로 prefix·속성·shade를 모두 잡아 0건이 될 때까지 토큰화 또는 `brightness-*` 변조로 치환한다. Button.tsx는 Phase 2-A에서 해결되지만 다른 컴포넌트는 페이지별로 처리.
2. **`brand-primary` / `brand-deep` 제거 시 무음 회귀** — `@theme`에서 제거하면 ① CSS측 `@apply bg-brand-primary` 사용은 **빌드 타임 에러**, ② JSX className 사용은 **빌드 통과 + 런타임 색 누락**. 두 번째가 위험. Phase 1-A(추가만)와 Phase 1-B(grep 통과 후 제거)로 분리한 이유. 시각 검수가 유일한 안전망이므로 Phase 1-B 직후 모든 페이지 1회 순회 필수.
3. **워드마크/도메인 라벨 색 예외** — `#3688f4`(SHIELD 워드마크, login·signup 2곳), `#0680f9`(분류 라벨·수정 링크, 3~4곳)는 의도적으로 인라인 유지. 토큰화 강요 X.
4. **`BriefDetailPage`의 view/edit 모드** — 한 페이지가 분류 결과(06)와 분석 리포트(08) 두 Figma를 다 커버. Phase 4-3과 Phase 5-1에서 같은 파일을 두 번 만짐 → 충돌 주의, 가능하면 한 PR로 묶기.
5. **`LawyerListPage`(6-3)** — 현재 modified 목록에 없음. 디자인 적용이 시작되지 않은 상태로 추정. 다른 페이지보다 작업량이 클 수 있어 별도 PR로 분리하는 것이 안전.

---

## 진행 추적 체크리스트

```
[ ] Phase 0 — 준비
    [ ] 0-1 ~ 0-4 환경/기준선
    [ ] 0-5 modified 파일 동결(WIP 커밋 또는 stash)
[ ] Phase 1 — 전역 토큰 (src/index.css) — Phase 2-A와 같은 PR로 묶을 것
    [ ] 1-A 토큰 추가·교체 (안전 변경)
    [ ] 1-B 게이트 1·2 grep 0건 확인 후 brand-primary/deep 제거
[ ] Phase 2 — 공용 컴포넌트
    [ ] 2-A Button.tsx (Phase 1과 같은 PR)
    [ ] 2-B UnderlineField 추출
    [ ] 2-C PageHeader — 이미 정합, 확인만
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
    [ ] 7-1 hex 화이트리스트 grep + :root/@theme 동기화
    [ ] 7-2 / 7-3 npm run lint && npm run build
    [ ] 7-4 13개 페이지 시각 비교 (BriefDeliveryPage 포함)
    [ ] 7-5 모바일 active 상태 + WCAG 대비 spot check
    [ ] 7-6 Vercel preview + CDN 폰트 폴백
    [ ] 7-7 PR description (소요 시간 포함)
    [ ] 7-8 PR 생성
```
