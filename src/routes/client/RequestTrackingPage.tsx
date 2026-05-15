import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Clock, MessageSquare, Calendar, User, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/dateUtils';
import { useDeliveries } from '@/hooks/useBrief';
import { useLawyerDetail } from '@/hooks/useLawyer';
import { DELIVERY_STATUS_LABEL, DOMAIN_LABELS, SUPPORT_MAILTO } from '@/lib/constants';
import { Button, Card, Badge, Spinner, Modal } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import type { DeliveryResponse } from '@/types/brief';

// ─── types ───────────────────────────────────────────────────────────────────

type StepStatus = 'completed' | 'active' | 'pending';

interface TrackingStep {
  label: string;
  status: StepStatus;
  timestamp?: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function buildSteps(delivery: DeliveryResponse): TrackingStep[] {
  const steps: TrackingStep[] = [];

  // Step 1: 전달됨
  steps.push({
    label: '의뢰서 전달됨',
    status: 'completed',
    timestamp: formatDate(delivery.sentAt),
  });

  // Step 2: 열람
  if (delivery.viewedAt) {
    steps.push({
      label: '의뢰서 열람',
      status: 'completed',
      timestamp: formatDate(delivery.viewedAt),
    });
  } else {
    steps.push({ label: '의뢰서 열람', status: delivery.status === 'DELIVERED' ? 'active' : 'pending' });
  }

  // Step 3: 검토 진행 중
  const isReviewing = delivery.viewedAt && !delivery.respondedAt;
  steps.push({
    label: '검토 진행 중',
    status: isReviewing ? 'active' : delivery.respondedAt ? 'completed' : 'pending',
  });

  // Step 4: 최종 결과
  if (delivery.respondedAt) {
    steps.push({
      label: delivery.status === 'CONFIRMED' ? '수락됨' : '거절됨',
      status: 'completed',
      timestamp: formatDate(delivery.respondedAt),
    });
  } else {
    steps.push({ label: '최종 결과 (수락/거절)', status: 'pending' });
  }

  return steps;
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function StepIndicator({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return (
      <div className="size-8 rounded-full bg-brand flex items-center justify-center shrink-0">
        <Check size={16} className="text-white" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="size-8 rounded-full border-2 border-brand flex items-center justify-center shrink-0 relative">
        <span className="size-2.5 rounded-full bg-brand animate-pulse" />
      </div>
    );
  }
  return (
    <div className="size-8 rounded-full border-2 border-border flex items-center justify-center shrink-0">
      <span className="size-2.5 rounded-full bg-border" />
    </div>
  );
}

function VerticalStepper({ steps }: { steps: TrackingStep[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={step.label} className="flex gap-3">
            {/* Left: indicator + connector */}
            <div className="flex flex-col items-center">
              <StepIndicator status={step.status} />
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[28px]',
                    step.status === 'completed' ? 'bg-brand' : 'bg-border',
                  )}
                />
              )}
            </div>

