import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import { useDeliveries } from '@/hooks/useBrief';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { DELIVERY_STATUS_BADGE, DELIVERY_STATUS_LABEL } from '@/lib/constants';
import type { DeliveryStatus } from '@/types/enums';

// ─── page ────────────────────────────────────────────────────────────────────

export function BriefDeliveryPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: deliveries, isLoading } = useDeliveries(id);

  const list = deliveries ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="변호사 찾기" onBack={() => navigate(`/briefs/${id}`)} />

      <main className="flex flex-1 flex-col gap-4 px-4 py-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && list.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 pt-20 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-info-bg flex items-center justify-center">
              <Search size={32} className="text-brand/40" aria-hidden="true" />
            </div>
            <p className="text-sm text-gray-500">아직 전달 내역이 없습니다</p>
          </div>
        )}

        {/* Delivery list */}
        {!isLoading && list.length > 0 && (
          <ul className="flex flex-col gap-3">
            {list.map((d) => {
              const status = d.status as DeliveryStatus;
              const goToProfile = () => navigate(`/lawyers/${d.lawyerId}`);
              return (
                <li key={d.deliveryId}>
                  <Card
                    padding="md"
                    role="button"
                    tabIndex={0}
                    onClick={goToProfile}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToProfile();
                      }
                    }}
                    aria-label={`${d.lawyerName} 프로필 보기`}
                    className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{d.lawyerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(d.sentAt)}</p>
                      </div>
                      <Badge
                        variant={DELIVERY_STATUS_BADGE[status] ?? 'default'}
                        size="sm"
                      >
                        {DELIVERY_STATUS_LABEL[status] ?? status}
                      </Badge>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {/* Bottom action */}
        <div className="mt-auto pt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/lawyers')}
          >
            변호사 더 찾기
          </Button>
        </div>
      </main>
    </div>
  );
}
