import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PageHeader } from './PageHeader';

function renderHeader(ui: React.ReactNode, initialPath = '/some-page') {
  return render(
    <MemoryRouter initialEntries={['/prev', initialPath]} initialIndex={1}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PageHeader (Phase 5 — layout contract)', () => {
  it('renders title and back button by default', () => {
    renderHeader(<PageHeader title="의뢰서" />);
    expect(screen.getByText('의뢰서')).toBeInTheDocument();
    expect(screen.getByLabelText('뒤로 가기')).toBeInTheDocument();
  });

  it('omits back button when hideBack is true', () => {
    renderHeader(<PageHeader title="홈" hideBack />);
    expect(screen.queryByLabelText('뒤로 가기')).not.toBeInTheDocument();
  });

  it('calls custom onBack handler when provided', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderHeader(<PageHeader title="상담" onBack={onBack} />);

    await user.click(screen.getByLabelText('뒤로 가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders wordmark variant with SHIELD logo and brand color, ignoring title', () => {
    renderHeader(<PageHeader title="ignored" logoVariant="wordmark" />);
    expect(screen.getByText('SHIELD')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('uses sticky positioning + mobile header height token', () => {
    const { container } = renderHeader(<PageHeader title="t" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
    expect(header?.className).toContain('var(--app-mobile-header-height)');
  });

  it('renders rightSlot in absolute right area', () => {
    renderHeader(
      <PageHeader title="t" rightSlot={<button type="button">action</button>} />,
    );
    expect(screen.getByText('action')).toBeInTheDocument();
  });
});
