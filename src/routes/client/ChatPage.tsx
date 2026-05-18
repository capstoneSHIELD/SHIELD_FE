import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useChat } from '@/hooks/useChat';
import { useConsultationDetail, useRequestAnalyze } from '@/hooks/useConsultation';
import { Button, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConsultationProgressBar } from '@/components/consultation/ConsultationProgressBar';

// ─── page ────────────────────────────────────────────────────────────────────

export function ChatPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Consultation detail for status/domain info
  const { data: consultation } = useConsultationDetail(id);

  // Chat state
  const {
    messages,
    isLoading,
    isSending,
    allCompleted,
    progress,
    scrollRef,
    sendMessage,
  } = useChat(id);

  // Analyze mutation
  const { mutate: requestAnalyze, isPending: isAnalyzing } = useRequestAnalyze(id);

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
  function handleRequestAnalyze() {
    requestAnalyze(undefined, {
      onSuccess: () => {
        navigate(`/consultations/${id}/analyzing`);
      },
    });
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
    </div>
  );
}
