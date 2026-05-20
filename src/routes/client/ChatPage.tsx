import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  buildConflictFromConsultation,
  getConflictResolutionFromUnknown,
} from '@/lib/classification';
import { consultationApi } from '@/lib/consultationApi';
import { useChat } from '@/hooks/useChat';
import { useConsultationDetail, useRequestAnalyze } from '@/hooks/useConsultation';
import { Button, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { ClassificationConflictModal } from '@/components/chat/ClassificationConflictModal';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConsultationProgressBar } from '@/components/consultation/ConsultationProgressBar';
import type {
  ClassificationCandidate,
  ConsultationResponse,
} from '@/types/consultation';

// ─── page ────────────────────────────────────────────────────────────────────

export function ChatPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSavingClassification, setIsSavingClassification] = useState(false);
  const [analyzeAfterResolve, setAnalyzeAfterResolve] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Consultation detail for status/domain info
  const { data: consultation } = useConsultationDetail(id);

  // Chat state
  const {
    messages,
    isLoading,
    isSending,
    allCompleted,
    classificationConflict,
    progress,
    scrollRef,
    sendMessage,
    setClassificationConflict,
    clearClassificationConflict,
  } = useChat(id);

  // Analyze mutation
  const { mutateAsync: requestAnalyze, isPending: isAnalyzing } =
    useRequestAnalyze(id);

  useEffect(() => {
    if (!classificationConflict?.conflict) return;
    setConflictError(null);
    setIsConflictModalOpen(true);
  }, [classificationConflict]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // ── status-based redirects ──────────────────────────────────────────────
  useEffect(() => {
    if (!consultation) return;
    if (consultation.status === 'ANALYZING') {
      navigate(`/consultations/${id}/analyzing`, { replace: true });
      return;
    }
    if (
      consultation.status === 'AWAITING_CONFIRM' ||
      consultation.status === 'CONFIRMED' ||
      consultation.status === 'REJECTED'
    ) {
      navigate('/briefs', { replace: true });
    }
  }, [consultation, id, navigate]);

  // ── handle "의뢰서 생성" click ──────────────────────────────────────────
  async function handleRequestAnalyze() {
    await runAnalyze();
  }

  async function runAnalyze(skipLocalConflictCheck = false) {
    if (!skipLocalConflictCheck && classificationConflict?.conflict) {
      setAnalyzeAfterResolve(true);
      setConflictError(null);
      setIsConflictModalOpen(true);
      return;
    }

    try {
      await requestAnalyze();
      navigate(`/consultations/${id}/analyzing`);
    } catch (error) {
      if (isClassificationConflictError(error)) {
        setAnalyzeAfterResolve(true);
        const fromError = getAnalyzeConflict(error);
        if (fromError) {
          setClassificationConflict(fromError);
          setConflictError(null);
          setIsConflictModalOpen(true);
          return;
        }

        const restored = await restoreConflictFromDetail();
        if (!restored) {
          setToastMessage(
            '분류 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          );
        }
        return;
      }

      setToastMessage('의뢰서 생성을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function restoreConflictFromDetail() {
    try {
      const { data } = await consultationApi.getById(id);
      const conflict = buildConflictFromConsultation(data.data);
      if (!conflict) return false;

      setClassificationConflict(conflict);
      setConflictError(null);
      setIsConflictModalOpen(true);
      return true;
    } catch {
      return false;
    }
  }

  async function handleConfirmClassification(candidate: ClassificationCandidate) {
    setIsSavingClassification(true);
    setConflictError(null);

    try {
      await consultationApi.updateClassify(id, candidate);
      clearClassificationConflict();
      markConflictResolved(candidate);
      setIsConflictModalOpen(false);
      setToastMessage('법률 분야가 업데이트되었습니다.');

      const shouldAnalyze = analyzeAfterResolve;
      setAnalyzeAfterResolve(false);
      if (shouldAnalyze) {
        await runAnalyze(true);
      }
    } catch {
      setConflictError(
        '분류를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsSavingClassification(false);
    }
  }

  function handleCancelClassification() {
    if (isSavingClassification) return;
    setIsConflictModalOpen(false);
    setAnalyzeAfterResolve(false);
    setConflictError(null);
  }

  function markConflictResolved(candidate: ClassificationCandidate) {
    queryClient.setQueryData<ConsultationResponse>(
      ['consultations', 'detail', id],
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userDomains: candidate.domains,
          userSubDomains: candidate.subDomains,
          userTags: candidate.tags,
          classification: prev.classification
            ? {
                ...prev.classification,
                conflict: false,
                effectiveCandidate: candidate,
              }
            : {
                conflict: false,
                userCandidate: candidate,
                aiCandidate: null,
                effectiveCandidate: candidate,
              },
        };
      },
    );
    queryClient.invalidateQueries({ queryKey: ['consultations', 'list'] });
  }

  // ── loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
        <PageHeader logoVariant="wordmark" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
      {/* ── header ─────────────────────────────────────────────────────── */}
      <PageHeader logoVariant="wordmark" />

      {/* ── progress bar (sticky, BE PR #89) ─────────────────────────── */}
      <ConsultationProgressBar progress={progress} completed={allCompleted} />

      {/* ── AI notice bar — figma 05 (h-[34px], 사각 dot rounded-[3px]) ─ */}
      <div className="flex h-[34px] items-center gap-2 border-b border-border bg-gray-100/50 px-4">
        <span className="size-1.5 rounded-[3px] bg-brand/50" />
        <p className="text-[11px] font-medium leading-[17px] text-text-soft">
          AI는 법률 상담이 아닌 정보 정리를 도와드립니다
        </p>
      </div>

      {/* ── scrollable message area ─────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className={cn('chat-viewport flex-1 py-3', 'scrollbar-hide')}
      >
        {/* Messages */}
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            sender={msg.role}
            content={msg.content}
            timestamp={msg.createdAt}
          />
        ))}

        {/* Typing indicator */}
        {isSending && <TypingIndicator />}

      </div>

      {/* ── bottom area ─────────────────────────────────────────────────── */}
      <div className="safe-area-bottom bg-white">
        {/* "의뢰서 생성" CTA — shown when allCompleted */}
        {allCompleted && (
          <div className="px-4 pt-3 pb-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isAnalyzing}
              leftIcon={<FileText size={18} />}
              onClick={handleRequestAnalyze}
              className="bg-brand shadow-md"
            >
              의뢰서 생성
            </Button>
          </div>
        )}

        {/* Chat input */}
        <ChatInput
          onSend={sendMessage}
          disabled={isSending || allCompleted}
          placeholder={allCompleted ? '상담이 완료되었습니다' : '메시지를 입력하세요...'}
          subtext={
            allCompleted
              ? undefined
              : '상담 내용을 입력하면 AI가 법률 분야를 자동으로 분류합니다.'
          }
        />
      </div>

      <ClassificationConflictModal
        isOpen={isConflictModalOpen}
        conflict={classificationConflict}
        isSubmitting={isSavingClassification}
        error={conflictError}
        onCancel={handleCancelClassification}
        onConfirm={handleConfirmClassification}
      />

      {toastMessage && (
        <div className="fixed left-1/2 bottom-24 z-[60] w-[calc(100%-32px)] max-w-[358px] -translate-x-1/2 rounded-lg bg-[#1E293B] px-4 py-3 text-center text-sm font-medium leading-5 text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function isClassificationConflictError(error: unknown) {
  if (!isAxiosError(error)) return false;
  const message = getServerMessage(error.response?.data);
  return (
    error.response?.status === 409 &&
    (!message || message.includes('분류 확인'))
  );
}

function getAnalyzeConflict(error: unknown) {
  if (!isAxiosError(error)) return null;
  return getConflictResolutionFromUnknown(error.response?.data);
}

function getServerMessage(data: unknown) {
  if (!data || typeof data !== 'object') return null;
  const message = (data as { message?: unknown }).message;
  return typeof message === 'string' ? message : null;
}
