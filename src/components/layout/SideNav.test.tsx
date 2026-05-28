import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home, MessageSquare, FileText, User } from 'lucide-react';
import { SideNav } from './SideNav';
import { useAuthStore } from '@/stores/authStore';

const TABS = [
  { to: '/home',          icon: Home,          label: '홈'    },
  { to: '/consultations', icon: MessageSquare, label: '상담'  },
  { to: '/briefs',        icon: FileText,      label: '의뢰서' },
  { to: '/profile',       icon: User,          label: '프로필' },
];

function renderSideNav(initialPath = '/home') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SideNav tabs={TABS} />
    </MemoryRouter>,
  );
}

describe('SideNav (Phase 5 — layout contract)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { userId: 'u1', email: 'u@e.com', name: '홍길동', role: 'USER' },
      role: 'USER',
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'mock',
    });
  });

  it('renders SHIELD wordmark + all tab labels', () => {
    renderSideNav();
    expect(screen.getByText('SHIELD')).toBeInTheDocument();
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('상담')).toBeInTheDocument();
    expect(screen.getByText('의뢰서')).toBeInTheDocument();
    expect(screen.getByText('프로필')).toBeInTheDocument();
  });

  it('is hidden below lg and uses fixed positioning at lg+', () => {
    const { container } = renderSideNav();
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('hidden');
    expect(aside).toHaveClass('lg:flex');
    expect(aside).toHaveClass('fixed');
  });

  it('routes the profile link to /lawyer/profile when role is LAWYER', () => {
    useAuthStore.setState({
      user: { userId: 'u2', email: 'l@e.com', name: '김변호사', role: 'LAWYER' },
      role: 'LAWYER',
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'mock',
    });
    renderSideNav();
    const profileBlock = screen.getByLabelText('내 프로필 보기');
    expect(profileBlock.getAttribute('href')).toBe('/lawyer/profile');
  });

  it('routes the profile link to /admin/profile when role is ADMIN', () => {
    useAuthStore.setState({
      user: { userId: 'u3', email: 'a@e.com', name: '관리자', role: 'ADMIN' },
      role: 'ADMIN',
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'mock',
    });
    renderSideNav();
    const profileBlock = screen.getByLabelText('내 프로필 보기');
    expect(profileBlock.getAttribute('href')).toBe('/admin/profile');
  });

  it('shows fallback "사용자" when user name is missing', () => {
    useAuthStore.setState({
      user: { userId: 'u4', email: 'x@e.com', name: '   ', role: 'USER' },
      role: 'USER',
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'mock',
    });
    renderSideNav();
    expect(screen.getByText('사용자')).toBeInTheDocument();
  });
});
