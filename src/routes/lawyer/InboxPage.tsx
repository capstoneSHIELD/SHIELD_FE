import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInboxList } from '@/hooks/useInbox';
import { Spinner } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import { DELIVERY_STATUS_LABEL } from '@/lib/constants';
import { deliveryTimeRemaining } from '@/lib/dateUtils';
import { getDomainMeta } from '@/lib/domainIcons';
import type { InboxItemResponse } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

type FilterTab = 'ALL' | 'DELIVERED' | 'CONFIRMED' | 'REJECTED';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'DELIVERED', label: '신규 의뢰' },
  { key: 'CONFIRMED', label: '검토 중' },
  { key: 'REJECTED', label: '응답 완료' },
];

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}.${day} ${h}:${min}`;
}

function getStatusBadgeStyle(status: string) {
  if (status === 'DELIVERED') return { bg: 'bg-[#e8f0fc]', text: 'text-[#0c447c]' };
  if (status === 'CONFIRMED') return { bg: 'bg-[#eaf3de]', text: 'text-[#3b6d11]' };
  if (status === 'REJECTED') return { bg: 'bg-[#fcebeb]', text: 'text-[#a32d2d]' };
  return { bg: 'bg-[#f1efe8]', text: 'text-[#5f5e5a]' };
}

// ─── inbox item (figma flat style) ──────────────────────────────────────────

function InboxItem({ item }: { item: InboxItemResponse }) {
  const navigate = useNavigate();
  const statusStyle = getStatusBadgeStyle(item.status);
  // Issue #106: BE 의 isExpired (24시간 경과) 받아 만료 처리. 만료된 건은 수락 불가.
  const isExpired = item.isExpired === true;
  const isPending = item.status === 'DELIVERED' && !isExpired;
  const domainMeta = getDomainMeta(item.legalField);
  const remaining = isPending ? deliveryTimeRemaining(item.sentAt) : '';

  return (
    <div className="py-3">
      {/* Category & status badges */}
      <div className="flex flex-wrap gap-[7px] items-center">
        <span className="bg-[#e8f0fc] text-[#0c447c] text-[11px] font-medium px-[10px] py-[3px] rounded-full inline-flex items-center gap-1">
          <domainMeta.Icon size={11} strokeWidth={2} aria-hidden="true" />
          {domainMeta.label}
        </span>
        <span className={cn('text-[11px] font-medium px-[10px] py-[3px] rounded-full', statusStyle.bg, statusStyle.text)}>
          {DELIVERY_STATUS_LABEL[item.status] ?? item.status}
        </span>
        {isExpired && (
          <span className="bg-[#f1efe8] text-[#5f5e5a] text-[11px] font-medium px-[10px] py-[3px] rounded-full">
            만료
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#6b7280] leading-[19.2px] mt-2 line-clamp-2">
        {item.briefTitle}
      </p>

      {/* Divider + footer */}
      <div className="border-t border-[#e9ecef] mt-3 pt-[10px] flex items-center justify-between">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[11px] text-[#adb5bd]">
            전달 {formatShortDate(item.sentAt)}
          </span>
          {isPending && remaining && (
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-[#a32d2d]" />
              <span className="text-[11px] font-medium text-[#a32d2d]">{remaining}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
            className="bg-[#f7f8fa] border border-[#e9ecef] rounded-full px-[10px] py-[6px] text-[11px] font-medium text-[#6b7280]"
          >
            상세 보기
          </button>
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
                className="bg-[#1a6de0] text-white text-[11px] font-medium px-[11px] py-[5px] rounded-full"
              >
                수락
              </button>
              <button
                type="button"
                onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
                className="bg-white border border-[#fcebeb] text-[#a32d2d] text-[11px] font-medium px-[10px] py-[6px] rounded-full"
              >
                거절
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

function isValidFilterTab(value: string | null): value is FilterTab {
  return value === 'ALL' || value === 'DELIVERED' || value === 'CONFIRMED' || value === 'REJECTED';
}

export function InboxPage() {
  const navigate = useNavigate();
  // Issue #42: 대시보드 카운트 카드 클릭 시 ?status=DELIVERED 같은 query param 으로 초기 탭 설정
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  const [activeTab, setActiveTab] = useState<FilterTab>(
    isValidFilterTab(initialStatus) ? initialStatus : 'ALL',
  );

  const statusFilter = activeTab === 'ALL' ? undefined : activeTab;
  const { data: inboxPage, isLoading } = useInboxList(0, 50, statusFilter);
  const items = inboxPage?.content ?? [];

  return (
    <div className="flex flex-col flex-1">
      <Header title="의뢰함" showBack onBack={() => navigate('/lawyer')} />

      {/* Tabs — figma style */}
      <div className="bg-white border-b border-[#e9ecef]">
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-[11px] px-1 text-[12px] text-center relative',
                  isActive
                    ? 'font-medium text-[#1a6de0]'
                    : 'font-normal text-[#adb5bd]',
                )}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-[#1a6de0] rounded-[1px]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-[23px] py-4 pb-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-[#adb5bd]">수신된 의뢰서가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e9ecef]">
            {items.map((item) => (
              <InboxItem key={item.deliveryId} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
