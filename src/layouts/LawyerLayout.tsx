import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Inbox, Briefcase, User } from 'lucide-react';
import { LawyerBottomNav } from '@/components/layout/LawyerBottomNav';
import { SideNav } from '@/components/layout/SideNav';

const LAWYER_TABS = [
  { to: '/lawyer',         icon: LayoutDashboard, label: '대시보드' },
  { to: '/lawyer/inbox',   icon: Inbox,           label: '의뢰함'   },
  { to: '/lawyer/cases',   icon: Briefcase,       label: '진행 중'   },
  { to: '/lawyer/profile', icon: User,            label: '프로필'   },
] as const;

export function LawyerLayout() {
  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <SideNav tabs={[...LAWYER_TABS]} />

      {/* Page content */}
      <main className="app-scroll-main app-sidebar-offset app-bottom-nav-offset">
        <div className="app-content-frame">
          <Outlet />
        </div>
      </main>

      {/* Mobile / tablet bottom nav */}
      <LawyerBottomNav tabs={[...LAWYER_TABS]} />
    </div>
  );
}
