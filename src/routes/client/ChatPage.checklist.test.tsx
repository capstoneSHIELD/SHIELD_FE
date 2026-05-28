import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ChatPage } from './ChatPage';
import { server } from '@/test/mocks/server';
import { useChatStore } from '@/stores/chatStore';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/consultations/checklist-visible']}>
          <Routes>
            <Route path="/consultations/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('ChatPage checklist bubble', () => {
  afterEach(() => {
    useChatStore.getState().reset();
  });

  it('renders a separate chatbot bubble with checklist labels after sending', async () => {
    server.use(
      http.post('*/api/consultations/:id/messages', () =>
        HttpResponse.json(
          {
            result: true,
            message: '전송 완료',
            data: {
              messageId: 'visible-checklist-ai',
              role: 'AI',
              content: '보증금 액수와 반환 요청 시점을 알려주실 수 있을까요?',
              createdAt: '2026-05-29T03:17:00',
              allCompleted: false,
              classification: null,
              checklist: {
                items: [
                  { level: 'L1', label: '당사자 정보' },
                  { level: 'L1', label: '사건 발생 시기' },
                  { level: 'L2', label: '임대차 계약 기간' },
                  { level: 'L3', label: '보증금 액수' },
                  { level: 'L3', label: '반환 요청 여부 및 시점' },
                ],
              },
              progress: {
                currentTurn: 1,
                maxTurns: 10,
                progressPercent: 10,
              },
            },
          },
          { status: 202 },
        ),
      ),
    );

    const Wrapper = createWrapper();
    render(<ChatPage />, { wrapper: Wrapper });

    const input = await screen.findByRole('textbox');

    await userEvent.type(input, '보증금을 아직 돌려받지 못했어요.{enter}');

    expect(
      await screen.findByText(/필요한 내용은 다음과 같습니다/),
    ).toBeInTheDocument();
    expect(screen.getByText(/당사자 정보,/)).toBeInTheDocument();
    expect(screen.getByText(/반환 요청 여부 및 시점/)).toBeInTheDocument();

    await waitFor(() =>
      expect(useChatStore.getState().checklistLabels).toEqual({
        L1: ['당사자 정보', '사건 발생 시기'],
        L2: ['임대차 계약 기간'],
        L3: ['보증금 액수', '반환 요청 여부 및 시점'],
      }),
    );
  });
});
