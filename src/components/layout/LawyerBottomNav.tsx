import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface LawyerTabItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface LawyerBottomNavProps {
  tabs: LawyerTabItem[];
  className?: string;
}

export function LawyerBottomNav({ tabs, className }: LawyerBottomNavProps) {
  return (
    <nav
      className={cn(
        'app-bottom-nav px-3 pt-2 sm:px-4 lg:hidden',
        className,
      )}
      aria-label="변호사 하단 내비게이션"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around rounded-[22px] border border-gray-100 bg-white shadow-[0_-6px_18px_rgba(31,140,249,0.08)]">
        {tabs.map(({ to, icon: Icon, label }) => {
          const hasNestedSibling = tabs.some(
            (tab) => tab.to !== to && tab.to.startsWith(to + '/'),
          );
          const isExactMatch = to === '/' || hasNestedSibling;

          return (
            <NavLink
              key={to}
              to={to}
              end={isExactMatch}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[56px] flex-col items-center justify-center gap-0.5 px-2 py-1',
                  'text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
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
      </div>
    </nav>
  );
}
