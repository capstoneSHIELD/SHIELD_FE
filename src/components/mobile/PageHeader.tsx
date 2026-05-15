import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title?: string;
  onBack?: () => void;
  hideBack?: boolean;
  rightSlot?: ReactNode;
  className?: string;
}

export function PageHeader({ title, onBack, hideBack, rightSlot, className }: PageHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-[68px] w-full items-center justify-center border-b border-[#e0e2e6] bg-white px-2',
        className,
      )}
    >
      {!hideBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className={cn(
            'absolute left-2 flex h-10 w-10 items-center justify-center rounded-full',
            'text-[#16181d] transition-colors hover:bg-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          )}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {title && (
        <h1 className="text-base font-semibold leading-7 text-[#16181d]">{title}</h1>
      )}

      {rightSlot && <div className="absolute right-2 flex items-center gap-1">{rightSlot}</div>}
    </header>
  );
}
