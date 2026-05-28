import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home, MessageSquare, FileText, User } from 'lucide-react';
import { BottomNav } from './BottomNav';

const TABS = [
  { to: '/home',          icon: Home,          label: '홈'    },
  { to: '/consultations', icon: MessageSquare, label: '상담'  },
  { to: '/briefs',        icon: FileText,      label: '의뢰서' },
  { to: '/profile',       icon: User,          label: '프로필' },
];

function renderNav(initialPath = '/home') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav tabs={TABS} />
    </MemoryRouter>,
  );
}

describe('BottomNav (Phase 5 — layout contract)', () => {
  it('renders all tab labels', () => {
    renderNav();
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('상담')).toBeInTheDocument();
    expect(screen.getByText('의뢰서')).toBeInTheDocument();
    expect(screen.getByText('프로필')).toBeInTheDocument();
  });

  it('uses the app-bottom-nav layout class for safe-area + fixed positioning', () => {
    const { container } = renderNav();
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('app-bottom-nav');
  });

  it('hides itself at lg breakpoint (desktop uses SideNav instead)', () => {
    const { container } = renderNav();
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('lg:hidden');
  });

  it('marks the active tab via NavLink', () => {
    renderNav('/home');
    const activeLink = screen.getByText('홈').closest('a');
    expect(activeLink).toHaveClass('text-brand');
  });

  it('marks /consultations/new as active for the /consultations tab', () => {
    renderNav('/consultations/new');
    const consultationsLink = screen.getByText('상담').closest('a');
    expect(consultationsLink).toHaveClass('text-brand');
  });
});
