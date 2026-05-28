import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useChat } from './useChat';
import { useChatStore } from '@/stores/chatStore';
import { server } from '@/test/mocks/server';

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
        {children}
      </QueryClientProvider>
    );
  };
}

afterEach(() => {
  useChatStore.getState().reset();
});

describe('useChat checklist response handling', () => {
  it('stores level labels and adds a separate checklist chatbot bubble', async () => {
    const { result } = renderHook(
      () => useChat('660e8400-e29b-41d4-a716-446655440001'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.sendMessage('보증금을 아직 돌려받지 못했어요.');
    });

    await waitFor(() =>
      expect(
        result.current.messages.some(
          (message) =>
            message.messageId ===
            'bb0e8400-e29b-41d4-a716-446655440006-checklist',
        ),
      ).toBe(true),
    );

    expect(result.current.checklistLabels).toEqual({
      L1: ['당사자 정보', '사건 발생 시기'],
      L2: ['임대차 계약 기간'],
      L3: ['보증금 액수', '반환 요청 여부 및 시점'],
    });

    const checklistMessage = result.current.messages.find(
      (message) =>
        message.messageId ===
        'bb0e8400-e29b-41d4-a716-446655440006-checklist',
    );
    expect(checklistMessage).toMatchObject({
      role: 'CHATBOT',
      content:
        '필요한 내용은 다음과 같습니다.\n당사자 정보,\n사건 발생 시기,\n임대차 계약 기간,\n보증금 액수,\n반환 요청 여부 및 시점',
    });

    expect(
      result.current.messages.some(
        (message) =>
          message.messageId === 'bb0e8400-e29b-41d4-a716-446655440006',
      ),
    ).toBe(true);
  });

  it('does not add a checklist bubble when checklist items are empty', async () => {
    server.use(
      http.post('*/api/consultations/:id/messages', () =>
        HttpResponse.json(
          {
            result: true,
            message: '전송 완료',
            data: {
              messageId: 'empty-checklist-ai',
              role: 'AI',
              content: '개인정보는 제외하고 사건 내용을 다시 적어주세요.',
              createdAt: '2026-05-29T03:17:00',
              allCompleted: false,
              classification: null,
              checklist: { items: [] },
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

    const { result } = renderHook(() => useChat('empty-checklist'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.sendMessage('홍길동의 주민번호는 123456입니다.');
    });

    await waitFor(() =>
      expect(
        result.current.messages.some(
          (message) => message.messageId === 'empty-checklist-ai',
        ),
      ).toBe(true),
    );

    expect(result.current.checklistLabels).toEqual({
      L1: [],
      L2: [],
      L3: [],
    });
    expect(
      result.current.messages.some(
        (message) => message.messageId === 'empty-checklist-ai-checklist',
      ),
    ).toBe(false);
  });
});
