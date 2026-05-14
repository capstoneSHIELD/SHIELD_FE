# Figma Design Reference

이 폴더에는 Figma MCP `get_design_context` API로 추출한 디자인 정답지 파일이 포함되어 있습니다.

## 용도

- 현재 구현 코드와 Figma 원본 디자인 간의 시각적 차이를 비교하는 참조 자료
- UI realign 작업 시 ground truth로 사용
- 코드에서 직접 import하지 않음 (런타임에 사용되지 않음)

## 파일 형식

- `.html` — 초기에 가져온 파일 (Tailwind CDN 포함, 브라우저에서 직접 열기 가능)
- `.jsx` — 이후에 가져온 파일 (React JSX + Tailwind 클래스, 참조용)

## 폴더 구조

- `pages/auth/*` — 인증 플로우 화면별 레퍼런스
- `pages/client/*` — 의뢰인 화면별 레퍼런스
- `pages/lawyer/*` — 변호사 화면별 레퍼런스
- `pages/admin/*` — 관리자 화면별 레퍼런스
- `pages/redesign-2026-05-14/*` — 2026-05-14에 받은 Tailwind HTML Generator 리디자인 산출물

기존 루트의 flat 파일들은 이전 링크 호환을 위해 남겨두고, 페이지별 폴더에 같은 파일을 복사해두었습니다.
새로 받은 `C:\Users\to264\Downloads\figma_htmlgenerator_TailWind (1)` 산출물은 로그인 페이지로 판별되어 `pages/redesign-2026-05-14/auth/login_page/index.html`에 정리했습니다.

## 원본 Figma 파일

- File Key: `6eFZg6uOGTZiiNZTA8YyGF`
- 이름: 캡스톤 쉴드 와이어프레임

## 화면 매핑

| 파일 | Figma 화면 | 대응 구현 파일 |
| ---- | ---- | ---- |
| pages/auth/splash_page/splash_page.html | 스플래시 | src/routes/auth/SplashPage.tsx |
| pages/auth/login_page/login_page.html | 로그인 | src/routes/auth/LoginPage.tsx |
| pages/auth/role_selection/role_selection.html | 역할 선택 | src/routes/auth/RoleSelectPage.tsx |
| pages/auth/client_signup/client_signup.html | 의뢰인 가입 | src/routes/auth/ClientRegisterPage.tsx |
| pages/auth/lawyer_signup/lawyer_signup.html | 변호사 가입 | src/routes/auth/LawyerRegisterPage.tsx |
| pages/client/manual_field_selection/manual_field_selection.html | 분야 선택 | src/routes/client/NewConsultationPage.tsx |
| pages/client/chat_consultation/chat_consultation.html | 채팅 상담 | src/routes/client/ChatPage.tsx |
| pages/client/classification_results/classification_results.html | 분류 결과 | src/routes/client/AnalyzingPage.tsx |
| pages/client/processing_case/processing_case.html | 분석 중 | src/routes/client/AnalyzingPage.tsx |
| pages/client/case_analysis/case_analysis.jsx | 분석 리포트 | src/routes/client/BriefDetailPage.tsx |
| pages/client/privacy_settings/privacy_settings.jsx | 개인정보 설정 | src/routes/client/PrivacySettingsPage.tsx |
| pages/client/final_review/final_review.jsx | 최종 확인 | src/routes/client/FinalReviewPage.tsx |
| pages/client/lawyer_search_results/lawyer_search_results.jsx | 변호사 찾기 | src/routes/client/LawyerListPage.tsx |
| pages/client/lawyer_profile/lawyer_profile.jsx | 변호사 프로필 | src/routes/client/LawyerProfilePage.tsx |
| pages/client/request_confirmation/request_confirmation.jsx | 전달 확인 | src/routes/client/RequestConfirmPage.tsx |
| pages/client/request_tracking/request_tracking.jsx | 의뢰 현황 | src/routes/client/RequestTrackingPage.tsx |
| pages/admin/admin_dashboard/admin_dashboard.jsx | 관리자 콘솔 | src/routes/admin/AdminDashboardPage.tsx |
| pages/admin/admin_application_list/admin_application_list.jsx | 가입 심사 | src/routes/admin/LawyerPendingPage.tsx |
| pages/admin/admin_application_detail/admin_application_detail.jsx | 신청 상세 | src/routes/admin/LawyerReviewPage.tsx |
| pages/admin/admin_history/admin_history.jsx | 처리 이력 | src/routes/admin/LogsPage.tsx |
| pages/lawyer/lawyer_dashboard/lawyer_dashboard.jsx | 변호사 대시보드 | src/routes/lawyer/DashboardPage.tsx |
| pages/lawyer/lawyer_inbox/lawyer_inbox.jsx | 의뢰함 | src/routes/lawyer/InboxPage.tsx |
| pages/lawyer/lawyer_inbox_detail/lawyer_inbox_detail.jsx | 의뢰 상세 | src/routes/lawyer/InboxDetailPage.tsx |
| pages/lawyer/lawyer_my_profile/lawyer_my_profile.jsx | 내 프로필 | src/routes/lawyer/ProfileEditPage.tsx |
| pages/redesign-2026-05-14/auth/login_page/index.html | 로그인 리디자인 | src/routes/auth/LoginPage.tsx |
