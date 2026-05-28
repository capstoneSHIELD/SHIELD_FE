import { Outlet } from 'react-router-dom';
import { Home, MessageSquare, FileText, User } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { SideNav } from '@/components/layout/SideNav';

const CLIENT_TABS = [
  { to: '/home',          icon: Home,          label: '홈'    },
  { to: '/consultations', icon: MessageSquare,  label: '상담'  },
  { to: '/briefs',        icon: FileText,       label: '의뢰서' },
  { to: '/profile',       icon: User,           label: '프로필' },
] as const;

export function ClientLayout() {
  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <SideNav tabs={[...CLIENT_TABS]} />

      {/* Page content */}
      <main className="app-scroll-main app-sidebar-offset app-bottom-nav-offset">
        <div className="app-content-frame">
          <Outlet />
        </div>
      </main>

      {/* Mobile / tablet bottom nav */}
      <BottomNav tabs={[...CLIENT_TABS]} />
    </div>
  );
}
