import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MoreVertical, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCreateConsultation } from '@/hooks/useConsultation';
import { PageHeader } from '@/components/mobile/PageHeader';
import {
  LEGAL_CATEGORY_TREE,
  searchCategories,
  type CategoryNode,
  type CategoryLevel2,
  type CategoryLeaf,
} from '@/lib/legalCategories';

// ─── types ──────────────────────────────────────────────────────────────────

/** 선택된 항목 — level에 따라 l2/l3가 채워짐 */
interface SelectedItem {
  level: 1 | 2 | 3;
  l1: string;
  l2?: string;
  l3?: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function itemKey(item: SelectedItem): string {
  if (item.level === 1) return `l1|${item.l1}`;
  if (item.level === 2) return `l2|${item.l1}|${item.l2}`;
  return `l3|${item.l1}|${item.l2}|${item.l3}`;
}

function uniqStrings(arr: (string | undefined)[]): string[] {
  return Array.from(new Set(arr.filter((s): s is string => Boolean(s))));
}

// ─── page ────────────────────────────────────────────────────────────────────

/**
 * 와이어프레임 04 (Manual Field Selection, 노드 1:316 / 1:406 / 1:496) 정합:
 *   - 대분류(L1) → 중분류(L2) → 소분류(L3) accordion 트리
 *   - 자유 조합 멀티 셀렉트 — L1/L2/L3 어느 레벨이든 여러 개 동시 선택 가능
 *   - chevron 영역 탭: 펼침/접힘 / 텍스트 영역 탭: 선택 토글
 *   - 선택된 항목마다 검색창 아래 brand-crumb chip (× 클릭 = 해제)
 *   - 검색창 입력 시 leaf 검색 결과를 평면 리스트로 렌더
 *   - 하단 fixed `다음` 버튼 — 1개 이상 선택 시 활성, 탭하면 상담 생성
 */
export function NewConsultationPage() {
  const navigate = useNavigate();
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  const [expandedL2, setExpandedL2] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();
  const searchResults = useMemo(
    () => (trimmedQuery ? searchCategories(trimmedQuery) : []),
    [trimmedQuery],
  );

  /** 빠른 lookup용 selected key set */
  const selectedKeys = useMemo(
    () => new Set(selected.map(itemKey)),
    [selected],
  );

  function toggleL1Expand(name: string) {
    setExpandedL1((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleL2Expand(l1Name: string, l2Name: string) {
    const key = `${l1Name}|${l2Name}`;
    setExpandedL2((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleItem(item: SelectedItem) {
    const key = itemKey(item);
    setSelected((prev) => {
      if (prev.some((i) => itemKey(i) === key)) {
        return prev.filter((i) => itemKey(i) !== key);
      }
      return [...prev, item];
    });
  }

  function removeItem(item: SelectedItem) {
    const key = itemKey(item);
    setSelected((prev) => prev.filter((i) => itemKey(i) !== key));
  }

  function pickFromSearch(l1: string, l2: string, l3: string) {
    // 검색 결과 항목 탭 시 해당 경로를 펼치고 leaf 토글 선택
    setExpandedL1((prev) => new Set(prev).add(l1));
    setExpandedL2((prev) => new Set(prev).add(`${l1}|${l2}`));
    toggleItem({ level: 3, l1, l2, l3 });
    setQuery('');
  }

  function handleNext() {
    if (selected.length === 0 || isPending) return;

    // level별로 분류하여 API payload 구성
    const domains = uniqStrings(selected.map((s) => s.l1));
    const subDomains = uniqStrings(
      selected.filter((s) => s.level >= 2).map((s) => s.l2),
    );
    const tags = uniqStrings(
      selected.filter((s) => s.level === 3).map((s) => s.l3),
    );

    createConsultation(
      { domains, subDomains, tags },
      {
        onSuccess: (res) => {
          const newId = res.data.data.consultationId;
          navigate(`/consultations/${newId}`);
        },
      },
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
      <PageHeader
        title="분야 선택"
        rightSlot={
          <button
            type="button"
            aria-label="메뉴"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              'text-[#16181d] transition-colors hover:bg-gray-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            )}
          >
            <MoreVertical size={20} />
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-[112px]">
        <h1 className="text-[20px] font-bold leading-7 text-[#161a1d]">
          어떤 <span className="text-brand">법률 분야</span>를
          <br />
          선택 하시겠습니까?
        </h1>
        <p className="mt-1.5 text-xs text-[#62686f]">
          여러 항목을 동시에 선택할 수 있습니다.
        </p>

        {/* 검색창 */}
        <div className="relative mt-5">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa0a6]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="전문 분야 검색.."
            className={cn(
              'w-full rounded-2xl border border-[#e9ecef] bg-white py-3 pl-11 pr-4',
              'text-sm text-[#161a1d] placeholder:text-[#9aa0a6]',
              'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
            )}
          />
        </div>

        {/* 선택된 항목 chip 리스트 — 각 항목 개별 chip + breadcrumb */}
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selected.map((item) => (
              <SelectedChip
                key={itemKey(item)}
                item={item}
                onRemove={() => removeItem(item)}
              />
            ))}
          </div>
        )}

        {/* 본문 — 검색 모드면 결과 리스트, 아니면 트리 */}
        {trimmedQuery ? (
          <SearchResults
            results={searchResults}
            selectedKeys={selectedKeys}
            onPick={pickFromSearch}
          />
        ) : (
          <TreeView
            tree={LEGAL_CATEGORY_TREE}
            expandedL1={expandedL1}
            expandedL2={expandedL2}
            selectedKeys={selectedKeys}
            onToggleL1Expand={toggleL1Expand}
            onToggleL2Expand={toggleL2Expand}
            onToggleItem={toggleItem}
          />
        )}
      </main>

      {/* 하단 fixed 다음 버튼 */}
      <div className="sticky bottom-0 left-0 right-0 mx-auto w-full max-w-[390px] bg-white px-5 pb-6 pt-3">
        <button
          type="button"
          disabled={selected.length === 0 || isPending}
          onClick={handleNext}
          className={cn(
            'flex h-14 w-full items-center justify-center rounded-2xl',
            'text-base font-bold text-white transition-colors',
            'bg-brand hover:bg-brand/90 active:bg-brand/80',
            'disabled:cursor-not-allowed disabled:bg-[#c5cad0]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
          )}
        >
          {isPending
            ? '생성 중…'
            : selected.length > 0
              ? `다음 (${selected.length}개 선택)`
              : '다음'}
        </button>
      </div>
    </div>
  );
}

// ─── selected chip ──────────────────────────────────────────────────────────

interface SelectedChipProps {
  item: SelectedItem;
  onRemove: () => void;
}

function SelectedChip({ item, onRemove }: SelectedChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand/40 bg-brand/5',
        'px-3 py-1 text-xs font-medium text-brand',
        'transition-colors hover:bg-brand/10',
      )}
    >
      <span className="truncate">
        {item.l1}
        {item.l2 && (
          <>
            <span className="mx-1 text-brand/50">›</span>
            {item.l2}
          </>
        )}
        {item.l3 && (
          <>
            <span className="mx-1 text-brand/50">›</span>
            {item.l3}
          </>
        )}
      </span>
      <X size={12} aria-hidden="true" className="shrink-0" />
      <span className="sr-only">선택 해제</span>
    </button>
  );
}

// ─── tree view ──────────────────────────────────────────────────────────────

interface TreeViewProps {
  tree: CategoryNode[];
  expandedL1: Set<string>;
  expandedL2: Set<string>;
  selectedKeys: Set<string>;
  onToggleL1Expand: (name: string) => void;
  onToggleL2Expand: (l1: string, l2: string) => void;
  onToggleItem: (item: SelectedItem) => void;
}

function TreeView({
  tree,
  expandedL1,
  expandedL2,
  selectedKeys,
  onToggleL1Expand,
  onToggleL2Expand,
  onToggleItem,
}: TreeViewProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#e9ecef]">
      <ul className="divide-y divide-[#e9ecef]">
        {tree.map((l1) => {
          const isL1Open = expandedL1.has(l1.name);
          const isL1Selected = selectedKeys.has(`l1|${l1.name}`);
          return (
            <li key={l1.name}>
              <L1Row
                name={l1.name}
                isOpen={isL1Open}
                isSelected={isL1Selected}
                onToggleExpand={() => onToggleL1Expand(l1.name)}
                onToggleSelect={() =>
                  onToggleItem({ level: 1, l1: l1.name })
                }
              />
              {isL1Open && (
                <ul>
                  {l1.children.map((l2) => (
                    <L2Block
                      key={l2.name}
                      l1Name={l1.name}
                      l2={l2}
                      isOpen={expandedL2.has(`${l1.name}|${l2.name}`)}
                      selectedKeys={selectedKeys}
                      onToggleL2Expand={onToggleL2Expand}
                      onToggleItem={onToggleItem}
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── L1 row (chevron = 펼침 / 텍스트 = 선택 토글) ────────────────────────────

interface L1RowProps {
  name: string;
  isOpen: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
}

function L1Row({
  name,
  isOpen,
  isSelected,
  onToggleExpand,
  onToggleSelect,
}: L1RowProps) {
  return (
    <div
      className={cn(
        'flex w-full items-stretch',
        isSelected && 'bg-brand/5',
      )}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        aria-label={isOpen ? `${name} 접기` : `${name} 펼치기`}
        aria-expanded={isOpen}
        className={cn(
          'flex shrink-0 items-center justify-center px-3 py-4',
          'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
        )}
      >
        <ChevronRight
          size={18}
          className={cn(
            'text-[#31383f] transition-transform',
            isOpen && 'rotate-90',
          )}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        onClick={onToggleSelect}
        aria-pressed={isSelected}
        className={cn(
          'flex flex-1 items-center gap-3 py-4 pr-4 text-left',
          'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
        )}
      >
        <Checkbox checked={isSelected} />
        <span
          className={cn(
            'text-[15px] font-bold',
            isSelected ? 'text-brand' : 'text-[#161a1d]',
          )}
        >
          {name}
        </span>
      </button>
    </div>
  );
}

// ─── L2 block ────────────────────────────────────────────────────────────────

interface L2BlockProps {
  l1Name: string;
  l2: CategoryLevel2;
  isOpen: boolean;
  selectedKeys: Set<string>;
  onToggleL2Expand: (l1: string, l2: string) => void;
  onToggleItem: (item: SelectedItem) => void;
}

function L2Block({
  l1Name,
  l2,
  isOpen,
  selectedKeys,
  onToggleL2Expand,
  onToggleItem,
}: L2BlockProps) {
  const isL2Selected = selectedKeys.has(`l2|${l1Name}|${l2.name}`);
  return (
    <li>
      <div
        className={cn(
          'flex w-full items-stretch',
          isL2Selected && 'bg-brand/5',
        )}
      >
        <button
          type="button"
          onClick={() => onToggleL2Expand(l1Name, l2.name)}
          aria-label={isOpen ? `${l2.name} 접기` : `${l2.name} 펼치기`}
          aria-expanded={isOpen}
          className={cn(
            'flex shrink-0 items-center justify-center py-3',
            'pl-9 pr-2',
            'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
          )}
        >
          <ChevronRight
            size={16}
            className={cn(
              'transition-transform',
              isOpen || isL2Selected ? 'text-brand' : 'text-[#9aa0a6]',
              isOpen && 'rotate-90',
            )}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={() =>
            onToggleItem({ level: 2, l1: l1Name, l2: l2.name })
          }
          aria-pressed={isL2Selected}
          className={cn(
            'flex flex-1 items-center gap-3 py-3 pr-4 text-left',
            'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
          )}
        >
          <Checkbox checked={isL2Selected} small />
          <span
            className={cn(
              'text-sm',
              isOpen || isL2Selected
                ? 'font-semibold text-brand'
                : 'text-[#62686f]',
            )}
          >
            {l2.name}
          </span>
        </button>
      </div>
      {isOpen && (
        <ul>
          {l2.children.map((leaf) => (
            <L3Row
              key={leaf.name}
              l1Name={l1Name}
              l2Name={l2.name}
              leaf={leaf}
              isSelected={selectedKeys.has(
                `l3|${l1Name}|${l2.name}|${leaf.name}`,
              )}
              onToggleItem={onToggleItem}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── L3 row ──────────────────────────────────────────────────────────────────

interface L3RowProps {
  l1Name: string;
  l2Name: string;
  leaf: CategoryLeaf;
  isSelected: boolean;
  onToggleItem: (item: SelectedItem) => void;
}

function L3Row({
  l1Name,
  l2Name,
  leaf,
  isSelected,
  onToggleItem,
}: L3RowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() =>
          onToggleItem({
            level: 3,
            l1: l1Name,
            l2: l2Name,
            l3: leaf.name,
          })
        }
        aria-pressed={isSelected}
        className={cn(
          'flex w-full items-center gap-3 py-2.5 pr-4 text-left',
          'pl-[60px]',
          'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
          isSelected && 'bg-brand/5',
        )}
      >
        <Checkbox checked={isSelected} small />
        <span
          className={cn(
            'text-sm',
            isSelected ? 'font-medium text-[#161a1d]' : 'text-[#62686f]',
          )}
        >
          {leaf.name}
        </span>
      </button>
    </li>
  );
}

// ─── shared checkbox ────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  small?: boolean;
}

function Checkbox({ checked, small = false }: CheckboxProps) {
  const size = small ? 'h-[18px] w-[18px]' : 'h-5 w-5';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border transition-colors',
        size,
        checked ? 'border-brand bg-brand' : 'border-[#c5cad0] bg-white',
      )}
      aria-hidden="true"
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6.5L5 9L9.5 3.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

// ─── search results (flat list) ────────────────────────────────────────────

interface SearchResultsProps {
  results: ReturnType<typeof searchCategories>;
  selectedKeys: Set<string>;
  onPick: (l1: string, l2: string, l3: string) => void;
}

function SearchResults({ results, selectedKeys, onPick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[#e9ecef] bg-[#f9fafb] py-10 text-center">
        <p className="text-sm text-[#62686f]">검색 결과가 없습니다.</p>
        <p className="mt-1 text-xs text-[#9aa0a6]">다른 키워드로 검색해 주세요.</p>
      </div>
    );
  }

  return (
    <ul className="mt-4 overflow-hidden rounded-2xl border border-[#e9ecef] divide-y divide-[#e9ecef]">
      {results.map(({ leaf, path }) => {
        const [l1, l2, l3] = path;
        const isSelected = selectedKeys.has(`l3|${l1}|${l2}|${l3}`);
        return (
          <li key={`${l1}|${l2}|${l3}`}>
            <button
              type="button"
              onClick={() => onPick(l1, l2, l3)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left',
                'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                isSelected && 'bg-brand/5',
              )}
            >
              <Checkbox checked={isSelected} small />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={cn(
                    'truncate text-sm font-medium',
                    isSelected ? 'text-brand' : 'text-[#161a1d]',
                  )}
                >
                  {leaf.name}
                </span>
                <span className="truncate text-xs text-[#9aa0a6]">
                  {l1} › {l2}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
