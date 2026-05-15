# Phase 문서 리뷰 의뢰서

> Perplexity Computer에게 보낼 리뷰 의뢰서. 첨부 파일과 함께 또는 본문에 phase 문서를 paste하여 전달.

---

## 1. 의뢰 요약

SHIELD_FE 프로젝트의 **Figma 마이그레이션 실행 Phase 문서**(`docs/figma-migration-phases.md`)를 리뷰해 주세요. 실행 전에 잡을 수 있는 위험·개선점을 식별하는 것이 목표이며, **승인 의견이 아니라 구체적 지적**을 원합니다.

---

## 2. 프로젝트 컨텍스트

- **스택**: React 19 + Vite + Tailwind v4 + TypeScript
- **앱 성격**: AI 법률정보 구조화 플랫폼 (USER/LAWYER/ADMIN 3역할, 모바일 우선)
- **모바일 프레임**: `max-w-[390px]` 고정 (반응형 X, 모바일 중심)
- **현 상태**: 사용자가 Figma export(`figma-export/*.html` 13개)에 맞춰 페이지를 수정 중. `git status` 기준 14개 파일이 modified
- **레이아웃 패러다임 차이**: Figma는 픽셀 단위 `position: absolute` 익스포트, 현재 코드는 flex 기반 — 1:1 이식이 아니라 **시맨틱 변환** 필요

---

## 3. 리뷰 대상

### 주 리뷰 대상
**`docs/figma-migration-phases.md`** — 0~7 Phase로 구성된 실행 계획 (전역 토큰 → 컴포넌트 → 페이지별 → 마무리)

### 참고 문서
- `docs/figma-migration-analysis.md` — 위 phase의 기반이 된 차이 분석. Figma vs 현재 구현의 토큰·컴포넌트·페이지별 diff
- `figma-export/01-login.html` ~ `13-lawyer-search-results.html` — Figma 익스포트 원본
- `src/index.css` — 현재 디자인 토큰 정의
- `src/components/ui/Button.tsx`, `src/components/mobile/PageHeader.tsx` — Phase 2에서 수정될 공용 컴포넌트
- `src/routes/auth/*.tsx`, `src/routes/client/*.tsx` — Phase 3~6 대상 페이지

---

## 4. 확정된 의사결정 (재논의 불필요)

다음은 이미 결정된 사항이므로 **재검토 대상이 아닙니다**:

1. **본문 폰트**: Pretendard Variable 유지 (Figma의 Roboto/Inter 미반영은 의도 — 한글 가독성 우선)
2. **Primary 색**: `--color-brand: #1f8cf9` 단일 토큰. `brand-primary`/`brand-deep` 제거
3. **예외 색**: 워드마크 `#3688f4`(SHIELD 로고)와 분류 라벨 `#0680f9`(2~3곳)는 인라인 유지 — 토큰화 X
4. **모바일 프레임**: `max-w-[390px]` 유지 (Figma의 절대 픽셀 좌표는 flex로 변환)

---

## 5. 리뷰 관점 (다음 6개 축으로 평가)

각 항목에 대해 **PASS / CONCERN / CRITICAL** 라벨 + 구체 근거 + 개선안을 주세요.

### A. Phase 순서 타당성
- 토큰 → 컴포넌트 → 인증 → 상담 → 검토 → 변호사 → 마무리 순서가 의존성 측면에서 합리적인가?
- 더 빠르거나 안전한 대안 순서가 있는가? (예: 페이지 단위 수직 슬라이스 vs 현재의 수평 슬라이스)
- Phase 간 의존성 누락이 있는가?

### B. 기술적 정확성 (Tailwind v4 + CSS custom property)
- `--shadow-btn: 0 4px 8px rgba(35, 37, 41, 0.08)` 같은 raw shadow 토큰을 `shadow-[var(--shadow-btn)]`로 쓰는 패턴이 **Tailwind v4 임의 값 문법에서 실제로 동작**하는가? 더 권장되는 방식이 있는가?
- `@theme` 블록에서 `--color-brand-primary` 제거 후, 그 토큰을 사용하던 `bg-brand-primary` 클래스가 **빌드 타임에 깨지는지 / 런타임에 깨지는지** — 발견 타이밍과 대응이 적절한가?
- `--radius-sm/md/lg` 추가 시 Tailwind 기본 유틸리티(`rounded-sm` 등)와 충돌하지 않는가?
- `hover:bg-blue-600` (Tailwind 기본 팔레트)이 `--color-brand` 변경 후에도 그대로 남는 문제 — Phase 2-A의 `hover:brightness-95` 전환 외에 다른 곳에서도 영향이 있을 수 있는데, 검색 전략이 충분한가?

