# 변호사 전용 페이지 UI/UX 정합성 검사 리포트

검사일: 2026-05-27  
범위: `LawyerLayout` 하위 `/lawyer*` 변호사 전용 화면  
검사 방식: 코드 기반 정합성 점검, 라우트/상태 분기 확인, 정적 검증

## 요약

- 한국어 문구와 `aria-label`은 현재 소스 기준으로 깨짐 없이 저장되어 있다.
- `npm.cmd run lint`는 통과했지만 변호사 가입 화면의 기존 warning 1건이 있다. 변호사 전용 화면 관련 lint error는 없다.
- `npm.cmd run build`는 성공했다.
- 뷰포트별 스크린샷 캡처는 저장소에 Playwright/Cypress 같은 브라우저 자동화 도구가 없어 실행하지 못했다. 수동 QA는 모바일 `360x800`, 태블릿 `768x1024`, 데스크톱 `1440x900`에서 이어서 진행해야 한다.

## 주요 결함

### P1

- 의뢰함 필터 키가 계획 및 상태 모델과 맞지 않는다. 계획은 `ALL/DELIVERED/CONFIRMED/REJECTED` 검사를 요구하지만, 실제 `/lawyer/inbox`는 `ALL/NEW/REVIEWING/RESPONDED`를 API `filter`로 전송한다. 대시보드 통계 카드도 같은 query를 사용한다. 백엔드가 `DeliveryStatus` 중심으로 동작하면 필터 결과가 비거나 통계와 목록이 어긋날 수 있다.  
  근거: `src/routes/lawyer/InboxPage.tsx:17`, `src/routes/lawyer/InboxPage.tsx:95`, `src/routes/lawyer/DashboardPage.tsx:138`, `src/types/enums.ts:19`

- 인증 신청이 빈 변호사 등록번호로 제출되고 실패 피드백이 없다. `handleApply`가 `{ barAssociationNumber: '' }`를 보내며 catch에서 사용자 메시지를 표시하지 않는다. API가 필수값을 요구하면 버튼을 눌러도 화면상 아무 일도 없는 UX가 된다.  
  근거: `src/routes/lawyer/VerificationPage.tsx:72`

- 오류 상태가 대부분 빈 상태처럼 보인다. 목록/상세/프로필/인증/문서 화면에서 `isError` 또는 실패 메시지 UI가 거의 없어 네트워크 실패와 실제 빈 데이터가 구분되지 않는다. 특히 문서 목록은 fetch 실패 후 `documents=[]`로 빈 목록을 보여준다.  
  근거: `src/routes/lawyer/InboxPage.tsx:130`, `src/routes/lawyer/InboxDetailPage.tsx:74`, `src/routes/lawyer/DocumentsPage.tsx:124`

### P2

- `/lawyer/verification`, `/lawyer/documents`는 공통 `LawyerPage`/`LawyerCard`가 아니라 자체 `<div>`와 공통 `Card`를 사용한다. 배경, 최소 높이, 카드 border, 빈 상태 톤이 다른 변호사 화면과 어긋날 수 있다.  
  근거: `src/routes/lawyer/VerificationPage.tsx:94`, `src/routes/lawyer/DocumentsPage.tsx:230`, `src/components/lawyer/LawyerChrome.tsx:59`

- 데스크톱에서 변호사 페이지 콘텐츠가 `max-w-7xl`까지 단일 컬럼으로 늘어난다. 카드형 모바일 UI가 1440px 화면에서 지나치게 넓어질 수 있어, 페이지별 최대 폭 또는 데스크톱 레이아웃 기준 확인이 필요하다.  
  근거: `src/layouts/LawyerLayout.tsx:20`, `src/routes/lawyer/DashboardPage.tsx:116`, `src/routes/lawyer/InboxPage.tsx:129`

- 카드 날짜 라벨이 부정확하다. 대시보드/의뢰함은 `sentAt`을 "진단"으로 표시하고, 진행 중 사건은 `sentAt`을 "수락일"로 표시한다. 사용자가 의뢰 수신일, 전달일, 수락일을 혼동할 수 있다.  
  근거: `src/routes/lawyer/DashboardPage.tsx:87`, `src/routes/lawyer/InboxPage.tsx:66`, `src/routes/lawyer/CasesPage.tsx:70`

- 내 프로필의 대표 전문 분야가 코드값 그대로 보일 수 있다. 다른 카드들은 `LawyerDomainPill`/도메인 메타를 쓰지만 프로필 헤더는 `profile.domains[0]`를 직접 출력한다.  
  근거: `src/routes/lawyer/LawyerProfilePage.tsx:123`, `src/components/lawyer/LawyerChrome.tsx:92`

- 인증 상태 색상이 프로필과 인증 페이지에서 다르다. `SUPPLEMENT_REQUESTED`는 프로필에서 red, 인증 페이지에서 orange 계열이다.  
  근거: `src/routes/lawyer/LawyerProfilePage.tsx:29`, `src/routes/lawyer/VerificationPage.tsx:54`

### P3

- 문서 업로드 드롭존은 클릭 가능한 `<div>`지만 `role="button"`, `tabIndex`, 키보드 핸들러가 없다. 키보드 사용자는 파일 선택을 열기 어렵다.  
  근거: `src/routes/lawyer/DocumentsPage.tsx:240`

