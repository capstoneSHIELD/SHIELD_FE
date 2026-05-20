import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { consultationApi } from '@/lib/consultationApi';
import { normalizeClassificationResolution } from '@/lib/classification';
import { useConsultationDetail } from '@/hooks/useConsultation';
import { useChatStore } from '@/stores/chatStore';
import type { MessageResponse, ConsultationProgress } from '@/types/consultation';
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

const KEYS = {
  messages: (id: string) => ['messages', id] as const,
};

export function useChat(consultationId: string) {
  const queryClient = useQueryClient();
  const {
    messages,
    isSending,
    allCompleted,
    classification,
    classificationConflict,
    progress,
    setMessages,
    addMessage,
    setIsSending,
    setAllCompleted,
    setClassification,
    setClassificationConflict,
    clearClassificationConflict,
    setProgress,
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
    const detailConflict = normalizeClassificationResolution(
      consultation?.classification,
    );
    if (detailConflict?.conflict) {
      setClassificationConflict(detailConflict);
    }
  }, [
    consultation?.allCompleted,
    consultation?.classification,
    setAllCompleted,
    setClassificationConflict,
  ]);

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
          role: (res.role ?? 'CHATBOT') as MessageRole,
          content: res.content,
          createdAt: res.createdAt,
        });

        // 4. 분류 업데이트 — BE `ClassificationResolution.effectiveCandidate` 를
        // chatStore 의 `{ primaryField, tags }` 형태로 어댑팅 (Issue #28)
        const resolution = normalizeClassificationResolution(res.classification);
        if (resolution?.conflict) {
          setClassificationConflict(resolution);
        } else if (resolution) {
          clearClassificationConflict();
        }

        const effective = resolution?.effectiveCandidate;
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

        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: KEYS.messages(consultationId),
        });
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
      setClassificationConflict,
      clearClassificationConflict,
      setAllCompleted,
      setProgress,
      queryClient,
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
    classificationConflict,
    progress,
    scrollRef,
    sendMessage,
    setClassificationConflict,
    clearClassificationConflict,
  };
}
