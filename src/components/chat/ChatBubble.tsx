import { useNavigate } from 'react-router-dom';
import { Lightbulb, FileText, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Sender = 'USER' | 'CHATBOT' | 'CHATBOT_TIP' | 'ROUTER_REQUEST' | 'SYSTEM';

interface ChatBubbleProps {
  sender: Sender;
  content: string;
  timestamp: string;
  briefId?: string | null;
  consultationStatus?: string | null;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ChatBubble({ sender, content, timestamp, briefId, consultationStatus }: ChatBubbleProps) {
  const navigate = useNavigate();
  const formattedTime = formatTime(timestamp);

  if (sender === 'SYSTEM') {
    // 의뢰서 생성/확정 관련 시스템 메시지 → 카드 UI
    const isBriefReady = consultationStatus === 'AWAITING_CONFIRM' || consultationStatus === 'CONFIRMED';
    const isFailed = consultationStatus === 'REJECTED';

    if (isBriefReady && briefId) {
      const isConfirmed = consultationStatus === 'CONFIRMED';
      return (
        <div className="flex justify-center px-4 py-2">
          <div className="w-full max-w-[85%] bg-white border border-blue-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {isConfirmed ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <FileText size={18} className="text-brand" />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {isConfirmed ? '의뢰서가 확정되었습니다' : '의뢰서가 생성되었습니다'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {isConfirmed
                ? '변호사에게 의뢰서를 전달할 수 있습니다.'
                : '생성된 의뢰서를 검토하고 확정해 주세요.'}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/briefs/${briefId}`)}
              className={cn(
                'w-full flex items-center justify-center gap-1.5',
                'py-2.5 rounded-xl text-sm font-semibold',
                'transition-colors duration-150',
                isConfirmed
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-blue-50 text-brand hover:bg-blue-100',
              )}
            >
              {isConfirmed ? '의뢰서 보러 가기' : '의뢰서 확인하러 가기'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className="flex justify-center px-4 py-2">
          <div className="w-full max-w-[85%] bg-white border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={18} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-900">의뢰서 생성에 실패했습니다</span>
            </div>
            <p className="text-xs text-gray-500">{content}</p>
          </div>
        </div>
      );
    }

    // 기본 시스템 메시지
    return (
      <div className="flex justify-center px-4 py-1">
        <div className="w-full max-w-full bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-center text-xs leading-snug">
          {content}
        </div>
        <span className="sr-only">{formattedTime}</span>
      </div>
    );
  }

  if (sender === 'USER') {
    return (
      <div className="flex flex-col items-end px-4 py-1">
        <div
          className={cn(
            'max-w-[75%] px-4 py-2.5',
            'bg-brand text-white',
            'rounded-2xl rounded-br-sm',
            'text-sm leading-relaxed break-words',
          )}
        >
          {content}
        </div>
        <span className="mt-1 text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  }

  if (sender === 'CHATBOT_TIP') {
    return (
      <div className="flex flex-col items-start px-4 py-1">
        <div
          className={cn(
            'max-w-[75%] px-4 py-2.5',
            'bg-[var(--color-info-bg)] text-blue-700',
            'rounded-2xl rounded-bl-sm',
            'text-sm leading-relaxed break-words',
            'flex items-start gap-2',
          )}
        >
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <span>{content}</span>
        </div>
        <span className="mt-1 text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  }

  if (sender === 'ROUTER_REQUEST') {
    return (
      <div className="flex flex-col items-start px-4 py-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-medium leading-none">
            분류 요청
          </span>
        </div>
        <div
          className={cn(
            'max-w-[75%] px-4 py-2.5',
            'bg-white text-gray-900 border border-gray-200',
            'rounded-2xl rounded-bl-sm',
            'text-sm leading-relaxed break-words',
          )}
        >
          {content}
        </div>
        <span className="mt-1 text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  }

  // CHATBOT (default)
  return (
    <div className="flex flex-col items-start px-4 py-1">
      <div
        className={cn(
          'max-w-[75%] px-4 py-2.5',
          'bg-white text-gray-900 border border-gray-200',
          'rounded-2xl rounded-bl-sm',
          'text-sm leading-relaxed break-words',
        )}
      >
        {content}
      </div>
      <span className="mt-1 text-xs text-gray-400">{formattedTime}</span>
    </div>
  );
}
