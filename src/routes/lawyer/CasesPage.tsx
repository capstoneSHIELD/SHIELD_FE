import { Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { useInboxList } from '@/hooks/useInbox';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDate } from '@/lib/dateUtils';
import {
  LawyerCard,
  LawyerDomainPill,
  LawyerEmptyState,
  LawyerErrorState,
  LawyerHeader,
  LawyerPage,
  LawyerStatusPill,
} from '@/components/lawyer/LawyerChrome';
import type { InboxItemResponse } from '@/types';

export function CasesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useInboxList(0, 50, 'CONFIRMED');
  const items = data?.content ?? [];

  return (
    <LawyerPage>
      <LawyerHeader title="진행 중 사건" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-24 lg:py-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" text="진행 중 사건을 불러오는 중..." />
          </div>
        ) : isError ? (
          <LawyerErrorState description={getApiErrorMessage(error, '진행 중 사건을 불러오지 못했습니다.')} />
        ) : items.length === 0 ? (
          <LawyerEmptyState
            title="진행 중인 사건이 없습니다"
            description="수락한 의뢰가 생기면 이곳에서 확인할 수 있습니다."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CaseCard
                key={item.deliveryId}
                item={item}
                onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </LawyerPage>
  );
}

function CaseCard({ item, onClick }: { item: InboxItemResponse; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <LawyerCard className="p-3.5 transition-transform active:scale-[0.99]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-[7px]">
              <LawyerDomainPill legalField={item.legalField} />
              <LawyerStatusPill status={item.status} />
            </div>
            <p className="text-[13px] font-semibold leading-[19px] text-[#111827]">
              {item.briefTitle}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Calendar size={12} strokeWidth={1.8} aria-hidden="true" />
              <span>수신일 {formatDate(item.sentAt)}</span>
            </div>
          </div>
          <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-gray-400" aria-hidden="true" />
        </div>
      </LawyerCard>
    </button>
  );
}
