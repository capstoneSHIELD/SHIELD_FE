import { createRef } from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChatPage } from './ChatPage';
import { useChat } from '@/hooks/useChat';
import { useConsultationDetail, useRequestAnalyze } from '@/hooks/useConsultation';

vi.mock('@/hooks/useChat', () => ({
  useChat: vi.fn(),
}));

vi.mock('@/hooks/useConsultation', () => ({
  useConsultationDetail: vi.fn(),
  useRequestAnalyze: vi.fn(),
}));

const mockUseChat = vi.mocked(useChat);
const mockUseConsultationDetail = vi.mocked(useConsultationDetail);
const mockUseRequestAnalyze = vi.mocked(useRequestAnalyze);

function renderChatPage() {
  return render(
    <MemoryRouter initialEntries={['/consultations/early-ready']}>
      <Routes>
        <Route path="/consultations/:id" element={<ChatPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockUseConsultationDetail.mockReturnValue({
    data: { status: 'COLLECTING' },
  } as unknown as ReturnType<typeof useConsultationDetail>);
  mockUseRequestAnalyze.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useRequestAnalyze>);
});

describe('ChatPage', () => {
  it('keeps chat input enabled when allCompleted is an early ready option', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      allCompleted: true,
      classification: null,
      progress: {
        currentTurn: 5,
        maxTurns: 10,
        progressPercent: 50,
      },
      checklistLabels: { L1: [], L2: [], L3: [] },
      scrollRef: createRef<HTMLDivElement>(),
      sendMessage: vi.fn(),
    } as ReturnType<typeof useChat>);

    renderChatPage();

    expect(
      screen.getAllByRole('button', { name: /의뢰서 생성/ }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/의뢰서 생성 준비 완료/),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('추가로 답하거나, 위 버튼을 눌러 의뢰서를 생성하세요'),
    ).toBeEnabled();
    expect(
      screen.getByText('더 자세히 알려주실 내용이 있다면 계속 답변하셔도 됩니다.'),
    ).toBeInTheDocument();
  });

  it('locks chat input when the turn limit is reached', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      allCompleted: true,
      classification: null,
      progress: {
        currentTurn: 10,
        maxTurns: 10,
        progressPercent: 100,
      },
      checklistLabels: { L1: [], L2: [], L3: [] },
      scrollRef: createRef<HTMLDivElement>(),
      sendMessage: vi.fn(),
    } as ReturnType<typeof useChat>);

    renderChatPage();

    expect(screen.getByText('정보 수집 완료 — 의뢰서를 생성해주세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('상담이 완료되었습니다')).toBeDisabled();
    expect(
      screen.queryByText('더 자세히 알려주실 내용이 있다면 계속 답변하셔도 됩니다.'),
    ).not.toBeInTheDocument();
  });
});
