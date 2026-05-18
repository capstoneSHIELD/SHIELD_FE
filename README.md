# SHIELD Frontend

> AI 법률 상담 인테이크 + 변호사 매칭 플랫폼 — React + TypeScript + Vite SPA

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/status-capstone-blue)

---

## 프로젝트 소개

SHIELD 프론트엔드는 사용자가 법률 용어를 모르더라도 **챗봇 대화만으로 사건 정보를 구조화**할 수 있게 하는 SPA다. 사용자/변호사/관리자 3개 역할의 화면을 단일 앱으로 제공하며, 상담 → 의뢰서 생성 → 변호사 매칭까지 전체 흐름을 담당한다. 백엔드의 RAG 응답은 항상 출처와 함께 표기되며, **변호사 추천이나 법률 자문은 수행하지 않고 사용자가 목록에서 직접 선택**한다 (변호사법 준수).

## 주요 기능

- **3개 역할 분기** — 일반 사용자(USER) / 변호사(LAWYER) / 관리자(ADMIN) 별 라우트 가드
- **상담 채팅** — 슬롯 기반 인테이크 챗봇 UI, 분야 자동 분류 + 직접 수정 가능
- **의뢰서 흐름** — 분석 중(ANALYZING) → 최종 검토 → 확정 → 변호사 매칭 → 전달 추적
- **변호사 영역** — 인증 증빙 업로드, 받은 의뢰함, 사건 관리, 프로필 편집
- **관리자 콘솔** — 변호사 인증 검수, 대시보드, 로그 열람
- **소셜 로그인** — Google · Naver · Kakao OAuth 콜백 처리

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Core | React 19 · TypeScript 6 · Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) · `clsx` + `tailwind-merge` |
| Routing | React Router v7 (라우트는 `App.tsx`에서 `lazy()`로 일괄 등록) |
| Server State | TanStack Query v5 (`src/hooks/`) |
| Client State | Zustand v5 (`src/stores/`) |
| Forms | React Hook Form + Zod 스키마 검증 |
| HTTP | Axios (단일 인스턴스 `src/lib/api.ts`) |
| Icons | lucide-react |
| Push | Firebase Cloud Messaging |
| Test | Vitest · Testing Library · MSW (API 모킹) |
| Deploy | Vercel (SPA rewrite + 보안 헤더 적용) |

## 프로젝트 구조

```
src/
├── App.tsx           라우트 단일 등록 지점 (모든 페이지는 lazy import)
├── routes/
│   ├── auth/         로그인 · 소셜 콜백 · 회원가입 · 역할 선택
│   ├── client/       일반 사용자: 상담 · 채팅 · 의뢰서 · 변호사 탐색
│   ├── lawyer/       변호사: 인증 · 받은 의뢰 · 사건 · 문서
│   ├── admin/        관리자: 대시보드 · 변호사 검수 · 로그
│   └── legal/        약관 · 개인정보처리방침
├── components/       chat · client · consultation · layout · mobile · ui
├── guards/           역할/인증 라우트 가드
├── hooks/            TanStack Query 훅 (서버 상태)
├── stores/           Zustand 스토어 (UI 상태)
├── lib/              api 클라이언트 · cn() · constants · 유틸
├── types/            enum · DTO 타입
└── layouts/          역할별 공용 레이아웃
```

## 시작하기

### 사전 요구사항

- Node.js **18+**
- npm 10+ (`packageManager: npm@10.9.0`)
- 백엔드 API 서버 ([SHIELD_BE](https://github.com/capstoneSHIELD/SHIELD_BE)) — 로컬 또는 원격

### 실행

```bash
# 1. 의존성 설치
npm ci

# 2. 환경변수 파일 생성
#    필요한 키 목록과 의미는 docs/setup.md 참조
touch .env
#    (VITE_API_URL · 소셜 로그인 클라이언트 ID 등을 채움)

# 3. 개발 서버
npm run dev
# → https://localhost:5174  (basicSsl 플러그인으로 HTTPS 자동 적용)

# 4. 타입체크 + 프로덕션 빌드
npm run build

# 5. 테스트
npm test            # 1회 실행
npm run test:watch  # watch 모드
```

## 상태 흐름

상담·의뢰서·법률 분야는 백엔드 enum과 1:1로 매칭된다.

- **Consultation**: `COLLECTING` → `ANALYZING` → `AWAITING_CONFIRM` → `CONFIRMED` | `REJECTED`
- **Brief**: `DRAFT` → `CONFIRMED` → `DELIVERED` | `DISCARDED`
- **Domain**: `CIVIL` · `CRIMINAL` · `LABOR` · `SCHOOL_VIOLENCE` (+ "잘 모르겠어요")

## 관련 문서

| 문서 | 용도 |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | 개발자/AI 협업 규칙 (라우팅·상태관리·커밋 컨벤션) |
| [`docs/setup.md`](docs/setup.md) | 개발 환경 셋업 · 환경변수 키 목록 |
| [`docs/architecture.md`](docs/architecture.md) | 앱 아키텍처 개요 |
| [`docs/api-integration.md`](docs/api-integration.md) | 백엔드 API 연동 가이드 |
| [`docs/components.md`](docs/components.md) | 공용 컴포넌트 카탈로그 |
| [`docs/figma-migration-phases.md`](docs/figma-migration-phases.md) | Figma → 코드 마이그레이션 진행 기록 |

## 관련 레포지토리

- **Backend** — [capstoneSHIELD/SHIELD_BE](https://github.com/capstoneSHIELD/SHIELD_BE) · Spring Boot 4 + PostgreSQL/pgvector
- **Documentation** — [capstoneSHIELD/SHEILD-DOCX](https://github.com/capstoneSHIELD/SHEILD-DOCX) · 캡스톤 산출물 (레포명 표기는 원본 그대로)

## 법적 제약 (변호사법)

본 시스템은 사용자가 작성한 정보를 **구조화 · 검색 · 전달**하는 기능만 제공한다. 다음은 명시적으로 수행하지 않는다.

- 법률 자문 · 의견 제공
- 특정 변호사 추천 · 우선순위 부여
- 승소 가능성 예측

변호사 선택은 항상 사용자가 목록에서 직접 수행하며, 백엔드 RAG 응답은 출처를 함께 표기한다.

## 라이선스

학내 캡스톤 프로젝트 — 별도 라이선스 미부여 (All rights reserved).
