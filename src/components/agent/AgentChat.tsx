'use client';

import { useRef, useEffect } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { AgentMessage } from './AgentMessage';
import { AgentInput } from './AgentInput';
import { AgentTypingIndicator } from './AgentTypingIndicator';
import { AgentSuggestionChips } from './AgentSuggestionChips';
import { Bot } from 'lucide-react';

export function AgentChat() {
  const { messages, isStreaming, sendMessage } = useAgent();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Bot className="w-10 h-10 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
            <p className="text-sm text-gray-400 text-center max-w-[280px]">
              I can help you manage your emails, draft replies, and more.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <AgentMessage key={msg.id} message={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <AgentTypingIndicator />
        )}
      </div>

      {messages.length === 0 && (
        <AgentSuggestionChips onSelect={sendMessage} />
      )}

      <AgentInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
