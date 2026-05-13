import { create } from 'zustand';
import type { MessageResponse, ConsultationProgress } from '@/types';

interface ChatState {
  messages: MessageResponse[];
  isSending: boolean;
  allCompleted: boolean;
  classification: { primaryField: string[]; tags: string[] } | null;
  progress: ConsultationProgress | null;

  setMessages: (messages: MessageResponse[]) => void;
  addMessage: (message: MessageResponse) => void;
  setIsSending: (sending: boolean) => void;
  setAllCompleted: (completed: boolean) => void;
  setClassification: (c: { primaryField: string[]; tags: string[] } | null) => void;
  setProgress: (progress: ConsultationProgress | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isSending: false,
  allCompleted: false,
  classification: null,
  progress: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setIsSending: (isSending) => set({ isSending }),
  setAllCompleted: (allCompleted) => set({ allCompleted }),
  setClassification: (classification) => set({ classification }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      messages: [],
      isSending: false,
      allCompleted: false,
      classification: null,
      progress: null,
    }),
}));
