import { expect, test } from '@playwright/test';
import { setupApiMocks } from '../fixtures/mockApi';

/**
 * Phase 5 — 적응형 UI 회귀 방지 스크린샷 스위트.
 *
 * playwright.config.ts 의 3개 project (mobile-360 / tablet-768 / desktop-1440)
 * 에서 동일 spec 을 실행하므로 화면당 3장의 baseline 이 생성된다.
 *
 * 캡처 대상 (phases.md §Phase 5 자동화 후보 기준):
 *   - auth: 2 (LoginPage, RoleSelectPage)
 *   - client: 5 (Home, NewConsultation, Chat, BriefDetail, LawyerList)
 *   - lawyer: 4 (Dashboard, Inbox, InboxDetail, Cases)
 *   - admin: 3 (AdminDashboard, LawyerPending, LawyerReview)
 *
 * 운영 노트:
 *   - 첫 실행: `npm run test:e2e:update` 로 baseline 생성
 *   - 회귀 확인: `npm run test:e2e` (diff 발생 시 test-results/ 에 actual/diff 저장)
 *   - polyfill / 폰트 차이로 인한 false positive 는 expect.toHaveScreenshot threshold 조정
 */

const SCREENS = [
  // ── Auth (2) ──
  { name: 'auth-login',           role: null,    url: '/login',                        waitFor: 'SHIELD' },
  { name: 'auth-role-select',     role: 'USER',  url: '/role-select',                  waitFor: '역할' },

  // ── Client (5) ──
  { name: 'client-home',          role: 'USER',  url: '/home',                          waitFor: '홈' },
  { name: 'client-new-consult',   role: 'USER',  url: '/consultations/new',             waitFor: '상담' },
  { name: 'client-chat',          role: 'USER',  url: '/consultations/660e8400-e29b-41d4-a716-446655440001', waitFor: '상담' },
  { name: 'client-brief-detail',  role: 'USER',  url: '/briefs/770e8400-e29b-41d4-a716-446655440002',         waitFor: '의뢰서' },
  { name: 'client-lawyer-list',   role: 'USER',  url: '/lawyers',                       waitFor: '변호사' },

  // ── Lawyer (4) ──
  { name: 'lawyer-dashboard',     role: 'LAWYER', url: '/lawyer',                       waitFor: '대시보드' },
  { name: 'lawyer-inbox',         role: 'LAWYER', url: '/lawyer/inbox',                 waitFor: '의뢰' },
  { name: 'lawyer-inbox-detail',  role: 'LAWYER', url: '/lawyer/inbox/aa0e8400-e29b-41d4-a716-446655440005', waitFor: '의뢰서' },
  { name: 'lawyer-cases',         role: 'LAWYER', url: '/lawyer/cases',                 waitFor: '진행' },

  // ── Admin (3) ──
  { name: 'admin-dashboard',      role: 'ADMIN', url: '/admin',                         waitFor: '관리자' },
  { name: 'admin-lawyer-pending', role: 'ADMIN', url: '/admin/lawyers',                 waitFor: '심사' },
  { name: 'admin-lawyer-review',  role: 'ADMIN', url: '/admin/lawyers/990e8400-e29b-41d4-a716-446655440007', waitFor: '심사' },
] as const;

for (const screen of SCREENS) {
  test(`screenshot: ${screen.name}`, async ({ page }) => {
    if (screen.role) {
      await setupApiMocks(page, screen.role);
    }

    await page.goto(screen.url);

    // 페이지 hydration / lazy-load 대기. waitFor 텍스트는 화면별 핵심 헤더에 맞춤.
    await page
      .waitForLoadState('networkidle', { timeout: 10_000 })
      .catch(() => {
        // SPA 에서 background fetch 가 떠 있을 수 있어 timeout 은 허용한다.
      });

    // 깜빡임 방지 — Toaster, lazy spinner 등이 사라지길 잠깐 대기
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot(`${screen.name}.png`, {
      fullPage: true,
    });
  });
}
