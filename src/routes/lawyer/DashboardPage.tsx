import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInboxList, useInboxStats } from '@/hooks/useInbox';
import { useMyLawyerProfile } from '@/hooks/useLawyer';
import { Spinner } from '@/components/ui';
import {
  LawyerCard,
  LawyerDomainPill,
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
  tone: 'brand' | 'blue' | 'orange' | 'green';
  onClick: () => void;
}

function StatCard({ label, value, icon: Icon, tone, onClick }: StatCardProps) {
  const toneClass = {
    brand: 'text-brand bg-info-bg border-brand/15',
    blue: 'text-brand bg-info-bg border-gray-100',
    orange: 'text-orange-500 bg-orange-50 border-gray-100',
    green: 'text-green-700 bg-green-50 border-gray-100',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[104px] rounded-card border bg-white p-3.5 text-left shadow-sm',
        'transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        tone === 'brand' ? 'border-brand/20 bg-info-bg/40' : 'border-gray-100',
      )}
    >
      <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-full border', toneClass)}>
        <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
      </div>
      <p className={cn('text-[28px] font-bold leading-none', tone === 'orange' ? 'text-orange-500' : tone === 'green' ? 'text-green-700' : 'text-brand')}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-[#111827]">{label}</p>
    </button>
  );
}

function RecentRequestCard({ item }: { item: InboxItemResponse }) {
  const navigate = useNavigate();

  return (
    <LawyerCard className="p-3.5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-[7px]">
          <LawyerDomainPill legalField={item.legalField} />
          <LawyerStatusPill status={item.status} />
        </div>
        <p className="text-[13px] font-semibold leading-[19px] text-[#111827]">
          {item.briefTitle}
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar size={12} strokeWidth={1.8} aria-hidden="true" />
            <span>진단 {formatShortDate(item.sentAt)}</span>
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
  const { data: stats, isLoading: statsLoading } = useInboxStats();
  const { data: inboxPage, isLoading: inboxLoading } = useInboxList(0, 5);
  const { data: profile } = useMyLawyerProfile();

  const isLoading = statsLoading || inboxLoading;
  const recentItems = inboxPage?.content ?? [];
  const lawyerName = profile?.name ?? '변호사';

  return (
    <LawyerPage>
      <LawyerHeader title="변호사 대시보드" />

      <main className="flex-1 px-4 py-4 pb-24">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <LawyerCard className="flex items-center gap-3 p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-bg text-brand">
                <Sparkles size={20} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="text-[13px] font-medium text-[#111827]">
                {lawyerName}님, 오늘도 좋은 하루입니다.
              </p>
            </LawyerCard>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="신규 의뢰"
                value={stats?.newCount ?? 0}
                icon={UserRound}
                tone="brand"
                onClick={() => navigate('/lawyer/inbox?filter=NEW')}
              />
              <StatCard
                label="검토 중"
                value={stats?.reviewing ?? 0}
                icon={Clock}
                tone="blue"
                onClick={() => navigate('/lawyer/inbox?filter=REVIEWING')}
              />
              <StatCard
                label="진행 중 사건"
                value={stats?.confirmed ?? 0}
                icon={BriefcaseBusiness}
                tone="orange"
                onClick={() => navigate('/lawyer/cases')}
              />
              <StatCard
                label="이번 주 완료"
                value={stats?.responded ?? stats?.rejected ?? 0}
                icon={CheckCircle2}
                tone="green"
                onClick={() => navigate('/lawyer/inbox?filter=RESPONDED')}
              />
            </div>

            <section className="space-y-3">
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
                <LawyerCard className="px-4 py-12 text-center">
                  <p className="text-base text-gray-400">수신된 의뢰서가 없습니다</p>
                </LawyerCard>
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
