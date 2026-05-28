import { create } from 'zustand';
import type {
  MessageResponse,
  ConsultationProgress,
  ChecklistLabels,
} from '@/types';

const createEmptyChecklistLabels = (): ChecklistLabels => ({
  L1: [],
  L2: [],
  L3: [],
});

interface ChatState {
  messages: MessageResponse[];
  isSending: boolean;
  allCompleted: boolean;
  classification: { primaryField: string[]; tags: string[] } | null;
  progress: ConsultationProgress | null;
  checklistLabels: ChecklistLabels;

  setMessages: (messages: MessageResponse[]) => void;
  addMessage: (message: MessageResponse) => void;
  setIsSending: (sending: boolean) => void;
  setAllCompleted: (completed: boolean) => void;
  setClassification: (c: { primaryField: string[]; tags: string[] } | null) => void;
  setProgress: (progress: ConsultationProgress | null) => void;
  setChecklistLabels: (labels: ChecklistLabels) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isSending: false,
  allCompleted: false,
  classification: null,
  progress: null,
  checklistLabels: createEmptyChecklistLabels(),

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setIsSending: (isSending) => set({ isSending }),
  setAllCompleted: (allCompleted) => set({ allCompleted }),
  setClassification: (classification) => set({ classification }),
  setProgress: (progress) => set({ progress }),
  setChecklistLabels: (checklistLabels) => set({ checklistLabels }),
  reset: () =>
    set({
      messages: [],
      isSending: false,
      allCompleted: false,
      classification: null,
      progress: null,
      checklistLabels: createEmptyChecklistLabels(),
    }),
}));
