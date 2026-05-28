import { useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { consultationApi } from '@/lib/consultationApi';
import { useConsultationDetail } from '@/hooks/useConsultation';
import { useChatStore } from '@/stores/chatStore';
import type {
  MessageResponse,
  ConsultationProgress,
  ChecklistItem,
  ChecklistLabels,
  ChecklistLevel,
  SendMessageResponse,
} from '@/types/consultation';
import type { MessageRole } from '@/types/enums';

/**
 * 페이지 새로고침 시 진행률 복원용 (옵션 A).
 * messages 의 USER role 개수로 currentTurn 임시 복원.
 * - maxTurns 는 BE 가 sendMessage 응답에서만 내려보내므로 첫 메시지 전에는 기본값 10.
 * - 사용자가 새 메시지를 보내는 순간 BE 의 정확한 값으로 교체됨.
 */
const DEFAULT_MAX_TURNS = 10;

function deriveProgressFromMessages(messages: MessageResponse[]): ConsultationProgress {
  const userTurns = messages.filter((m) => m.role === 'USER').length;
  const clamped = Math.min(DEFAULT_MAX_TURNS, userTurns);
  return {
    currentTurn: clamped,
    maxTurns: DEFAULT_MAX_TURNS,
    progressPercent: Math.round((clamped / DEFAULT_MAX_TURNS) * 100),
  };
}

const CHECKLIST_LEVELS = ['L1', 'L2', 'L3'] as const;

type ChecklistLikeResponse = SendMessageResponse & {
  checkList?: unknown;
  checklistItems?: unknown;
};

function readItems(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && 'items' in value) {
    return (value as { items?: unknown }).items;
  }
  return undefined;
}

function normalizeChecklistLevel(level: unknown): ChecklistLevel | null {
  const value = String(level ?? '').trim().toUpperCase();

  if (value === 'L1' || value === 'LEVEL1' || value === '1') return 'L1';
  if (value === 'L2' || value === 'LEVEL2' || value === '2') return 'L2';
  if (value === 'L3' || value === 'LEVEL3' || value === '3') return 'L3';

  return null;
}

function normalizeChecklistItem(item: unknown): ChecklistItem | null {
  if (!item || typeof item !== 'object') return null;

  const record = item as { level?: unknown; label?: unknown };
  const level = normalizeChecklistLevel(record.level);
  const label = typeof record.label === 'string' ? record.label.trim() : '';

  if (!level || !label) return null;

  return { level, label };
}

function extractChecklistItems(response: SendMessageResponse): ChecklistItem[] {
  const raw = response as ChecklistLikeResponse;
  const candidates = [
    readItems(raw.checklist),
    readItems(raw.checkList),
    readItems(raw.checklistItems),
  ];

  const items = candidates.find(Array.isArray);

  if (!items) return [];

  return items
    .map(normalizeChecklistItem)
    .filter((item): item is ChecklistItem => item != null);
}

function groupChecklistLabels(items: ChecklistItem[]): ChecklistLabels {
  const labels: ChecklistLabels = { L1: [], L2: [], L3: [] };

  items.forEach((item) => {
    if (!item) return;
    const label = typeof item.label === 'string' ? item.label.trim() : '';
    if (label && labels[item.level]) {
      labels[item.level].push(label);
    }
  });

  return labels;
}

function formatChecklistMessage(labels: ChecklistLabels): string | null {
  const flattened = CHECKLIST_LEVELS.flatMap((level) => labels[level]);

  if (flattened.length === 0) return null;

  const lines = flattened.map((label, index) =>
    index === flattened.length - 1 ? label : `${label},`,
  );

  return ['필요한 내용은 다음과 같습니다.', ...lines].join('\n');
}

function normalizeAiRole(role: string | undefined): MessageRole {
  if (role === 'USER') return 'USER';
  if (role === 'CHATBOT_TIP') return 'CHATBOT_TIP';
  if (role === 'ROUTER_REQUEST') return 'ROUTER_REQUEST';
  if (role === 'SYSTEM') return 'SYSTEM';
  return 'CHATBOT';
}

const KEYS = {
  messages: (id: string) => ['messages', id] as const,
};

