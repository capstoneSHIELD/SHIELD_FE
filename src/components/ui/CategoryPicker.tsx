import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from './Input';
import {
  LEGAL_CATEGORY_TREE,
  searchCategories,
  type CategoryNode,
  type CategoryLevel2,
  type CategoryLeaf,
  type CategorySelection,
  type CategorySearchResult,
} from '@/lib/legalCategories';

// ── Props ──────────────────────────────────────────────────────────────────

interface CategoryPickerProps {
  data?: CategoryNode[];
  rootLabel?: string;
  value: CategorySelection | null;
  onChange: (value: CategorySelection | null) => void;
  placeholder?: string;
  error?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isSelected(value: CategorySelection | null, path: string[]): boolean {
  if (!value) return false;
  return value.path.length === path.length && value.path.every((s, i) => s === path[i]);
}

// ── Component ──────────────────────────────────────────────────────────────

export function CategoryPicker({
  data = LEGAL_CATEGORY_TREE,
  rootLabel = '법률',
  value,
  onChange,
  placeholder = '카테고리 검색...',
  error,
}: CategoryPickerProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(data[0]?.name ?? '');
  const [openL2, setOpenL2] = useState<string | null>(null);

  const isSearching = query.trim().length > 0;
  const searchResults = useMemo(() => searchCategories(query, data), [query, data]);

  const handleSelect = useCallback(
    (name: string, path: string[]) => {
      if (isSelected(value, path)) {
        onChange(null);
      } else {
        onChange({ name, path });
      }
    },
    [value, onChange],
  );

  const handleTabClick = useCallback(
    (node: CategoryNode) => {
      setActiveTab(node.name);
      setOpenL2(null);
      // 탭 클릭 = 해당 대분류 선택
      handleSelect(node.name, [node.name]);
    },
    [handleSelect],
  );

  const activeNode = data.find((n) => n.name === activeTab);

  // ── Keyboard handler for tabs ──
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = index;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (index + 1) % data.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (index - 1 + data.length) % data.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = data.length - 1;
      } else {
        return;
      }
      handleTabClick(data[nextIndex]);
      const tabList = (e.currentTarget as HTMLElement).parentElement;
      const buttons = tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    },
    [data, handleTabClick],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftAddon={<Search size={16} />}
        rightAddon={
          query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="검색 초기화"
            >
              <X size={14} />
            </button>
          ) : undefined
        }
        className="bg-[#f9fafb]"
      />

      {/* Breadcrumb */}
      {value && (
        <Breadcrumb
          rootLabel={rootLabel}
          path={value.path}
          onClear={() => onChange(null)}
        />
      )}

      {/* Tree / Search results */}
      <div className="border border-[#e0e2e6] rounded-card overflow-hidden">
        {isSearching ? (
          <SearchResults
            results={searchResults}
            value={value}
            onSelect={handleSelect}
            query={query}
          />
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Tabs — 모바일: 가로 스크롤 / 데스크톱: 세로 */}
            <div
              role="tablist"
              aria-label="법률 카테고리"
              aria-orientation="vertical"
              className={cn(
                'flex shrink-0 border-b border-[#e0e2e6]',
                'overflow-x-auto scrollbar-hide',
                'md:flex-col md:w-48 md:border-b-0 md:border-r md:overflow-x-visible md:overflow-y-auto md:max-h-96',
              )}
            >
              {data.map((node, index) => {
                const tabSelected = isSelected(value, [node.name]);
                return (
                  <button
                    key={node.name}
                    type="button"
                    role="tab"
                    id={`cat-tab-${index}`}
                    aria-selected={activeTab === node.name}
                    aria-controls={`cat-panel-${index}`}
                    tabIndex={activeTab === node.name ? 0 : -1}
                    onClick={() => handleTabClick(node)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-sm font-medium text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset',
                      'flex items-center gap-2',
                      activeTab === node.name
                        ? 'text-brand bg-blue-50 border-b-2 border-brand md:border-b-0 md:border-r-2'
                        : 'text-[#575e6b] hover:bg-gray-50 hover:text-[#16181d]',
                    )}
                  >
                    <RadioDot checked={tabSelected} />
                    <span className="truncate">{node.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content panel */}
            <div
              role="tabpanel"
              id={`cat-panel-${data.findIndex((n) => n.name === activeTab)}`}
              aria-labelledby={`cat-tab-${data.findIndex((n) => n.name === activeTab)}`}
              className="flex-1 max-h-80 md:max-h-96 overflow-y-auto"
            >
              {activeNode ? (
                <div>
                  {/* 대분류 전체 선택 안내 */}
                  <div className="px-4 py-2.5 border-b border-[#e0e2e6] bg-gray-50/50">
                    <p className="text-xs text-[#575e6b]">
                      더 구체적인 분야를 선택하거나, 위 탭 선택만으로도 상담을 시작할 수 있습니다.
                    </p>
                  </div>
                  <div className="divide-y divide-[#e0e2e6]">
                    {activeNode.children.map((l2) => (
                      <SubcategoryGroup
                        key={l2.name}
                        node={l2}
                        parentName={activeTab}
                        isOpen={openL2 === l2.name}
                        onToggle={() => setOpenL2(openL2 === l2.name ? null : l2.name)}
                        value={value}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="카테고리를 선택해 주세요." />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 leading-snug" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ── RadioDot ───────────────────────────────────────────────────────────────

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
        checked ? 'border-brand bg-brand' : 'border-[#cdd0d5]',
      )}
    >
      {checked && <Check size={10} className="text-white" />}
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────

function Breadcrumb({
  rootLabel,
  path,
  onClear,
}: {
  rootLabel: string;
  path: string[];
  onClear: () => void;
}) {
  const segments = [rootLabel, ...path];

  return (
    <div className="flex items-center gap-1 px-1 py-2 text-xs flex-wrap">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-[#575e6b] shrink-0" />}
          <span
            className={cn(
              i === segments.length - 1
                ? 'font-semibold text-brand'
                : 'text-[#575e6b]',
            )}
          >
            {seg}
          </span>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="선택 해제"
      >
        <X size={12} className="text-[#575e6b]" />
      </button>
    </div>
  );
}

// ── SubcategoryGroup (중분류) ──────────────────────────────────────────────

function SubcategoryGroup({
  node,
  parentName,
  isOpen,
  onToggle,
  value,
  onSelect,
}: {
  node: CategoryLevel2;
  parentName: string;
  isOpen: boolean;
  onToggle: () => void;
  value: CategorySelection | null;
  onSelect: (name: string, path: string[]) => void;
}) {
  const l2Path = [parentName, node.name];
  const l2Selected = isSelected(value, l2Path);
  const childSelected = value && value.path.length === 3 && value.path[0] === parentName && value.path[1] === node.name;

  return (
    <div>
      <div
        className={cn(
          'flex items-center transition-colors',
          l2Selected
            ? 'bg-brand/5'
            : childSelected
              ? 'bg-blue-50/50'
              : 'hover:bg-gray-50',
        )}
      >
        {/* 중분류 선택 영역 */}
        <button
          type="button"
          onClick={() => onSelect(node.name, l2Path)}
          className={cn(
            'flex-1 flex items-center gap-2 pl-4 py-3 text-left',
            'text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset',
            l2Selected ? 'text-brand' : 'text-[#16181d]',
          )}
          aria-pressed={l2Selected}
        >
          <RadioDot checked={l2Selected} />
          <span>{node.name}</span>
        </button>

        {/* 펼침 토글 버튼 */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${node.name} 하위 항목 ${isOpen ? '접기' : '펼치기'}`}
          className={cn(
            'px-3 py-3 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset',
            'text-[#575e6b] hover:text-[#16181d]',
          )}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {isOpen && (
        <div className="pb-1 border-t border-[#e0e2e6]/50">
          {node.children.map((leaf) => {
            const leafPath = [parentName, node.name, leaf.name];
            return (
              <LeafItem
                key={leaf.name}
                leaf={leaf}
                isSelected={isSelected(value, leafPath)}
                onSelect={() => onSelect(leaf.name, leafPath)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── LeafItem (소분류 선택 항목) ────────────────────────────────────────────

function LeafItem({
  leaf,
  isSelected: selected,
  onSelect,
  breadcrumb,
}: {
  leaf: CategoryLeaf;
  isSelected: boolean;
  onSelect: () => void;
  breadcrumb?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-left',
        'text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset',
        selected
          ? 'text-brand font-medium bg-brand/5'
          : 'text-[#16181d] hover:bg-gray-50',
      )}
      aria-pressed={selected}
    >
      <RadioDot checked={selected} />
      <div className="min-w-0">
        <span className="block">{leaf.name}</span>
        {breadcrumb && (
          <span className="block text-xs text-[#575e6b] truncate mt-0.5">
            {breadcrumb}
          </span>
        )}
      </div>
    </button>
  );
}

// ── SearchResults ──────────────────────────────────────────────────────────

function SearchResults({
  results,
  value,
  onSelect,
  query,
}: {
  results: CategorySearchResult[];
  value: CategorySelection | null;
  onSelect: (name: string, path: string[]) => void;
  query: string;
}) {
  if (results.length === 0) {
    return (
      <EmptyState>
        &ldquo;<span className="font-medium text-[#16181d]">{query}</span>&rdquo;에 대한 검색 결과가 없습니다.
      </EmptyState>
    );
  }

  return (
    <div className="max-h-80 md:max-h-96 overflow-y-auto">
      <p className="px-4 py-2 text-xs text-[#575e6b] border-b border-[#e0e2e6] sticky top-0 bg-white">
        {results.length}건의 결과
      </p>
      {results.map(({ leaf, path }) => (
        <LeafItem
          key={`${path[0]}-${path[1]}-${leaf.name}`}
          leaf={leaf}
          isSelected={isSelected(value, [...path])}
          onSelect={() => onSelect(leaf.name, [...path])}
          breadcrumb={`${path[0]} > ${path[1]}`}
        />
      ))}
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────

function EmptyState({
  message,
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-8 text-center text-sm text-[#575e6b]">
      {children ?? message}
    </div>
  );
}
