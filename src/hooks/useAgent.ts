'use client';

import { useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { generateId } from '@/lib/utils';
import type { AgentChatRequest, EmailPreview } from '@/types/agent';

export function useAgent() {
  const { messages, isStreaming, addMessage, updateLastMessage, updateLastMessagePreviews, setStreaming, clearMessages } =
    useAgentStore();

  const sendMessage = useCallback(
    async (content: string, context?: AgentChatRequest['context']) => {
      // Use getState() to avoid stale closure — always read latest messages
      const currentMessages = useAgentStore.getState().messages;

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
        const allMessages = [...currentMessages, userMessage].map((m) => ({
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
        const collectedEmails: EmailPreview[] = [];

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
                  if (parsed.emailResults && Array.isArray(parsed.emailResults)) {
                    for (const e of parsed.emailResults) {
                      collectedEmails.push({
                        id: e.id,
                        from: e.from ?? '',
                        subject: e.subject ?? '(No Subject)',
                        snippet: e.snippet ?? '',
                        date: e.date ?? '',
                      });
                    }
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        if (collectedEmails.length > 0) {
          updateLastMessagePreviews(collectedEmails);
        }
      } catch (error) {
        updateLastMessage('An error occurred. Please try again.');
        console.error('Agent error:', error);
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, updateLastMessage, updateLastMessagePreviews, setStreaming]
  );

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
  };
}
