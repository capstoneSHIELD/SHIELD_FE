import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInboxList } from '@/hooks/useInbox';
import { Spinner } from '@/components/ui';
import { deliveryTimeRemaining } from '@/lib/dateUtils';
import {
  LawyerCard,
  LawyerDomainPill,
  LawyerEmptyState,
  LawyerHeader,
  LawyerPage,
  LawyerStatusPill,
} from '@/components/lawyer/LawyerChrome';
import type { InboxItemResponse } from '@/types';

type FilterTab = 'ALL' | 'NEW' | 'REVIEWING' | 'RESPONDED';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'NEW', label: '신규 의뢰' },
  { key: 'REVIEWING', label: '검토 중' },
  { key: 'RESPONDED', label: '응답 완료' },
];

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hour}:${minute}`;
}

function isValidFilterTab(value: string | null): value is FilterTab {
  return value === 'ALL' || value === 'NEW' || value === 'REVIEWING' || value === 'RESPONDED';
}

function InboxCard({ item }: { item: InboxItemResponse }) {
  const navigate = useNavigate();
  const isExpired = item.isExpired === true;
  const isPending = item.status === 'DELIVERED' && !isExpired;
  const remaining = isPending ? deliveryTimeRemaining(item.sentAt) : '';

  return (
    <LawyerCard className="p-3.5">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-[7px]">
          <LawyerDomainPill legalField={item.legalField} />
          <LawyerStatusPill status={item.status} />
          {isExpired && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-[3px] text-[11px] font-medium text-gray-500">
              만료
            </span>
          )}
        </div>

        <p className="text-[13px] font-semibold leading-[19px] text-[#111827]">
          {item.briefTitle}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} strokeWidth={1.8} aria-hidden="true" />
              <span>진단 {formatShortDate(item.sentAt)}</span>
            </div>
            {remaining && (
              <div className="flex items-center gap-1.5 text-red-600">
                <Clock size={12} strokeWidth={1.8} aria-hidden="true" />
                <span>{remaining}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
            className="shrink-0 rounded-full border border-brand bg-white px-3 py-1.5 text-[11px] font-medium text-brand transition-colors hover:bg-info-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            상세 보기
          </button>
        </div>
      </div>
    </LawyerCard>
  );
}

export function InboxPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter');
  const [activeTab, setActiveTab] = useState<FilterTab>(
    isValidFilterTab(initialFilter) ? initialFilter : 'ALL',
  );

  const { data: inboxPage, isLoading } = useInboxList(0, 50, activeTab);
  const items = inboxPage?.content ?? [];

  return (
    <LawyerPage>
      <LawyerHeader title="의뢰함" showBack onBack={() => navigate('/lawyer')} />

      <div className="border-b border-[#e0e2e6] bg-white px-4 py-2">
        <div className="grid grid-cols-4 gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative rounded-card px-2 py-2 text-center text-[12px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                  isActive
                    ? 'bg-white text-brand shadow-[0_8px_20px_rgba(31,140,249,0.10)]'
                    : 'bg-gray-50 text-gray-500',
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-6 -bottom-2 h-0.5 rounded-full bg-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 py-4 pb-24">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <LawyerEmptyState
            title="수신된 의뢰서가 없습니다"
            description="선택한 필터의 의뢰서가 존재하지 않습니다."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <InboxCard key={item.deliveryId} item={item} />
            ))}
          </div>
        )}
      </main>
    </LawyerPage>
  );
}
