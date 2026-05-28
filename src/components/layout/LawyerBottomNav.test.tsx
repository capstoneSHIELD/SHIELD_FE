import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LayoutDashboard, Inbox, Briefcase, User } from 'lucide-react';
import { LawyerBottomNav } from './LawyerBottomNav';

const TABS = [
  { to: '/lawyer',         icon: LayoutDashboard, label: '대시보드' },
  { to: '/lawyer/inbox',   icon: Inbox,           label: '의뢰함'   },
  { to: '/lawyer/cases',   icon: Briefcase,       label: '진행 중'   },
  { to: '/lawyer/profile', icon: User,            label: '프로필'   },
];

function renderNav(initialPath = '/lawyer') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LawyerBottomNav tabs={TABS} />
    </MemoryRouter>,
  );
}

describe('LawyerBottomNav (Phase 5 — layout contract)', () => {
  it('renders all tab labels with a11y label', () => {
    renderNav();
    expect(screen.getByLabelText('변호사 하단 내비게이션')).toBeInTheDocument();
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('의뢰함')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('프로필')).toBeInTheDocument();
  });

  it('hides itself at lg+ (desktop uses SideNav)', () => {
    const { container } = renderNav();
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('lg:hidden');
    expect(nav).toHaveClass('app-bottom-nav');
  });

  it('only marks /lawyer active on exact match, not on nested routes', () => {
    renderNav('/lawyer/inbox');
    const dashboardLink = screen.getByText('대시보드').closest('a');
    const inboxLink = screen.getByText('의뢰함').closest('a');
    expect(dashboardLink).not.toHaveClass('text-brand');
    expect(inboxLink).toHaveClass('text-brand');
  });
});
