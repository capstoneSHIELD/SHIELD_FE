/**
 * Playwright 스크린샷 테스트용 mock 데이터.
 *
 * src/test/mocks/handlers.ts (MSW) 와 같은 shape 을 사용해 일관성을 유지한다.
 * 변경 시 양쪽을 함께 업데이트할 것.
 */

export const USERS = {
  client: {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'client@example.com',
    name: '홍길동',
    role: 'USER' as const,
    provider: 'google',
    profileImageUrl: null,
    phone: '010-1234-5678',
  },
  lawyer: {
    userId: '550e8400-e29b-41d4-a716-446655440010',
    email: 'lawyer@example.com',
    name: '김변호사',
    role: 'LAWYER' as const,
    provider: 'google',
    profileImageUrl: null,
    phone: '010-2222-3333',
  },
  admin: {
    userId: '550e8400-e29b-41d4-a716-446655440020',
    email: 'admin@example.com',
    name: '관리자',
    role: 'ADMIN' as const,
    provider: 'google',
    profileImageUrl: null,
    phone: '010-9999-9999',
  },
};

export const TOKEN_KEY = 'shield_access_token';
export const MOCK_TOKEN = 'mock-screenshot-token';

export const mockConsultation = {
  consultationId: '660e8400-e29b-41d4-a716-446655440001',
  status: 'COLLECTING',
  userDomains: ['CIVIL'],
  userSubDomains: ['LEASE'],
  userTags: ['계약분쟁'],
  aiDomains: null,
  aiSubDomains: null,
  aiTags: null,
  lastMessage: '안녕하세요, 상담을 시작합니다.',
  lastMessageAt: '2025-01-15T10:30:00',
  createdAt: '2025-01-15T10:00:00',
  brief: {
    briefId: '770e8400-e29b-41d4-a716-446655440002',
    title: '임대차 분쟁 의뢰서',
    status: 'DRAFT',
  },
};

export const mockMessages = [
  {
    messageId: 'm1',
    role: 'CHATBOT',
    content: '안녕하세요! SHIELD 법률 AI 상담을 시작합니다.',
    createdAt: '2025-01-15T10:00:00',
  },
  {
    messageId: 'm2',
    role: 'USER',
    content: '임대차 보증금을 받지 못하고 있습니다.',
    createdAt: '2025-01-15T10:01:00',
  },
  {
    messageId: 'm3',
    role: 'CHATBOT',
    content: '네, 계약 종료 후 얼마나 지나셨나요?',
    createdAt: '2025-01-15T10:02:00',
  },
];

export const mockBriefSummary = {
  briefId: '770e8400-e29b-41d4-a716-446655440002',
  title: '임대차 분쟁 의뢰서',
  status: 'DRAFT',
  createdAt: '2025-01-15T11:00:00',
};

export const mockBrief = {
  briefId: '770e8400-e29b-41d4-a716-446655440002',
  title: '임대차 분쟁 의뢰서',
  legalField: 'CIVIL',
  content: '서울시 강남구 소재 아파트 임대차 계약 관련 분쟁입니다. 계약 기간이 만료되었음에도 보증금이 반환되지 않아 법적 절차를 검토하고자 합니다.',
  keyIssues: [
    {
      title: '보증금 반환 지연',
      description: '계약 종료 후 3개월째 보증금을 반환받지 못하고 있습니다.',
    },
    {
      title: '내용증명 미회신',
      description: '발송한 내용증명에 대한 회신이 없는 상태입니다.',
    },
  ],
  keywords: ['임대차', '보증금', '계약해지', '내용증명'],
  strategy: '내용증명 발송 후 민사소송 제기 검토',
  privacySetting: 'PUBLIC',
  status: 'DRAFT',
  createdAt: '2025-01-15T11:00:00',
};

