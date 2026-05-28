import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { usePendingLawyers } from '@/hooks/useAdmin';
import { Spinner } from '@/components/ui';
import type { PendingLawyerResponse } from '@/types/admin';
import { cn } from '@/lib/cn';

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-[#f1f0e8]', text: 'text-[#5f5e5a]', label: '승인 대기' },
  REVIEWING: { bg: 'bg-[#e8f0fc]', text: 'text-[#0c5fa5]', label: '검토 중' },
  SUPPLEMENT_REQUESTED: { bg: 'bg-[#faeeda]', text: 'text-[#854f0b]', label: '보완 요청' },
  VERIFIED: { bg: 'bg-[#eaf3de]', text: 'text-[#3b6e11]', label: '승인 완료' },
  REJECTED: { bg: 'bg-[#fcebeb]', text: 'text-[#a32c2c]', label: '거절' },
};

const AVATAR_COLORS = ['#1a6de0', '#3b6e11', '#854f0b'];

const FILTER_TABS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '승인 대기' },
  { value: 'REVIEWING', label: '검토 중' },
  { value: 'SUPPLEMENT_REQUESTED', label: '보완 요청' },
  { value: 'VERIFIED', label: '승인 완료' },
] as const;

export function LawyerPendingPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = usePendingLawyers(
    page,
    20,
    search || undefined,
    statusFilter || undefined,
  );

  const lawyers: PendingLawyerResponse[] = data?.content ?? [];

  if (isLoading) return <Spinner size="lg" text="변호사 목록 불러오는 중..." />;

  return (
    <div className="space-y-4">
      {/* 검색바 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#adb5b8]" />
          <input
            type="text"
            placeholder="이름, 이메일, 연락처로 검색"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-10 w-full rounded-[20px] border-[1.5px] border-[#e9edef] bg-white pl-10 pr-4 text-[13px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#adb5b8] focus:border-[#1a6de0]"
          />
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:justify-end md:overflow-visible">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setStatusFilter(tab.value); setPage(0); }}
              className={cn(
                'min-h-7 shrink-0 whitespace-nowrap rounded-[14px] px-3 text-[11px] font-normal transition-colors',
                statusFilter === tab.value
                  ? 'bg-[#1a6de0] text-white'
                  : 'border-[1.5px] border-[#e9edef] bg-white text-[#6b7280]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 변호사 카드 목록 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lawyers.length === 0 ? (
          <div className="rounded-[14px] border-[0.5px] border-[#e9edef] bg-white py-16 text-center md:col-span-2 xl:col-span-3">
            <p className="text-[13px] text-[#6b7280]">심사 대기 중인 변호사가 없습니다</p>
          </div>
        ) : (
          lawyers.map((lawyer, idx) => {
            const badge = STATUS_BADGE[lawyer.verificationStatus] ?? STATUS_BADGE.PENDING;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const initial = lawyer.name.charAt(0);
            return (
              <div
                key={lawyer.lawyerId}
                className="h-full overflow-hidden rounded-[14px] border-[0.5px] border-[#e9edef] bg-white"
              >
                <div className="p-3">
                  {/* 상단: 아바타 + 이름/이메일/전화 + 상태 배지 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      <span className="text-[15px] font-medium text-white">{initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[14px] font-medium text-[#1a1a1a]">{lawyer.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[#6b7280]">{lawyer.email || '-'}</p>
                      <p className="truncate text-[11px] text-[#6b7280]">{lawyer.phone || '-'}</p>
                    </div>
                    <span className={`${badge.bg} ${badge.text} inline-flex min-h-6 shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* 전문분야 태그 — L1 domains 만 표시 */}
                  {lawyer.domains && lawyer.domains.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {lawyer.domains.map((spec: string) => (
                        <span key={spec} className="inline-flex min-h-6 max-w-full items-center rounded-full bg-[#e8f0fc] px-2 py-1 text-[10px] text-[#0c447c]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 경력 + 서류 수 */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-[#6b7280]">경력 {lawyer.experienceYears}년</span>
                    <span className="text-[11px] text-[#3b6e11]">서류 {lawyer.documentCount ?? 0}개</span>
                  </div>
                </div>

                {/* 구분선 + 상세 보기 */}
                <div className="border-t border-[#e9edef]">
                  <div className="p-3">
                    <Link
                      to={`/admin/lawyers/${lawyer.lawyerId}`}
                      className="inline-flex min-h-6 items-center rounded-full bg-[#1a6de0] px-2.5 py-1 text-[11px] font-medium text-white"
                    >
                      상세 보기
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={data.page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 text-[11px] font-medium text-[#6b7280] bg-white border border-[#e9edef] rounded-[14px] disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-[11px] text-[#6b7280]">
            {(data.page ?? page) + 1} / {data.totalPages}
          </span>
          <button
            type="button"
            disabled={!data.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-[11px] font-medium text-[#6b7280] bg-white border border-[#e9edef] rounded-[14px] disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
