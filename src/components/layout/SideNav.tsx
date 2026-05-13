import { Link, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/authStore';

export interface TabItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface SideNavProps {
  tabs: TabItem[];
  className?: string;
}

export function SideNav({ tabs, className }: SideNavProps) {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const displayName = user?.name?.trim() || '사용자';

  // role 별 프로필 라우트 분기 — 라우트 정의(App.tsx) 와 일치해야 함
  const profilePath =
    role === 'LAWYER'
      ? '/lawyer/profile'
      : role === 'ADMIN'
        ? '/admin/profile'
        : '/profile';

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col',
        'fixed left-0 top-0 bottom-0 z-40',
        'w-60 bg-white border-r border-gray-200',
        className,
      )}
    >
      {/* Logo — click to home */}
      <Link
        to="/"
        aria-label="홈으로 이동"
        className={cn(
          'flex items-center gap-2.5 px-5 py-5 border-b border-gray-100',
          'hover:bg-gray-50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50',
        )}
      >
        <img src="/logo.png" alt="SHIELD" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold tracking-tight text-gray-900">
          SHIELD
        </span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <ul className="flex flex-col gap-0.5" role="list">
          {tabs.map(({ to, icon: Icon, label }) => {
            // 다른 tab 이 `to + '/'` 로 시작하면 본 tab 은 그 그룹의 루트.
            // 루트 NavLink 는 end:true 가 필요 — 그렇지 않으면 자식 라우트에서도
            // 항상 활성 상태로 표시됨 (예: /lawyer 가 /lawyer/inbox 에서도 active).
            const hasNestedSibling = tabs.some(
              (t) => t.to !== to && t.to.startsWith(to + '/'),
            );
            const isExactMatch = to === '/' || hasNestedSibling;
            return (
            <li key={to}>
              <NavLink
                to={to}
                end={isExactMatch}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg',
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-brand'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 1.75}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile — role 별 라우트로 분기 */}
      <Link
        to={profilePath}
        aria-label="내 프로필 보기"
        className={cn(
          'border-t border-gray-100 px-4 py-4',
          'hover:bg-gray-50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50',
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full overflow-hidden">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} className="text-gray-500" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">프로필 보기</p>
          </div>
        </div>
      </Link>
    </aside>
  );
}
