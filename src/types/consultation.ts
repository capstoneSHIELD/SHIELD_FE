import type { ConsultationStatus, MessageRole } from './enums';

/** 명세: POST /api/consultations 요청 본문
 *  3단계 분류 체계 — domains(L1) / subDomains(L2) / tags(L3) 배열로 전달. */
export interface CreateConsultationRequest {
  domains: string[];
  subDomains: string[];
  tags: string[];
}

export interface CreateConsultationResponse {
  consultationId: string;
  status: string;
  welcomeMessage: string;
  createdAt: string;
}

/** 명세: GET /api/consultations 목록 및 상세
 *  3단계 분류 체계 — L1(domains) / L2(subDomains) / L3(tags) 를
 *  사용자 입력(user*) 과 AI 분류(ai*) 로 분리해 내려준다. */
export interface ConsultationResponse {
  consultationId: string;
  status: ConsultationStatus;
  /** 사용자가 상담 생성 시 선택한 3단계 분류 */
  userDomains: string[] | null;
  userSubDomains: string[] | null;
  userTags: string[] | null;
  /** AI 분류 결과 (대화 진행 중/완료 후 채워짐) */
  aiDomains: string[] | null;
  aiSubDomains: string[] | null;
  aiTags: string[] | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  brief: BriefSummary | null;
}

/** 명세: 상담에 연결된 의뢰서 요약 (nullable) */
export interface BriefSummary {
  briefId: string;
  title: string;
  status: string;
}

export interface MessageRequest {
  content: string;
}

/** 명세: GET /api/consultations/{id}/messages 개별 메시지 */
export interface MessageResponse {
  messageId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

/**
 * 상담 진행률 (BE PR #89). USER 메시지 누적 턴 수와 percent 를 BE 가 계산해 내려보냄.
 * - maxTurns 는 향후 변경될 수 있어 클라이언트에 하드코딩 X
 * - PII 거부 등으로 USER 메시지가 미저장이면 currentTurn 증가 없음
 */
export interface ConsultationProgress {
  currentTurn: number;
  maxTurns: number;
  progressPercent: number;
}

/** 명세: POST /api/consultations/{id}/messages 전송 응답 (202) */
export interface SendMessageResponse {
  messageId: string;
  role: string;
  content: string;
  createdAt: string;
  allCompleted: boolean;
  classification?: {
    primaryField: string[];
    tags: string[];
  };
  /** BE PR #89 추가. 일부 레거시 분기에서 null 일 수 있어 nullable */
  progress?: ConsultationProgress | null;
}