export function useChat(consultationId: string) {
  const {
    messages,
    isSending,
    allCompleted,
    classification,
    progress,
    checklistLabels,
    setMessages,
    addMessage,
    setIsSending,
    setAllCompleted,
    setClassification,
    setProgress,
    setChecklistLabels,
    reset,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // 메시지 목록 초기 로딩
  const { data: queryData, isLoading } = useQuery({
    queryKey: KEYS.messages(consultationId),
    queryFn: async () => {
      const { data } = await consultationApi.getMessages(consultationId);
      return data?.data?.content ?? [];
    },
    enabled: !!consultationId,
  });

  // 쿼리 결과를 store에 동기화 + 새로고침 시 USER 메시지 카운트로 진행률 임시 복원 (옵션 A).
  // BE 가 단건 조회 응답에 progress 를 포함하면 이 복원 로직은 제거 가능.
  useEffect(() => {
    if (queryData) {
      setMessages(queryData);
      if (queryData.length > 0) {
        setProgress(deriveProgressFromMessages(queryData));
      }
    }
  }, [queryData, setMessages, setProgress]);

  // allCompleted 복원 — BE Issue #100. 페이지 재진입 시 의뢰서 생성 버튼 상태 회복.
  // ConsultationResponse.allCompleted 가 true 면 chatStore 의 allCompleted 를 true 로 set.
  // (BE 가 아직 머지 전이면 필드가 undefined → 기존 동작 유지)
  const { data: consultation } = useConsultationDetail(consultationId);
  useEffect(() => {
    if (consultation?.allCompleted) {
      setAllCompleted(true);
    }
  }, [consultation?.allCompleted, setAllCompleted]);

  // 스크롤 하단 고정
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 메시지 전송 (낙관적 UI)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return;

      // 1. 낙관적 UI — 사용자 메시지 즉시 표시
      const optimisticMsg: MessageResponse = {
        messageId: crypto.randomUUID(),
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      addMessage(optimisticMsg);
      setIsSending(true);

      try {
        // 2. API 호출
        const { data } = await consultationApi.sendMessage(
          consultationId,
          content,
        );
        const res = data.data;

        // 3. AI 응답 추가
        addMessage({
          messageId: res.messageId,
          role: normalizeAiRole(res.role),
          content: res.content,
          createdAt: res.createdAt,
        });

        const nextChecklistLabels = groupChecklistLabels(
          extractChecklistItems(res),
        );
        setChecklistLabels(nextChecklistLabels);

        const checklistContent = formatChecklistMessage(nextChecklistLabels);
        if (checklistContent) {
          addMessage({
            messageId: `${res.messageId}-checklist`,
            role: 'CHATBOT',
            content: checklistContent,
            createdAt: res.createdAt,
          });
        }

        // 4. 분류 업데이트 — BE `ClassificationResolution.effectiveCandidate` 를
        // chatStore 의 `{ primaryField, tags }` 형태로 어댑팅 (Issue #28)
        const effective = res.classification?.effectiveCandidate;
        if (effective) {
          setClassification({
            primaryField: effective.domains ?? [],
            tags: effective.tags ?? [],
          });
        }

        // 5. 완료 여부
        if (res.allCompleted) {
          setAllCompleted(true);
        }

        // 6. 진행률 갱신 (PR #89). PII 거부 시 BE 가 같은 값 또는 null 로 응답.
        if (res.progress) {
          setProgress(res.progress);
        }

      } catch (error) {
        // PII 에러 등 핸들링 — 에러 메시지를 시스템 메시지로 표시
        const errorMsg =
          error instanceof Error ? error.message : '메시지 전송에 실패했습니다';

        addMessage({
          messageId: crypto.randomUUID(),
          role: 'SYSTEM',
          content: errorMsg,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsSending(false);
      }
    },
    [
      consultationId,
      isSending,
      addMessage,
      setIsSending,
      setClassification,
      setAllCompleted,
      setProgress,
      setChecklistLabels,
    ],
  );

  // 언마운트 시 리셋
  useEffect(() => {
    return () => reset();
  }, [reset]);

  return {
    messages,
    isLoading,
    isSending,
    allCompleted,
    classification,
    progress,
    checklistLabels,
    scrollRef,
    sendMessage,
  };
}
