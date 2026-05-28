import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLawyerList } from '@/hooks/useLawyer';
import { useLawyerRecommendations } from '@/hooks/useBrief';
import { Avatar, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/mobile/PageHeader';
import { DOMAIN_LABELS } from '@/lib/constants';
import type { LawyerResponse } from '@/types';
import type { PageResponse } from '@/types/api';

// ─── types ───────────────────────────────────────────────────────────────────

type SortKey = 'relevance' | 'experience' | 'rating';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: '관련도순' },
  { value: 'experience', label: '경력순' },
  { value: 'rating', label: '평점순' },
];

// ─── lawyer card ─────────────────────────────────────────────────────────────

interface LawyerCardProps {
  lawyer: LawyerResponse;
  matchedKeywords?: string[];
  onClick: () => void;
}

function LawyerCard({ lawyer, matchedKeywords, onClick }: LawyerCardProps) {
  const isVerified = lawyer.verificationStatus === 'VERIFIED';
  const hasMatched = matchedKeywords && matchedKeywords.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-full w-full text-left bg-white rounded-card shadow-sm p-4',
        'hover:shadow-md active:scale-[0.99] transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
      )}
    >
      {/* P-7: chevron 우측 상단 */}
      <ChevronRight
        size={18}
        className="absolute right-3 top-3 text-gray-400"
        aria-hidden="true"
      />

      {/* Profile image + info */}
      <div className="flex items-start gap-3 pr-6">
        <Avatar url={lawyer.profileImageUrl} name={lawyer.name} size={56} />

        {/* Name + verification */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-gray-900 truncate">
              {lawyer.name}
            </span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle size={11} aria-hidden="true" />
                인증됨
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                심사 중
              </span>
            )}
          </div>

          {/* Experience */}
          <p className="mt-0.5 text-sm text-gray-500">
            {lawyer.experienceYears}년 경력
          </p>
        </div>
      </div>

      {/* Bio excerpt */}
      {lawyer.bio && (
        <p className="mt-2.5 text-sm text-gray-500 leading-relaxed line-clamp-2">
          {lawyer.bio}
        </p>
      )}

      {/* Specialization chips */}
      {lawyer.domains && lawyer.domains.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lawyer.domains.map((d) => (
            <span
              key={d}
              className="bg-gray-100/80 text-text-soft text-[11px] font-normal px-2 py-0.5 rounded-[10px]"
            >
              {DOMAIN_LABELS[d] ?? d}
            </span>
          ))}
        </div>
      )}

      {/* B-19: MATCHED KEYWORDS box — brief 진입 시에만 노출 */}
      {hasMatched && (
        <div className="mt-3 rounded-xl bg-info-bg px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-brand" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-wide text-brand">
              MATCHED KEYWORDS
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {matchedKeywords?.map((kw) => (
              <span
                key={kw}
                className="text-[11px] font-medium text-brand bg-white/70 px-1.5 py-0.5 rounded"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

// ─── sort dropdown ───────────────────────────────────────────────────────────

interface SortDropdownProps {
  value: SortKey;
  onChange: (v: SortKey) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={cn(
          'inline-flex items-center gap-1 text-sm font-medium text-gray-700',
          'px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* backdrop to close */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className={cn(
              'absolute right-0 top-full mt-1 z-40 min-w-[120px]',
              'bg-white border border-gray-200 rounded-lg shadow-md py-1',
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-1.5 text-sm',
                    opt.value === value
                      ? 'text-brand font-semibold bg-info-bg'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── pagination ──────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  onChange: (p: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // 최대 5개의 페이지 번호 노출 (현재 페이지 중심)
  const windowSize = 5;
  let start = Math.max(0, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize);
  start = Math.max(0, end - windowSize);
  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <nav
      aria-label="페이지네이션"
      className="mt-4 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md',
          'text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent',
        )}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-sm font-medium',
            p === page
              ? 'bg-brand text-white'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          {p + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md',
          'text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent',
        )}
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

interface LocationState {
  briefId?: string;
}

export function LawyerListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);

  // briefId 출처: state → query string
  const briefId =
    (location.state as LocationState | null)?.briefId ?? search.get('briefId') ?? undefined;

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortKey>('relevance');
  const pageSize = 20;

  // 정렬 활성 시(관련도 외): 페이지 단위 정렬은 의미 없으므로 전체 페이지를 한 번에 받아온다.
  // 데이터가 많아질 경우 백엔드 sort 파라미터로 이전 예정 (아래 TODO 참고).
  const isSortingClientSide = sort !== 'relevance';
  const effectivePage = isSortingClientSide ? 0 : page;
  const effectiveSize = isSortingClientSide ? 200 : pageSize;

  const { data, isLoading } = useLawyerList(effectivePage, effectiveSize, undefined);

  // 백엔드 응답이 PageResponse<LawyerResponse> 또는 LawyerResponse[] 두 가지 형태로
  // 올 수 있어 type guard로 분기한다.
  const isPageResponse = (
    v: unknown,
  ): v is PageResponse<LawyerResponse> =>
    typeof v === 'object' &&
    v !== null &&
    Array.isArray((v as { content?: unknown }).content);

  const rawLawyers: LawyerResponse[] = useMemo(() => {
    if (isPageResponse(data)) return data.content;
    if (Array.isArray(data)) return data as LawyerResponse[];
    return [];
  }, [data]);

  const totalElements: number = isPageResponse(data)
    ? data.totalElements
    : rawLawyers.length;
  const totalPages: number = isPageResponse(data)
    ? data.totalPages
    : Math.max(1, Math.ceil(totalElements / pageSize));

  // brief 진입 시: 추천 데이터에서 matched keywords 확보
  const { data: recommendations } = useLawyerRecommendations(briefId ?? '', !!briefId);

  // lawyerId → matchedKeywords 매핑
  const matchedMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const list = (recommendations as
      | { lawyerId: string; matchedKeywords?: string[] | null }[]
      | undefined) ?? [];
    list.forEach((r) => {
      if (r.matchedKeywords && r.matchedKeywords.length > 0) {
        map.set(r.lawyerId, r.matchedKeywords);
      }
    });
    return map;
  }, [recommendations]);

  // brief 진입 시: 핵심 키워드 패널에 사용할 union 키워드
  const briefKeywords = useMemo(() => {
    if (!briefId) return [];
    const list = (recommendations as
      | { matchedKeywords?: string[] | null }[]
      | undefined) ?? [];
    const set = new Set<string>();
    list.forEach((r) => {
      r.matchedKeywords?.forEach((kw) => set.add(kw));
    });
    return Array.from(set).slice(0, 8);
  }, [briefId, recommendations]);

  // 정렬 (백엔드 미지원이므로 클라이언트 사이드).
  // 관련도순(relevance)은 기본 페이지 단위로 동작해도 의미가 있어 페이지네이션 유지.
  // 경력/평점순은 isSortingClientSide=true → 위에서 전체 200건을 한 번에 받아 와서 정렬.
  // TODO: 백엔드에 sort 파라미터가 추가되면 useLawyerList(page, size, spec, sort)로 이관
  const sortedLawyers = useMemo(() => {
    const arr = [...rawLawyers];
    if (sort === 'experience') {
      arr.sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0));
    } else if (sort === 'rating') {
      // rating 필드가 없으므로 caseCount를 임시 대용 — TODO: 백엔드 rating 추가 시 교체
      arr.sort((a, b) => (b.caseCount ?? 0) - (a.caseCount ?? 0));
    } else if (sort === 'relevance' && briefId && matchedMap.size > 0) {
      arr.sort((a, b) => {
        const am = matchedMap.get(a.lawyerId)?.length ?? 0;
        const bm = matchedMap.get(b.lawyerId)?.length ?? 0;
        return bm - am;
      });
    }
    return arr;
  }, [rawLawyers, sort, briefId, matchedMap]);

  // 클라이언트 사이드 정렬 시: 전체 결과를 받아왔으므로 화면 단위 페이징을 수동으로 적용
  const lawyers = useMemo(() => {
    if (!isSortingClientSide) return sortedLawyers;
    const start = page * pageSize;
    return sortedLawyers.slice(start, start + pageSize);
  }, [sortedLawyers, isSortingClientSide, page, pageSize]);

  // 클라이언트 정렬 시 총 페이지 수는 sortedLawyers 기준
  const effectiveTotalPages = isSortingClientSide
    ? Math.max(1, Math.ceil(sortedLawyers.length / pageSize))
    : totalPages;
  const effectiveTotalElements = isSortingClientSide
    ? sortedLawyers.length
    : totalElements;

  const rightActions = (
    <>
      <button
        type="button"
        aria-label="검색"
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
      >
        <Search size={18} />
      </button>
      <button
        type="button"
        aria-label="알림"
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
      >
        <Bell size={18} />
      </button>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white lg:bg-transparent">
      {/* B-17: 워드마크 헤더 + 우측 아이콘 */}
      <PageHeader logoVariant="wordmark" rightSlot={rightActions} />

      {/* B-18: 결과 헤더 (정렬 드롭다운 포함) */}
      <div className="sticky top-[68px] z-10 bg-surface border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold text-gray-900">{effectiveTotalElements}</span>명의 변호사가 검색되었습니다
          </p>
          <SortDropdown
            value={sort}
            onChange={(v) => {
              setSort(v);
              setPage(0); // 정렬 변경 시 첫 페이지로 리셋
            }}
          />
        </div>
      </div>

      <main className="flex-1 px-4 py-4 lg:px-6">
        {/* B-18: 핵심 키워드 패널 — briefId 진입 시에만 노출 */}
        {briefId && briefKeywords.length > 0 && (
          <section className="mb-4 rounded-card bg-info-bg p-3.5">
            <p className="text-[11px] font-semibold tracking-wide text-brand">
              내 사건 핵심 키워드
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {briefKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs font-medium text-brand bg-white px-2 py-0.5 rounded-full"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && lawyers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 pt-20 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={36} className="text-gray-300" aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-gray-500">
              조건에 맞는 변호사가 없습니다
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && lawyers.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {lawyers.map((lawyer) => (
                <LawyerCard
                  key={lawyer.lawyerId}
                  lawyer={lawyer}
                  matchedKeywords={matchedMap.get(lawyer.lawyerId)}
                  onClick={() =>
                    navigate(`/lawyers/${lawyer.lawyerId}`, {
                      state: briefId ? { briefId } : undefined,
                    })
                  }
                />
              ))}
            </div>

            {/* P-8: 페이지네이션 */}
            <Pagination
              page={page}
              totalPages={effectiveTotalPages}
              onChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
