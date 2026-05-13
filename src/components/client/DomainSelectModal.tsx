import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { NEW_DOMAIN_META_LIST } from '@/lib/domainIcons';

interface DomainSelectModalProps {
  /** 현재 선택된 분야 ID (한글 분류명) — 모달 열릴 때 기본 선택 표시 */
  current?: string | null;
  /** 사용자가 분야를 선택하고 확인 누르면 호출. id = 한글 분류명 */
  onConfirm: (domainId: string) => void;
  onClose: () => void;
}

/**
 * 8개 대분류 분야 선택 모달. AnalyzingPage 의 "다른 분야 선택" 흐름에 사용.
 *
 * `domainIcons.NEW_DOMAIN_META_LIST` 를 source of truth 로 사용하여
 * 분야 추가·변경 시 한 곳만 수정하면 모든 화면에 반영됨.
 */
export function DomainSelectModal({ current, onConfirm, onClose }: DomainSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(current ?? null);

  function handleConfirm() {
    if (selectedId) onConfirm(selectedId);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="domain-select-title"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl',
          'flex flex-col max-h-[85vh]',
          'animate-in slide-in-from-bottom duration-200',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 id="domain-select-title" className="text-base font-semibold text-gray-900">
            법률 분야 선택
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <p className="px-5 pt-3 pb-1 text-xs text-gray-500">
          가장 가까운 법률 분야를 직접 선택하세요. 선택한 분야로 의뢰서가 생성됩니다.
        </p>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="grid grid-cols-1 gap-2" role="list">
            {NEW_DOMAIN_META_LIST.map((meta) => {
              const isSelected = selectedId === meta.id;
              return (
                <li key={meta.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(meta.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-3 rounded-xl text-left',
                      'border transition-colors',
                      isSelected
                        ? 'border-brand bg-blue-50/60'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
                        meta.bgColor,
                      )}
                    >
                      <meta.Icon size={20} strokeWidth={1.75} className={meta.color} aria-hidden="true" />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium flex-1',
                        isSelected ? 'text-brand' : 'text-gray-900',
                      )}
                    >
                      {meta.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            이 분야로 진행
          </Button>
        </div>
      </div>
    </div>
  );
}
