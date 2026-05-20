import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, Sparkles, UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';
import { hasCandidateValues } from '@/lib/classification';
import { Button, Modal } from '@/components/ui';
import type {
  ClassificationCandidate,
  ClassificationResolution,
} from '@/types/consultation';

type Choice = 'user' | 'ai';

interface ClassificationConflictModalProps {
  isOpen: boolean;
  conflict: ClassificationResolution | null;
  isSubmitting?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (candidate: ClassificationCandidate, choice: Choice) => void;
}

export function ClassificationConflictModal({
  isOpen,
  conflict,
  isSubmitting = false,
  error,
  onCancel,
  onConfirm,
}: ClassificationConflictModalProps) {
  const [selected, setSelected] = useState<Choice>('ai');

  useEffect(() => {
    if (!isOpen) return;
    setSelected(conflict?.aiCandidate ? 'ai' : 'user');
  }, [conflict?.aiCandidate, isOpen]);

  const selectedCandidate = useMemo(() => {
    if (selected === 'ai') return conflict?.aiCandidate ?? null;
    return conflict?.userCandidate ?? null;
  }, [conflict, selected]);

  const canSubmit = hasCandidateValues(selectedCandidate);

  const handleConfirm = () => {
    if (!selectedCandidate || !canSubmit) return;
    onConfirm(selectedCandidate, selected);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onCancel();
      }}
      title="법률 분야를 확인해 주세요"
      disableBackdropClose
      className="max-w-[360px]"
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-text-soft">
          대화 내용을 분석한 결과, 처음 선택한 분야와 AI가 판단한 분야가
          다릅니다. 계속 진행할 분야를 선택해 주세요.
        </p>

        <div className="grid gap-3">
          <CandidateCard
            title="처음 선택한 분야"
            icon={<UserRound size={17} />}
            candidate={conflict?.userCandidate ?? null}
            selected={selected === 'user'}
            onSelect={() => setSelected('user')}
          />
          <CandidateCard
            title="AI가 판단한 분야"
            icon={<Sparkles size={17} />}
            candidate={conflict?.aiCandidate ?? null}
            selected={selected === 'ai'}
            recommended
            onSelect={() => setSelected('ai')}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            disabled={isSubmitting}
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            선택 완료
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface CandidateCardProps {
  title: string;
  icon: ReactNode;
  candidate: ClassificationCandidate | null;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}

function CandidateCard({
  title,
  icon,
  candidate,
  selected,
  recommended = false,
  onSelect,
}: CandidateCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border bg-white p-4 text-left transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        selected
          ? 'border-brand shadow-[0_0_0_1px_rgba(37,140,244,0.22)]'
          : 'border-border hover:border-brand/40 hover:bg-gray-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg',
              selected ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-text-soft',
            )}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-5 text-text">{title}</p>
            {recommended && (
              <span className="mt-1 inline-flex rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold leading-4 text-brand">
                권장
              </span>
            )}
          </div>
        </div>

        <span
          className={cn(
            'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-brand bg-brand text-white' : 'border-gray-300',
          )}
        >
          {selected && <Check size={13} strokeWidth={3} />}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <CandidateLevel label="분야" items={candidate?.domains ?? []} />
        <CandidateLevel label="세부 분야" items={candidate?.subDomains ?? []} />
        <CandidateLevel label="태그" items={candidate?.tags ?? []} chip />
      </div>
    </button>
  );
}

function CandidateLevel({
  label,
  items,
  chip = false,
}: {
  label: string;
  items: string[];
  chip?: boolean;
}) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-2">
      <span className="text-[11px] font-semibold leading-6 text-text-soft">
        {label}
      </span>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={`${label}-${item}`}
              className={cn(
                'min-w-0 break-words rounded-md px-2 py-1 text-xs leading-4',
                chip
                  ? 'bg-gray-100 font-medium text-text'
                  : 'bg-brand/5 font-semibold text-text',
              )}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs leading-6 text-gray-400">선택 없음</span>
      )}
    </div>
  );
}
