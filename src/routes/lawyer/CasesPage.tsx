import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui';
import { useInboxList } from '@/hooks/useInbox';
import { getDomainMeta } from '@/lib/domainIcons';
import { formatDate } from '@/lib/dateUtils';
import { cn } from '@/lib/cn';
import type { InboxItemResponse } from '@/types';

/**
 * 변호사 진행 중 사건 페이지.
 * BE enum 의 CONFIRMED 상태 (수락된 의뢰서) 만 필터링하여 표시.
 *
 * 옛 구현은 placeholder 였고, 데이터 호출 자체가 없어 항상 빈 결과.
 * useInboxList 의 status 파라미터를 'CONFIRMED' 로 지정하여 진짜 데이터 노출.
 */
export function CasesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useInboxList(0, 50, 'CONFIRMED');
  const items = data?.content ?? [];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="진행 중 사건" />

      <main className="flex-1 px-4 py-4 pb-10">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">진행 중인 사건이 없습니다</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#e9ecef]" role="list">
            {items.map((item) => (
              <CaseItem
                key={item.deliveryId}
                item={item}
                onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

interface CaseItemProps {
  item: InboxItemResponse;
  onClick: () => void;
}

function CaseItem({ item, onClick }: CaseItemProps) {
  const meta = getDomainMeta(item.legalField);

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full py-3 text-left"
      >
        <div className="flex flex-wrap gap-[7px] items-center">
          <span className={cn(
            'text-[11px] font-medium px-[10px] py-[3px] rounded-full inline-flex items-center gap-1',
            meta.bgColor,
            meta.color
          )}>
            <meta.Icon size={11} strokeWidth={2} aria-hidden="true" />
            {meta.label}
          </span>
          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-[10px] py-[3px] rounded-full">
            수락
          </span>
        </div>
        <p className="text-[12px] text-[#6b7280] leading-[19.2px] mt-2 line-clamp-2">
          {item.briefTitle}
        </p>
        <p className="text-[11px] text-[#adb5bd] mt-2">
          수락일 {formatDate(item.sentAt)}
        </p>
      </button>
    </li>
  );
}
