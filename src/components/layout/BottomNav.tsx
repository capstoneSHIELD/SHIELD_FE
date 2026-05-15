import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TabItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface BottomNavProps {
  tabs: TabItem[];
  className?: string;
}

export function BottomNav({ tabs, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'h-16 bg-white border-t border-gray-200',
        'flex justify-around items-center',
        'safe-area-bottom',
        'lg:hidden',
        className,
      )}
    >
      {tabs.map(({ to, icon: Icon, label }) => {
        // 다른 tab 이 `to + '/'` 로 시작하면 본 tab 은 그 그룹의 루트.
        // 루트 NavLink 는 end:true 필요 — 그렇지 않으면 자식 라우트에서도 항상 활성 표시.
        const hasNestedSibling = tabs.some(
          (t) => t.to !== to && t.to.startsWith(to + '/'),
        );
        const isExactMatch = to === '/' || hasNestedSibling;
        return (
        <NavLink
          key={to}
          to={to}
          end={isExactMatch}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5',
              'min-w-[56px] px-2 py-1 text-xs font-medium transition-colors',
              isActive ? 'text-brand' : 'text-gray-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.75}
                aria-hidden="true"
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
        );
      })}
    </nav>
  );
}