export const mockLawyer = {
  lawyerId: '990e8400-e29b-41d4-a716-446655440004',
  name: '김변호사',
  profileImageUrl: null,
  domains: ['CIVIL'],
  subDomains: ['CIVIL_LEASE'],
  experienceYears: 10,
  tags: ['임대차', '보증금', '부동산'],
  matchedKeywords: ['임대차', '보증금'],
  bio: '민사 전문 변호사로, 임대차 분쟁을 다수 처리한 경험이 있습니다.',
  region: '서울',
  score: 0.95,
};

export const mockLawyerList = [
  mockLawyer,
  {
    ...mockLawyer,
    lawyerId: '990e8400-e29b-41d4-a716-446655440005',
    name: '이변호사',
    experienceYears: 7,
    bio: '부동산·임대차 분야 전문.',
    score: 0.88,
  },
  {
    ...mockLawyer,
    lawyerId: '990e8400-e29b-41d4-a716-446655440006',
    name: '박변호사',
    experienceYears: 15,
    bio: '대형 로펌 출신, 민사 일반 담당.',
    score: 0.82,
  },
];

export const mockDelivery = {
  deliveryId: 'aa0e8400-e29b-41d4-a716-446655440005',
  lawyerId: '990e8400-e29b-41d4-a716-446655440004',
  lawyerName: '김변호사',
  status: 'DELIVERED',
  sentAt: '2025-01-16T09:00:00',
  viewedAt: null,
  respondedAt: null,
};

export const mockInboxItem = {
  deliveryId: 'aa0e8400-e29b-41d4-a716-446655440005',
  briefId: '770e8400-e29b-41d4-a716-446655440002',
  briefTitle: '임대차 분쟁 의뢰서',
  legalField: 'CIVIL',
  status: 'DELIVERED',
  sentAt: '2025-01-16T09:00:00',
};

export const mockInboxList = [
  mockInboxItem,
  { ...mockInboxItem, deliveryId: 'd2', briefTitle: '근로계약 해고 무효 확인 의뢰서', legalField: 'LABOR' },
  { ...mockInboxItem, deliveryId: 'd3', briefTitle: '교통사고 합의금 산정 의뢰서', legalField: 'CIVIL' },
];

export const mockInboxDetail = {
  deliveryId: 'aa0e8400-e29b-41d4-a716-446655440005',
  briefId: '770e8400-e29b-41d4-a716-446655440002',
  title: '임대차 분쟁 의뢰서',
  legalField: 'CIVIL',
  content: '서울시 강남구 소재 아파트 임대차 계약 관련 분쟁입니다.',
  keywords: ['임대차', '보증금'],
  keyIssues: ['보증금 반환 지연', '내용증명 미회신'],
  status: 'DELIVERED',
  clientName: '홍길동',
  clientEmail: 'client@example.com',
  sentAt: '2025-01-16T09:00:00',
};

export const mockLawyerProfile = {
  lawyerId: '990e8400-e29b-41d4-a716-446655440004',
  name: '김변호사',
  profileImageUrl: null,
  domains: ['CIVIL'],
  subDomains: ['CIVIL_LEASE'],
  experienceYears: 10,
  tags: ['임대차', '보증금'],
  certifications: ['변호사'],
  caseCount: 24,
  bio: '민사 사건을 주로 담당합니다.',
  region: '서울',
  verificationStatus: 'VERIFIED',
};

export const mockAdminPendingLawyer = {
  lawyerId: '990e8400-e29b-41d4-a716-446655440007',
  name: '신청 변호사',
  email: 'pending@example.com',
  barAssociationNumber: '12345',
  domains: ['CIVIL'],
  verificationStatus: 'PENDING',
  requestedAt: '2025-01-20T09:00:00',
};

export const mockAdminPendingList = [
  mockAdminPendingLawyer,
  { ...mockAdminPendingLawyer, lawyerId: 'p2', name: '심사중 변호사', email: 'reviewing@example.com', verificationStatus: 'REVIEWING', barAssociationNumber: '23456' },
];
