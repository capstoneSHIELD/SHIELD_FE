import type { Page, Route } from '@playwright/test';
import {
  MOCK_TOKEN,
  TOKEN_KEY,
  USERS,
  mockBrief,
  mockBriefSummary,
  mockConsultation,
  mockDelivery,
  mockInboxDetail,
  mockInboxList,
  mockLawyer,
  mockLawyerList,
  mockLawyerProfile,
  mockMessages,
  mockAdminPendingList,
  mockAdminPendingLawyer,
} from './mockData';

type Role = 'USER' | 'LAWYER' | 'ADMIN';

interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

function ok<T>(data: T) {
  return { result: true, message: '성공', data };
}

function paginated<T>(items: T[]): PaginatedResponse<T> {
  return {
    content: items,
    page: 0,
    size: 20,
    totalElements: items.length,
    totalPages: 1,
    hasNext: false,
  };
}

/**
 * 인증 토큰을 localStorage 에 주입하고 /users/me 응답을 role 에 맞게 설정한다.
 * App.tsx 의 `initialize()` 가 이 토큰으로 사용자 정보를 요청하면서
 * useAuthStore 가 isAuthenticated=true 로 전환된다.
 *
 * 호출 순서가 중요:
 *   1. await setupApiMocks(page, role)
 *   2. await page.goto(url)
 */
export async function setupApiMocks(page: Page, role: Role): Promise<void> {
  await page.addInitScript(
    ({ token, key }) => {
      window.localStorage.setItem(key, token);
    },
    { token: MOCK_TOKEN, key: TOKEN_KEY },
  );

  await page.route('**/api/**', (route) => handleApiRequest(route, role));
}

async function handleApiRequest(route: Route, role: Role): Promise<void> {
  const url = new URL(route.request().url());
  const path = url.pathname.replace(/^.*\/api/, '');
  const method = route.request().method();

  // ── User ──
  if (path === '/users/me' && method === 'GET') {
    return json(route, ok(USERS[role.toLowerCase() as 'client' | 'lawyer' | 'admin']));
  }

  // ── Consultations ──
  if (path === '/consultations' && method === 'GET') {
    return json(route, ok(paginated([mockConsultation])));
  }
  if (path === '/consultations' && method === 'POST') {
    return json(
      route,
      ok({
        consultationId: mockConsultation.consultationId,
        status: 'COLLECTING',
        welcomeMessage: '안녕하세요! SHIELD 법률 AI 상담을 시작합니다.',
        createdAt: '2025-01-15T10:00:00',
      }),
    );
  }
  if (/^\/consultations\/[^/]+\/messages$/.test(path) && method === 'GET') {
    return json(route, ok(paginated(mockMessages)));
  }
  if (/^\/consultations\/[^/]+$/.test(path) && method === 'GET') {
    return json(route, ok(mockConsultation));
  }

  // ── Briefs ──
  if (path === '/briefs' && method === 'GET') {
    return json(route, ok(paginated([mockBriefSummary])));
  }
  if (/^\/briefs\/[^/]+\/lawyer-recommendations$/.test(path) && method === 'GET') {
    return json(route, ok(paginated(mockLawyerList)));
  }
  if (/^\/briefs\/[^/]+\/deliveries$/.test(path) && method === 'GET') {
    return json(route, ok({ deliveries: [mockDelivery] }));
  }
  if (/^\/briefs\/[^/]+$/.test(path) && method === 'GET') {
    return json(route, ok(mockBrief));
  }

  // ── Lawyer self ──
  if (path === '/lawyers/me' && method === 'GET') {
    return json(route, ok(mockLawyerProfile));
  }
  if (path === '/lawyers/me/verification-status' && method === 'GET') {
    return json(
      route,
      ok({
        verificationStatus: 'VERIFIED',
        verifiedAt: '2025-01-18T10:00:00',
        requestedAt: '2025-01-16T10:30:00',
        rejectionReason: null,
        barAssociationNumber: '12345',
      }),
    );
  }
  if (path === '/lawyers/me/documents' && method === 'GET') {
    return json(route, ok([
      {
        documentId: 'd1',
        fileName: 'lawyer-license.pdf',
        fileSize: 524288,
        fileType: 'application/pdf',
        fileUrl: 'https://cdn.shieldai.kr/documents/lawyer-license.pdf',
        createdAt: '2025-01-16T11:00:00',
      },
    ]));
  }

  // ── Public lawyer browse ──
  if (path === '/lawyers' && method === 'GET') {
    return json(route, ok(paginated(mockLawyerList)));
  }
  if (/^\/lawyers\/[^/]+$/.test(path) && method === 'GET') {
    return json(route, ok(mockLawyer));
  }

  // ── Lawyer inbox ──
  if (path === '/lawyer/inbox/stats' && method === 'GET') {
    return json(route, ok({ all: 12, newCount: 3, reviewing: 2, confirmed: 4, rejected: 1, responded: 6 }));
  }
  if (path === '/lawyer/inbox' && method === 'GET') {
    return json(route, ok(paginated(mockInboxList)));
  }
  if (/^\/lawyer\/inbox\/[^/]+$/.test(path) && method === 'GET') {
    return json(route, ok(mockInboxDetail));
  }

  // ── Admin ──
  if (path === '/admin/lawyers/pending' && method === 'GET') {
    return json(route, ok(paginated(mockAdminPendingList)));
  }
  if (/^\/admin\/lawyers\/[^/]+$/.test(path) && method === 'GET') {
    return json(route, ok({
      ...mockAdminPendingLawyer,
      bio: '민사 전문 변호사로 등록 신청합니다.',
      tags: ['임대차', '보증금'],
      documents: [
        { documentId: 'd1', fileName: 'license.pdf', fileType: 'application/pdf' },
      ],
    }));
  }
  if (path === '/admin/dashboard/stats' && method === 'GET') {
    return json(route, ok({
      pendingCount: 5,
      reviewingCount: 3,
      verifiedCount: 24,
      rejectedCount: 2,
      todayProcessed: 4,
      weeklyProcessed: 12,
    }));
  }
  if (path === '/admin/logs' && method === 'GET') {
    return json(route, ok(paginated([
      { logId: 'l1', adminName: '관리자', action: 'APPROVE', targetName: '김변호사', processedAt: '2025-01-20T10:00:00' },
    ])));
  }

  // ── Fallback: empty success ──
  return json(route, ok(null));
}

async function json(route: Route, body: unknown): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}
