import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCreateConsultation } from '@/hooks/useConsultation';
import { PageHeader } from '@/components/mobile/PageHeader';
import { Button } from '@/components/ui';
import {
  LEGAL_CATEGORY_TREE,
  buildLeafPathMap,
  searchCategories,
} from '@/lib/legalCategories';

// ─── page ────────────────────────────────────────────────────────────────────

export function NewConsultationPage() {
  const navigate = useNavigate();
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  // UI state — 펼친 L1·L2 노드 (한 번에 하나만 펼침)
  const [openL1, setOpenL1] = useState<string | null>(null);
  const [openL2, setOpenL2] = useState<string | null>(null);

  // L3 leaf 다중 선택
  const [selectedLeaves, setSelectedLeaves] = useState<Set<string>>(new Set());
  const [isUnknown, setIsUnknown] = useState(false);
  const [query, setQuery] = useState('');

  const pathMap = useMemo(() => buildLeafPathMap(LEGAL_CATEGORY_TREE), []);
  const searchResults = useMemo(() => searchCategories(query), [query]);
  const isSearching = query.trim().length > 0;
  const isDomainChosen = selectedLeaves.size > 0 || isUnknown;

  function toggleLeaf(name: string) {
    setIsUnknown(false);
    setSelectedLeaves((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function removeLeaf(name: string) {
    setSelectedLeaves((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }

  function handleUnknownToggle() {
    setIsUnknown((v) => !v);
    if (!isUnknown) setSelectedLeaves(new Set());
  }

  function handleSubmit() {
    if (!isDomainChosen) return;

    let request;
    if (isUnknown) {
      request = { domains: [], subDomains: [], tags: [] };
    } else {
      // 선택된 leaf path들을 L1/L2/L3로 분해해 API 요청 형식으로 변환
      const domains = new Set<string>();
      const subDomains = new Set<string>();
      const tags = new Set<string>();
      selectedLeaves.forEach((leafName) => {
        const path = pathMap.get(leafName);
        if (!path) return;
        domains.add(path[0]);
        subDomains.add(path[1]);
        tags.add(path[2]);
      });
      request = {
        domains: Array.from(domains),
        subDomains: Array.from(subDomains),
        tags: Array.from(tags),
      };
    }

    createConsultation(request, {
      onSuccess: (res) => {
        const newId = res.data.data.consultationId;
        navigate(`/consultations/${newId}`);
      },
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col bg-white">
      <PageHeader title="분야 선택" />

      <main className="flex flex-1 flex-col overflow-y-auto px-[25px] pt-4 pb-24">
        {/* Title — figma 04 */}
        <h1 className="text-[20px] font-bold leading-[25px] text-[#181b20]">
          어떤 <span className="text-brand">법률 분야</span>를
          <br />
          선택 하시겠습니까?
        </h1>

        {/* Search input — figma 04 */}
        <div className="mt-10 relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#adb5bd]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="전문 분야 검색.."
            className={cn(
              'h-[45px] w-full rounded-[12px] border border-[#adb5bd] bg-white',
              'pl-10 pr-4 text-sm',
              'placeholder:text-[#adb5bd]',
              'shadow-[0px_4px_8px_0px_rgba(35,37,41,0.04)]',
              'outline-none transition-colors',
              'focus:border-brand',
            )}
          />
        </div>

        {/* Selected leaf chips — figma v3 (상단 chip 영역) */}
        {selectedLeaves.size > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Array.from(selectedLeaves).map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-[12px] border border-brand/30 bg-info-bg py-1 pl-2.5 pr-1.5 text-xs font-medium text-brand"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeLeaf(name)}
                  aria-label={`${name} 제거`}
                  className="rounded-full p-0.5 hover:bg-brand/10"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tree / search results — figma 04 (L1/L2/L3 트리) */}
        <div className="mt-4 overflow-hidden rounded-[12px] border border-[#adb5bd] bg-white shadow-[0px_4px_8px_0px_rgba(35,37,41,0.04)]">
          {isSearching ? (
            <SearchResults
              results={searchResults}
              selectedLeaves={selectedLeaves}
              onToggle={toggleLeaf}
            />
          ) : (
            <TreeView
              data={LEGAL_CATEGORY_TREE}
              openL1={openL1}
              setOpenL1={setOpenL1}
              openL2={openL2}
              setOpenL2={setOpenL2}
              selectedLeaves={selectedLeaves}
              onToggleLeaf={toggleLeaf}
            />
          )}
        </div>

        {/* "잘 모르겠어요" option */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleUnknownToggle}
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:underline',
              isUnknown
                ? 'text-brand underline'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            잘 모르겠어요
          </button>
        </div>

        <div className="flex-1" />

        {/* "다음" button — figma 04: Button lg */}
        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={!isDomainChosen}
            isLoading={isPending}
          >
            다음
          </Button>
        </div>
      </main>
    </div>
  );
}

// ─── Tree view (browsing mode) ───────────────────────────────────────────────

interface TreeViewProps {
  data: typeof LEGAL_CATEGORY_TREE;
  openL1: string | null;
  setOpenL1: (v: string | null) => void;
  openL2: string | null;
  setOpenL2: (v: string | null) => void;
  selectedLeaves: Set<string>;
  onToggleLeaf: (name: string) => void;
}

function TreeView({
  data,
  openL1,
  setOpenL1,
  openL2,
  setOpenL2,
  selectedLeaves,
  onToggleLeaf,
}: TreeViewProps) {
  return (
    <div>
      {data.map((l1, idx) => {
        const isL1Open = openL1 === l1.name;
        const isLast = idx === data.length - 1;
        return (
          <div
            key={l1.name}
            className={cn(!isLast && 'border-b border-border')}
          >
            {/* L1 row */}
            <button
              type="button"
              onClick={() => {
                setOpenL1(isL1Open ? null : l1.name);
                setOpenL2(null);
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left',
                'transition-colors duration-150 hover:bg-brand/5',
                'focus-visible:outline-none focus-visible:bg-brand/10',
              )}
              aria-expanded={isL1Open}
            >
              {isL1Open ? (
                <ChevronDown size={18} className="shrink-0 text-text-soft" />
              ) : (
                <ChevronRight size={18} className="shrink-0 text-text-soft" />
              )}
              <span className="text-sm font-medium text-[#16181d]">{l1.name}</span>
            </button>

            {/* L2 children */}
            {isL1Open && (
              <div>
                {l1.children.map((l2) => {
                  const isL2Open = openL2 === l2.name;
                  return (
                    <div key={l2.name}>
                      {/* L2 row */}
                      <button
                        type="button"
                        onClick={() => setOpenL2(isL2Open ? null : l2.name)}
                        className={cn(
                          'flex w-full items-center gap-3 py-2 pl-9 pr-4 text-left',
                          'transition-colors duration-150 hover:bg-brand/5',
                          'focus-visible:outline-none focus-visible:bg-brand/10',
                        )}
                        aria-expanded={isL2Open}
                      >
                        {isL2Open ? (
                          <ChevronDown size={16} className={cn('shrink-0', isL2Open ? 'text-brand' : 'text-text-soft')} />
                        ) : (
                          <ChevronRight size={16} className="shrink-0 text-text-soft" />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            isL2Open ? 'font-medium text-brand' : 'text-text-soft',
                          )}
                        >
                          {l2.name}
                        </span>
                      </button>

                      {/* L3 leaves (checkboxes) */}
                      {isL2Open && (
                        <div className="pb-1">
                          {l2.children.map((leaf) => {
                            const isSelected = selectedLeaves.has(leaf.name);
                            return (
                              <label
                                key={leaf.name}
                                className={cn(
                                  'flex w-full cursor-pointer items-center gap-3 py-1.5 pl-14 pr-4',
                                  'transition-colors duration-150 hover:bg-brand/5',
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => onToggleLeaf(leaf.name)}
                                />
                                <span
                                  className={cn(
                                    'text-sm',
                                    isSelected ? 'font-medium text-brand' : 'text-[#16181d]',
                                  )}
                                >
                                  {leaf.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Search results (search mode) ────────────────────────────────────────────

interface SearchResultsProps {
  results: ReturnType<typeof searchCategories>;
  selectedLeaves: Set<string>;
  onToggle: (name: string) => void;
}

function SearchResults({ results, selectedLeaves, onToggle }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[#adb5bd]">
        검색 결과가 없습니다
      </div>
    );
  }

  return (
    <div>
      {results.map(({ leaf, path }, idx) => {
        const isSelected = selectedLeaves.has(leaf.name);
        const isLast = idx === results.length - 1;
        return (
          <label
            key={`${path[0]}|${path[1]}|${path[2]}`}
            className={cn(
              'flex w-full cursor-pointer items-start gap-3 px-4 py-3',
              'transition-colors duration-150 hover:bg-brand/5',
              !isLast && 'border-b border-border',
            )}
          >
            <Checkbox
              checked={isSelected}
              onChange={() => onToggle(leaf.name)}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm',
                  isSelected ? 'font-medium text-brand' : 'text-[#16181d]',
                )}
              >
                {leaf.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-soft">
                {path[0]} {'>'} {path[1]}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}

// ─── Custom checkbox (figma 04 style) ────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-xs border-2 transition-colors',
        checked ? 'border-brand bg-brand' : 'border-[#adb5bd] bg-white',
        className,
      )}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && (
        <svg viewBox="0 0 14 14" className="size-3 text-white" fill="none">
          <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