- 여러 로딩 스피너가 텍스트 없이 사용되어 기본 `aria-label="Loading"`이 노출된다. 한국어 서비스 톤과 접근성 안내를 맞추려면 `text="불러오는 중..."` 같은 라벨을 지정하는 편이 좋다.  
  근거: `src/components/ui/Spinner.tsx:20`, `src/routes/lawyer/DashboardPage.tsx:119`

- 거절 사유 textarea의 label이 `htmlFor`/`id`로 연결되어 있지 않다. 시각적으로는 보이지만 스크린리더 폼 탐색에서 관계가 약하다.  
  근거: `src/routes/lawyer/InboxDetailPage.tsx:233`

- 공통 Modal의 닫기 버튼 `aria-label`이 영어 `Close modal`이다. 변호사 화면의 한국어 `aria-label` 기준과 다르다.  
  근거: `src/components/ui/Modal.tsx`

## 페이지별 점검 기록

### 공통 레이아웃

- 하단 탭과 사이드바의 라벨은 `대시보드`, `의뢰함`, `진행 중`, `프로필`로 정상이다.
- `/lawyer/profile/edit`는 별도 화면 없이 `/lawyer/profile`로 replace redirect한다.
- 모바일 하단 nav를 고려한 `pb-20`은 `LawyerLayout`에 있고, 대부분 페이지가 추가 `pb-24` 또는 `pb-28`을 둔다. 상세 CTA처럼 sticky 요소가 있는 화면은 실제 모바일 캡처에서 겹침 여부를 확인해야 한다.

### `/lawyer`

- 인사 카드, 통계 카드, 최근 의뢰 카드가 모두 `LawyerCard`를 사용해 기본 톤은 맞다.
- 통계 카드 query가 `NEW/REVIEWING/RESPONDED`라 상태 필터 정책 확인이 필요하다.
- 최근 의뢰 없음 상태는 `LawyerEmptyState`가 아니라 단순 `LawyerCard`라 의뢰함/진행 중 사건의 빈 상태와 다르다.

### `/lawyer/inbox`

- 필터 탭은 4개 grid로 구성되어 모바일 폭에서 기본 텍스트는 맞지만, 계획의 상태 키와 다르다.
- 빈 상태와 로딩 상태는 공통 컴포넌트를 사용한다.
- 카드 하단 날짜 라벨 "진단"은 용어 수정 후보다.

### `/lawyer/inbox/:id`

- 상세 구조는 헤더, 알림, 요약 카드, 본문/쟁점/키워드/의뢰인 섹션으로 명확하다.
- 수락/거절 CTA는 `sticky bottom-20`으로 모바일 nav 회피를 의도하지만, 데스크톱에서 `lg:bottom-0`로 바뀌는 동작은 실제 화면 확인이 필요하다.
- mutation 실패 UI가 없다. 성공 메시지는 표시되지만 실패 시 모달이 그대로 남거나 아무 변화가 없을 수 있다.

### `/lawyer/cases`

- `CONFIRMED` 필터로 진행 중 사건만 조회한다.
- 카드 스타일은 `LawyerCard` 기반으로 의뢰함과 가깝다.
- `sentAt`을 "수락일"로 표시하므로 실제 수락일 필드가 없다는 점을 명확히 해야 한다.

### `/lawyer/profile`

- 프로필 이미지, 인증 배지, 저장/로그아웃 CTA, 관리 링크 구성은 갖춰져 있다.
- `SpecializationPicker`, 경력 input, 소개 textarea의 validation/error는 일부만 있다. 저장 실패 메시지는 없다.
- 대표 전문 분야와 선택 전문 분야의 표시 단위가 domain/subDomain/tag 중 무엇인지 명확하지 않다.

### `/lawyer/verification`

- 인증 상태별 카드 5종은 모두 정의되어 있다.
- API 실패 피드백과 거절 사유 노출이 없다.
- 공통 `LawyerPage`/`LawyerCard`를 쓰지 않아 다른 변호사 화면과 미세하게 다를 수 있다.

### `/lawyer/documents`

- 파일 선택, 다중 업로드, 확장자/용량 validation, 파일별 업로드 상태는 구현되어 있다.
- fetch/upload 실패 메시지가 구체적이지 않다. 실패 파일에 `errorMsg`를 저장할 수 있지만 UI에는 표시하지 않는다.
- 드롭존 접근성과 모바일 좁은 폭에서 두 버튼 배치 확인이 필요하다.

## 검증 결과

```text
npm.cmd run lint
결과: 성공, warning 1건
warning: src/routes/auth/LawyerRegisterPage.tsx:77 react-hooks/incompatible-library

npm.cmd run build
결과: 성공
```

## 후속 권장 순서

1. 필터 상태 키와 인증 신청 실패 피드백을 먼저 수정한다.
2. 네트워크 오류 상태를 빈 상태와 분리한다.
3. `VerificationPage`와 `DocumentsPage`를 `LawyerPage`/`LawyerCard` 기준으로 맞춘다.
4. 날짜 라벨, 도메인 라벨, 인증 상태 색상 같은 용어/표시 정합성을 정리한다.
5. 브라우저 수동 QA로 3개 뷰포트 스크린샷을 캡처해 sticky CTA, 하단 nav, 데스크톱 폭을 확인한다.
