import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgentMessage, EmailPreview } from '@/types/agent';

interface AgentStore {
  messages: AgentMessage[];
  isStreaming: boolean;
  addMessage: (message: AgentMessage) => void;
  updateLastMessage: (content: string) => void;
  updateLastMessagePreviews: (previews: EmailPreview[]) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateLastMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const last = messages[messages.length - 1];
          if (last && last.role === 'assistant') {
            messages[messages.length - 1] = { ...last, content, isStreaming: false };
          }
          return { messages };
        }),
      updateLastMessagePreviews: (previews) =>
        set((state) => {
          const messages = [...state.messages];
          const last = messages[messages.length - 1];
          if (last && last.role === 'assistant') {
            messages[messages.length - 1] = { ...last, emailPreviews: previews };
          }
          return { messages };
        }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'agent-chat-history',
      partialize: (state) => ({ messages: state.messages.slice(-100) }),
    }
  )
);