            {/* Right: label + timestamp */}
            <div
              className={cn(
                'pb-6 pt-0.5',
                isLast && 'pb-0',
              )}
            >
              <p
                className={cn(
                  'text-sm font-semibold leading-none',
                  step.status === 'completed' && 'text-brand',
                  step.status === 'active' && 'text-gray-900',
                  step.status === 'pending' && 'text-gray-400',
                )}
              >
                {step.label}
              </p>
              {step.timestamp && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-600">
                  {step.timestamp}
                </span>
              )}
              {step.status === 'active' && !step.timestamp && (
                <p className="text-xs text-brand mt-1">진행 중</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Request card ─────────────────────────────────────────────────────────────

const DELIVERY_BADGE: Record<string, { variant: 'warning' | 'primary' | 'success' | 'danger'; label: string }> = {
  DELIVERED: { variant: 'warning', label: DELIVERY_STATUS_LABEL.DELIVERED },
  CONFIRMED: { variant: 'success', label: DELIVERY_STATUS_LABEL.CONFIRMED },
  REJECTED: { variant: 'danger', label: DELIVERY_STATUS_LABEL.REJECTED },
};

function DeliveryCard({ delivery }: { delivery: DeliveryResponse }) {
  const badge = DELIVERY_BADGE[delivery.status] ?? { variant: 'warning' as const, label: delivery.status };

  return (
    <Card padding="md">
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{delivery.lawyerName}</p>
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-gray-500">변호사</span>
            <span className="font-medium text-gray-900 ml-auto">{delivery.lawyerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-gray-500">전달 일시</span>
            <span className="font-medium text-gray-900 ml-auto">{formatDate(delivery.sentAt)}</span>
          </div>
          {delivery.viewedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Check size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <span className="text-gray-500">열람 일시</span>
              <span className="font-medium text-gray-900 ml-auto">{formatDate(delivery.viewedAt)}</span>
            </div>
          )}
          {!delivery.respondedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <span className="text-gray-500">예상 응답</span>
              <span className="font-medium text-gray-900 ml-auto">24시간 이내</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

// LawyerHeaderCard for B-15 — 상단 변호사 프로필 카드
function LawyerHeaderCard({ delivery }: { delivery: DeliveryResponse }) {
  const { data: lawyer } = useLawyerDetail(delivery.lawyerId);

  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-info-bg flex items-center justify-center shrink-0 overflow-hidden">
          {lawyer?.profileImageUrl ? (
            <img
              src={lawyer.profileImageUrl}
              alt={delivery.lawyerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={24} className="text-brand/50" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-base font-bold text-[#161a1d] truncate">{delivery.lawyerName}</p>
            <span className="text-[10px] font-bold text-brand bg-info-bg px-1.5 py-0.5 rounded-md tracking-wider">
              MATCHED
            </span>
          </div>
          {lawyer?.domains && lawyer.domains.length > 0 && (
            <p className="text-xs text-gray-500 mb-0.5">
              {lawyer.domains.map((d: string) => DOMAIN_LABELS[d] ?? d).join(' · ')}
            </p>
          )}
          {lawyer?.experienceYears !== undefined && (
            <p className="text-xs text-gray-500">경력 {lawyer.experienceYears}년</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function RequestTrackingPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deliveries, isLoading } = useDeliveries(id);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelInfoOpen, setCancelInfoOpen] = useState(false);

  // 첫 번째 delivery 기준으로 스텝 생성 (다수 delivery 시 각각 카드 표시)
  const firstDelivery = deliveries?.[0];
  const steps = firstDelivery ? buildSteps(firstDelivery) : [];

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="의뢰 현황" onBack={() => navigate(`/briefs/${id}`)} />

      <main className="flex-1 space-y-5 px-4 py-6 pb-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : !deliveries || deliveries.length === 0 ? (
          <Card padding="md" className="text-center py-8">
            <p className="text-sm text-gray-400">전달된 의뢰서가 없습니다.</p>
          </Card>
        ) : (
          <>
            {/* B-15: 상단 변호사 헤더 카드 */}
            {firstDelivery && <LawyerHeaderCard delivery={firstDelivery} />}

            {/* Progress stepper section */}
            <Card padding="md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                진행 단계
              </p>
              <VerticalStepper steps={steps} />
            </Card>

            {/* Delivery cards */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">전달 현황</h2>
              <div className="space-y-3">
                {deliveries.map((d) => (
                  <DeliveryCard key={d.deliveryId} delivery={d} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Info box */}
        <div className="rounded-[14px] bg-[#f0f7ff] border border-brand/10 px-4 py-4 flex gap-3">
          <Clock size={20} className="text-brand shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-[#02264b] mb-1">의뢰 응답 안내</p>
            <p className="text-xs text-[#02264b]/80 leading-relaxed">
              변호사가 의뢰를 수신한 후 <strong className="text-brand">24시간 이내</strong>에 응답하지 않을 경우, 의뢰는 자동으로 거절 처리됩니다.
            </p>
          </div>
        </div>

        {/* B-16: 하단 의뢰 취소 버튼 + 고객센터 링크 */}
        <div className="pt-2 space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setCancelOpen(true)}
            disabled={!firstDelivery}
          >
            의뢰 취소하기
          </Button>
          <button
            type="button"
            onClick={() => navigate('/lawyers')}
            className="w-full text-xs text-[#62686f] hover:text-brand transition-colors"
          >
            다른 변호사 찾기
          </button>
          <div className="text-center text-xs text-[#62686f]">
            <span>문제가 발생했나요? </span>
            <a
              href={SUPPORT_MAILTO}
              className="inline-flex items-center gap-0.5 text-brand font-medium hover:brightness-90"
            >
              <HelpCircle size={12} aria-hidden="true" />
              고객센터 문의
            </a>
          </div>
        </div>
      </main>

      {/* 의뢰 취소 확인 모달 */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="의뢰 취소"
      >
        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
          의뢰를 취소하면 변호사에게 전달된 의뢰서가 회수되며,
          이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setCancelOpen(false);
              setCancelInfoOpen(true);
            }}
          >
            의뢰 취소
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setCancelOpen(false)}
          >
            닫기
          </Button>
        </div>
      </Modal>

      {/* TODO: 의뢰 취소 API 연동 (현재 백엔드 명세에 없음) */}
      <Modal
        isOpen={cancelInfoOpen}
        onClose={() => setCancelInfoOpen(false)}
        title="서비스 준비 중"
      >
        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
          의뢰 취소 기능은 준비 중입니다. 급한 경우
          고객센터로 연락해 주세요.
        </p>
        <Button
          variant="primary"
          fullWidth
          onClick={() => setCancelInfoOpen(false)}
        >
          확인
        </Button>
      </Modal>
    </div>
  );
}
