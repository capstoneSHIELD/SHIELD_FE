import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  Clock,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInboxList, useInboxStats } from '@/hooks/useInbox';
import { useMyLawyerProfile } from '@/hooks/useLawyer';
import { Spinner } from '@/components/ui';
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
import type { LucideIcon } from 'lucide-react';

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hour}:${minute}`;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'brand' | 'blue' | 'orange' | 'green' | 'red';
  onClick: () => void;
}

function StatCard({ label, value, icon: Icon, tone, onClick }: StatCardProps) {
  const toneClass = {
    brand: 'text-brand bg-info-bg border-brand/15',
    blue: 'text-brand bg-info-bg border-gray-100',
    orange: 'text-orange-500 bg-orange-50 border-gray-100',
    green: 'text-green-700 bg-green-50 border-gray-100',
    red: 'text-red-600 bg-red-50 border-gray-100',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[104px] rounded-card border bg-white p-3.5 text-left shadow-sm',
        'lg:min-h-[124px]',
        'transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        tone === 'brand' ? 'border-brand/20 bg-info-bg/40' : 'border-gray-100',
      )}
    >
      <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-full border', toneClass)}>
        <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
      </div>
      <p className={cn(
        'text-[28px] font-bold leading-none',
        tone === 'orange'
          ? 'text-orange-500'
          : tone === 'green'
          ? 'text-green-700'
          : tone === 'red'
          ? 'text-red-600'
          : 'text-brand',
      )}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-[#111827]">{label}</p>
    </button>
  );
}

function RecentRequestCard({ item }: { item: InboxItemResponse }) {
  const navigate = useNavigate();

  return (
    <LawyerCard className="h-full p-3.5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-[7px]">
          <LawyerDomainPill legalField={item.legalField} />
          <LawyerStatusPill status={item.status} />
        </div>
        <p className="line-clamp-2 break-words text-[13px] font-semibold leading-[19px] text-[#111827]">
          {item.briefTitle}
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
          <div className="min-w-0 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar size={12} strokeWidth={1.8} aria-hidden="true" />
            <span className="truncate">수신일 {formatShortDate(item.sentAt)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/lawyer/inbox/${item.deliveryId}`)}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-[#111827] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            상세 보기
          </button>
        </div>
      </div>
    </LawyerCard>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useInboxStats();
  const { data: inboxPage, isLoading: inboxLoading, isError: inboxError } = useInboxList(0, 5);
  const { data: profile } = useMyLawyerProfile();

  const isLoading = statsLoading || inboxLoading;
  const isError = statsError || inboxError;
  const recentItems = inboxPage?.content ?? [];
  const lawyerName = profile?.name ?? '변호사';

  return (
    <LawyerPage>
      <LawyerHeader title="변호사 대시보드" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-6 lg:px-6 lg:py-6 lg:pb-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" text="대시보드를 불러오는 중..." />
          </div>
        ) : isError ? (
          <LawyerErrorState description="수신함 통계와 최근 의뢰를 불러오지 못했습니다." />
        ) : (
          <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-5 lg:space-y-0">
            <div className="min-w-0 space-y-4">
            <LawyerCard className="flex items-center gap-3 p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-bg text-brand">
                <Sparkles size={20} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="min-w-0 break-words text-[13px] font-medium text-[#111827]">
                {lawyerName}님, 오늘도 좋은 하루입니다.
              </p>
            </LawyerCard>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="전체 의뢰"
                value={stats?.all ?? 0}
                icon={UserRound}
                tone="brand"
                onClick={() => navigate('/lawyer/inbox')}
              />
              <StatCard
                label="대기 중"
                value={(stats?.newCount ?? 0) + (stats?.reviewing ?? 0)}
                icon={Clock}
                tone="blue"
                onClick={() => navigate('/lawyer/inbox?status=DELIVERED')}
              />
              <StatCard
                label="진행 중 사건"
                value={stats?.confirmed ?? 0}
                icon={BriefcaseBusiness}
                tone="orange"
                onClick={() => navigate('/lawyer/cases')}
              />
              <StatCard
                label="거절한 의뢰"
                value={stats?.rejected ?? 0}
                icon={XCircle}
                tone="red"
                onClick={() => navigate('/lawyer/inbox?status=REJECTED')}
              />
            </div>

            </div>

            <section className="min-w-0 space-y-3 lg:sticky lg:top-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#111827]">최근 의뢰</h2>
                <Link
                  to="/lawyer/inbox"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:brightness-90"
                >
                  전체 보기
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {recentItems.length === 0 ? (
                <LawyerEmptyState
                  title="수신된 의뢰서가 없습니다"
                  description="새 의뢰가 도착하면 이곳에서 확인할 수 있습니다."
                />
              ) : (
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <RecentRequestCard key={item.deliveryId} item={item} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </LawyerPage>
  );
}
