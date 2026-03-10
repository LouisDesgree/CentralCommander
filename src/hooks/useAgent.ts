'use client';

import { useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { generateId } from '@/lib/utils';
import type { AgentChatRequest } from '@/types/agent';

export function useAgent() {
  const { messages, isStreaming, addMessage, updateLastMessage, setStreaming, clearMessages } =
    useAgentStore();

  const sendMessage = useCallback(
    async (content: string, context?: AgentChatRequest['context']) => {
      const userMessage = {
        id: generateId(),
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      const assistantMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };
      addMessage(assistantMessage);
      setStreaming(true);

      try {
        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages, context }),
        });

        if (!response.ok) throw new Error('Agent request failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    accumulated += parsed.content;
                    updateLastMessage(accumulated);
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } catch (error) {
        updateLastMessage('An error occurred. Please try again.');
        console.error('Agent error:', error);
      } finally {
        setStreaming(false);
      }
    },
    [messages, addMessage, updateLastMessage, setStreaming]
  );

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
  };
}
