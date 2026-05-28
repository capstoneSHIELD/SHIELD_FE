import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DELIVERY_STATUS_LABEL } from '@/lib/constants';
import { getDomainMeta } from '@/lib/domainIcons';

interface LawyerHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
}

export function LawyerHeader({
  title,
  showBack = false,
  onBack,
  rightAction,
  className,
}: LawyerHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-[#e0e2e6] bg-white safe-area-top',
        className,
      )}
    >
      <div className="flex h-[var(--app-header-height)] items-center px-4">
        <div className="flex w-10 shrink-0 items-center">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로 가기"
              className="flex h-11 w-11 -ml-2 items-center justify-center rounded-lg text-[#111827] transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <ArrowLeft size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : (
            <img src="/logo.png" alt="SHIELD" className="h-5 w-5 object-contain" />
          )}
        </div>

        <h1 className="min-w-0 flex-1 truncate px-2 text-center text-base font-semibold text-[#111827]">
          {title}
        </h1>

        <div className="flex w-10 shrink-0 items-center justify-end">{rightAction}</div>
      </div>
    </header>
  );
}

export function LawyerPage({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn('flex min-h-full flex-1 flex-col bg-surface', className)}
    >
      {children}
    </div>
  );
}

export function LawyerCard({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-card border border-gray-100 bg-white shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LawyerDomainPill({ legalField }: { legalField?: string | null }) {
  const meta = getDomainMeta(legalField);
  const Icon = meta.Icon;

  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full bg-info-bg px-2.5 py-[3px] text-[11px] font-medium text-brand">
      <Icon size={11} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 truncate">{meta.label}</span>
    </span>
  );
}

export function LawyerStatusPill({ status }: { status?: string | null }) {
  const normalized = status ?? '';
  const style =
    normalized === 'CONFIRMED'
      ? 'bg-green-50 text-green-700'
      : normalized === 'REJECTED'
      ? 'bg-red-50 text-red-600'
      : normalized === 'DELIVERED'
      ? 'bg-info-bg text-brand'
      : 'bg-gray-100 text-gray-500';

  return (
    <span className={cn('inline-flex max-w-full min-w-0 items-center rounded-full px-2.5 py-[3px] text-[11px] font-medium', style)}>
      <span className="min-w-0 truncate">{DELIVERY_STATUS_LABEL[normalized] ?? normalized}</span>
    </span>
  );
}

export function LawyerEmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <LawyerCard className={cn('flex min-h-48 flex-col items-center justify-center px-4 py-12 text-center', className)}>
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-info-bg/70">
        <FileText size={32} strokeWidth={1.6} className="text-brand/30" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-[#111827]">{title}</p>
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </LawyerCard>
  );
}

export function LawyerErrorState({
  title = '정보를 불러오지 못했습니다',
  description = '잠시 후 다시 시도해주세요.',
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <LawyerCard className={cn('flex min-h-48 flex-col items-center justify-center px-4 py-12 text-center', className)}>
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={32} strokeWidth={1.6} className="text-red-400" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-[#111827]">{title}</p>
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </LawyerCard>
  );
}

interface LawyerIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function LawyerOutlineButton({
  children,
  className,
  ...rest
}: LawyerIconButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-card border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-[#111827]',
        'transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        className,
      )}
    >
      {children}
    </button>
  );
}
