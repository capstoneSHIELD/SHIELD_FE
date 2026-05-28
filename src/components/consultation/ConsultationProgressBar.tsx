import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { ConsultationProgress } from '@/types';

interface ConsultationProgressBarProps {
  /** BE 응답의 progress 객체. null/undefined 면 0% 빈 상태로 표시 */
  progress?: ConsultationProgress | null;
  /** allCompleted 신호. 조기 완료면 CTA 옵션 안내, 턴 상한이면 완료 안내로 표시 */
  completed?: boolean;
  className?: string;
}

/**
 * 상담 진행률 표시 바. ChatPage 상단 sticky 헤더에서 사용.
 *
 * - `progressPercent` 는 BE 가 계산한 값을 그대로 사용 (재계산 X)
 * - `width` style 에만 0~100 safe-clamp 적용
 * - `maxTurns` 는 BE 응답값 그대로 사용 — 하드코딩 X (향후 BE 가 12/15 등으로 변경 가능)
 * - allCompleted 조기 신호와 100% 도달 강제 종료를 라벨로 구분
 */
export function ConsultationProgressBar({
  progress,
  completed = false,
  className,
}: ConsultationProgressBarProps) {
  const { currentTurn, maxTurns, percent } = useMemo(() => {
    if (!progress) return { currentTurn: 0, maxTurns: 10, percent: 0 };
    return {
      currentTurn: progress.currentTurn,
      maxTurns: progress.maxTurns,
      percent: Math.min(100, Math.max(0, progress.progressPercent)),
    };
  }, [progress]);

  const isTurnLimitReached = progress ? progress.currentTurn >= progress.maxTurns : false;
  const isEarlyReady = completed && !isTurnLimitReached;
  const isCompleted = completed || isTurnLimitReached;

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 px-4 py-3',
        'bg-white border-b border-gray-100',
        className,
      )}
    >
      {/* Label row */}
      <div className="flex items-center justify-between text-xs">
        {isCompleted ? (
          isEarlyReady ? (
            <span className="font-semibold text-emerald-600">
              의뢰서 생성 준비 완료 — 더 답하거나 바로 생성할 수 있어요
              <span className="ml-2 font-mono text-gray-400">
                ({currentTurn} / {maxTurns})
              </span>
            </span>
          ) : (
            <span className="font-semibold text-emerald-600">
              정보 수집 완료 — 의뢰서를 생성해주세요
            </span>
          )
        ) : (
          <>
            <span className="font-medium text-gray-700">상담 진행률</span>
            <span className="font-mono text-gray-500">
              {currentTurn} / {maxTurns} 단계 ({percent}%)
            </span>
          </>
        )}
      </div>

      {/* Track */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          isEarlyReady
            ? `의뢰서 생성 준비 완료: 상담 진행률 ${percent}% (${currentTurn} / ${maxTurns} 단계)`
            : isCompleted
            ? '상담 진행률 100% 완료'
            : `상담 진행률 ${percent}% (${currentTurn} / ${maxTurns} 단계)`
        }
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            isEarlyReady
              ? 'bg-emerald-500'
              : isCompleted
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-gradient-to-r from-brand to-brand/60',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
