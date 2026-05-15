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

/** 선택된 leaf — path는 [대분류, 중분류, 소분류] */
interface LeafSelection {
  l1: string;
  l2: string;
  l3: string;
}

// ─── page ────────────────────────────────────────────────────────────────────

/**
 * 와이어프레임 04 (Manual Field Selection, 노드 1:316 / 1:406 / 1:496) 정합:
 *   - 대분류(L1) → 중분류(L2) → 소분류(L3) accordion 트리
 *   - L1/L2 클릭은 펼침/접힘 토글 (chevron `>` ↔ `v` 회전)
 *   - L3는 단일 선택 체크박스 (선택된 leaf 1개만 유효)
 *   - 검색창 입력 시 leaf 검색 결과를 평면 리스트로 렌더
 *   - 선택된 leaf는 검색창 아래 파란 chip으로 표시
 *   - 하단 fixed `다음` 버튼 — leaf 선택 시 활성화, 탭하면 상담 생성
 */
export function NewConsultationPage() {
  const navigate = useNavigate();
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  const [expandedL2, setExpandedL2] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<LeafSelection | null>(null);
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();
  const searchResults = useMemo(
    () => (trimmedQuery ? searchCategories(trimmedQuery) : []),
    [trimmedQuery],
  );

  function toggleL1(name: string) {
    setExpandedL1((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleL2(l1Name: string, l2Name: string) {
    const key = `${l1Name}|${l2Name}`;
    setExpandedL2((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectLeaf(leaf: LeafSelection) {
    setSelected(leaf);
  }

  function clearSelection() {
    setSelected(null);
  }

  function pickFromSearch(l1: string, l2: string, l3: string) {
    // 검색 결과 항목 탭 시 해당 경로를 펼치고 leaf 선택
    setExpandedL1((prev) => new Set(prev).add(l1));
    setExpandedL2((prev) => new Set(prev).add(`${l1}|${l2}`));
    setSelected({ l1, l2, l3 });
    setQuery('');
  }

  function handleNext() {
    if (!selected || isPending) return;
    createConsultation(
      {
        domains: [selected.l1],
        subDomains: [selected.l2],
        tags: [selected.l3],
      },
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

        {/* 선택된 leaf chip */}
        {selected && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={clearSelection}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/5',
                'px-2.5 py-1 text-xs font-medium text-brand',
                'transition-colors hover:bg-brand/10',
              )}
            >
              <span>{selected.l3}</span>
              <X size={12} aria-hidden="true" />
              <span className="sr-only">선택 해제</span>
            </button>
          </div>
        )}

        {/* 본문 — 검색 모드면 결과 리스트, 아니면 트리 */}
        {trimmedQuery ? (
          <SearchResults
            results={searchResults}
            selected={selected}
            onPick={pickFromSearch}
          />
        ) : (
          <TreeView
            tree={LEGAL_CATEGORY_TREE}
            expandedL1={expandedL1}
            expandedL2={expandedL2}
            selected={selected}
            onToggleL1={toggleL1}
            onToggleL2={toggleL2}
            onSelectLeaf={selectLeaf}
          />
        )}
      </main>

      {/* 하단 fixed 다음 버튼 */}
      <div className="sticky bottom-0 left-0 right-0 mx-auto w-full max-w-[390px] bg-white px-5 pb-6 pt-3">
        <button
          type="button"
          disabled={!selected || isPending}
          onClick={handleNext}
          className={cn(
            'flex h-14 w-full items-center justify-center rounded-2xl',
            'text-base font-bold text-white transition-colors',
            'bg-brand hover:bg-brand/90 active:bg-brand/80',
            'disabled:cursor-not-allowed disabled:bg-[#c5cad0]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
          )}
        >
          {isPending ? '생성 중…' : '다음'}
        </button>
      </div>
    </div>
  );
}

// ─── tree view ──────────────────────────────────────────────────────────────

interface TreeViewProps {
  tree: CategoryNode[];
  expandedL1: Set<string>;
  expandedL2: Set<string>;
  selected: LeafSelection | null;
  onToggleL1: (name: string) => void;
  onToggleL2: (l1: string, l2: string) => void;
  onSelectLeaf: (leaf: LeafSelection) => void;
}

function TreeView({
  tree,
  expandedL1,
  expandedL2,
  selected,
  onToggleL1,
  onToggleL2,
  onSelectLeaf,
}: TreeViewProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#e9ecef]">
      <ul className="divide-y divide-[#e9ecef]">
        {tree.map((l1) => {
          const isL1Open = expandedL1.has(l1.name);
          return (
            <li key={l1.name}>
              <L1Row
                name={l1.name}
                isOpen={isL1Open}
                onToggle={() => onToggleL1(l1.name)}
              />
              {isL1Open && (
                <ul>
                  {l1.children.map((l2) => (
                    <L2Block
                      key={l2.name}
                      l1Name={l1.name}
                      l2={l2}
                      isOpen={expandedL2.has(`${l1.name}|${l2.name}`)}
                      selected={selected}
                      onToggleL2={onToggleL2}
                      onSelectLeaf={onSelectLeaf}
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

// ─── L1 row ──────────────────────────────────────────────────────────────────

interface L1RowProps {
  name: string;
  isOpen: boolean;
  onToggle: () => void;
}

function L1Row({ name, isOpen, onToggle }: L1RowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-4 text-left',
        'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
      )}
    >
      <ChevronRight
        size={18}
        className={cn(
          'shrink-0 text-[#31383f] transition-transform',
          isOpen && 'rotate-90',
        )}
        aria-hidden="true"
      />
      <span className="text-[15px] font-bold text-[#161a1d]">{name}</span>
    </button>
  );
}

// ─── L2 block (header + L3 list when open) ──────────────────────────────────

interface L2BlockProps {
  l1Name: string;
  l2: CategoryLevel2;
  isOpen: boolean;
  selected: LeafSelection | null;
  onToggleL2: (l1: string, l2: string) => void;
  onSelectLeaf: (leaf: LeafSelection) => void;
}

function L2Block({
  l1Name,
  l2,
  isOpen,
  selected,
  onToggleL2,
  onSelectLeaf,
}: L2BlockProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggleL2(l1Name, l2.name)}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center gap-2.5 py-3 pr-4 text-left',
          // L2 들여쓰기 (chevron + L1 padding-left 만큼)
          'pl-9',
          'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        )}
      >
        <ChevronRight
          size={16}
          className={cn(
            'shrink-0 transition-transform',
            isOpen ? 'rotate-90 text-brand' : 'text-[#9aa0a6]',
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'text-sm',
            isOpen ? 'font-semibold text-brand' : 'text-[#62686f]',
          )}
        >
          {l2.name}
        </span>
      </button>
      {isOpen && (
        <ul>
          {l2.children.map((leaf) => (
            <L3Row
              key={leaf.name}
              l1Name={l1Name}
              l2Name={l2.name}
              leaf={leaf}
              isSelected={
                selected?.l1 === l1Name &&
                selected?.l2 === l2.name &&
                selected?.l3 === leaf.name
              }
              onSelect={onSelectLeaf}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── L3 row (checkbox leaf) ────────────────────────────────────────────────

interface L3RowProps {
  l1Name: string;
  l2Name: string;
  leaf: CategoryLeaf;
  isSelected: boolean;
  onSelect: (leaf: LeafSelection) => void;
}

function L3Row({ l1Name, l2Name, leaf, isSelected, onSelect }: L3RowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect({ l1: l1Name, l2: l2Name, l3: leaf.name })}
        aria-pressed={isSelected}
        className={cn(
          'flex w-full items-center gap-3 py-2.5 pr-4 text-left',
          // L3 들여쓰기 (L2 chevron 폭 + L2 padding-left)
          'pl-[60px]',
          'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        )}
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
            isSelected
              ? 'border-brand bg-brand'
              : 'border-[#c5cad0] bg-white',
          )}
          aria-hidden="true"
        >
          {isSelected && (
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

// ─── search results (flat list) ────────────────────────────────────────────

interface SearchResultsProps {
  results: ReturnType<typeof searchCategories>;
  selected: LeafSelection | null;
  onPick: (l1: string, l2: string, l3: string) => void;
}

function SearchResults({ results, selected, onPick }: SearchResultsProps) {
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
        const isSelected =
          selected?.l1 === l1 && selected?.l2 === l2 && selected?.l3 === l3;
        return (
          <li key={`${l1}|${l2}|${l3}`}>
            <button
              type="button"
              onClick={() => onPick(l1, l2, l3)}
              className={cn(
                'flex w-full flex-col items-start gap-1 px-4 py-3 text-left',
                'transition-colors hover:bg-[#f9fafb] active:bg-[#f3f5f6]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                isSelected && 'bg-brand/5',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-brand' : 'text-[#161a1d]',
                )}
              >
                {leaf.name}
              </span>
              <span className="text-xs text-[#9aa0a6]">
                {l1} › {l2}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