### C. 위험·롤백 전략
- 문서 끝 "위험·주의 사항" 5개로 충분한가? 누락된 위험은?
- 각 Phase 실패 시 롤백 단위가 명확한가? (커밋 단위 rollback 가능한가)
- Phase 1 토큰 변경이 modified 14개 파일과 충돌할 가능성 — 대응이 충분한가?

### D. 검증 단계
- 각 Phase의 검증(`pnpm build`, 시각 비교, Chrome DevTools 스크린샷)이 회귀를 충분히 잡는가?
- 자동화할 수 있는 부분(visual regression, color diff lint 등)이 있는가? 도입 ROI는?
- "Figma HTML과 사이드-바이-사이드 비교"는 주관적 — 더 객관적 기준이 있는가?

### E. 커밋 분리 및 PR 전략
- 각 Phase 안의 커밋 단위가 PR 리뷰어 친화적인가? (너무 잘게? 너무 묶임?)
- Phase 6-3(`LawyerListPage`)을 별도 PR로 분리한 판단이 타당한가? 다른 분리 후보는?
- 한 페이지(`BriefDetailPage`)가 Phase 4-3과 5-1에서 두 번 만져지는 점 — 더 좋은 처리법은?

### F. 누락·범위 적정성
- 13개 Figma 파일 중 phase 문서가 다루지 않는 디자인 요소가 있는가? (`BriefDeliveryPage`에 대응 Figma 없음은 인지함 — 다른 누락은?)
- 접근성(focus ring, contrast ratio), 다크모드, i18n 같은 메타 관심사가 마이그레이션 중 깨질 가능성 — 어디서 챙겨야 하는가?
- 시간 추정치(Phase별 30분~3시간)는 1인 개발자 기준으로 현실적인가?

---

## 6. 기대 산출물 형식

```markdown
## 종합 평가
[1~3문장 요약 + Go/Hold/Revise 권고]

## 항목별 평가
### A. Phase 순서 — [PASS/CONCERN/CRITICAL]
- 근거:
- 개선안:

### B. 기술적 정확성 — [PASS/CONCERN/CRITICAL]
...

(C~F 동일)

## 추가 제안
[질문되지 않았지만 도움 될 만한 사항]

## 검증해 본 가설/팩트
[Tailwind v4 문법 등 실제 확인한 항목 + 근거 링크/출처]
```

- **언어**: 한국어
- **분량**: 항목당 5~10줄 권장, 전체 1500~2500 단어
- **출처 표기**: Tailwind v4 동작 같은 검증 가능한 주장에는 공식 문서 링크 첨부

---

## 7. 제약·맥락 (판단 기준)

- **개발자 수**: 1인 (시간/리뷰 비용 최소화 선호)
- **배포**: Vercel SPA (`pnpm build` 결과를 정적 호스팅)
- **브랜치 전략**: 현재 작업 중 브랜치 위에서 진행. main(또는 develop) 머지 전 PR 리뷰 있음
- **CI**: lint + build만 (시각 회귀 자동화 없음)
- **테스트**: 단위 테스트 비중 낮음. 시각 검증이 주

---

## 8. 첨부 (paste용)

Perplexity Computer에 파일 접근 권한이 없는 경우, 본 의뢰서 뒤에 다음 두 파일 전체를 paste하여 전달:

1. `docs/figma-migration-phases.md` (주 리뷰 대상)
2. `docs/figma-migration-analysis.md` (배경 분석)

선택적으로 `src/index.css`, `src/components/ui/Button.tsx`도 첨부하면 B(기술적 정확성) 평가가 더 정확해집니다.
