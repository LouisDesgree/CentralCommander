'use client';

import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Bot } from 'lucide-react';
import type { AgentMessage as AgentMessageType } from '@/types/agent';

interface AgentMessageProps {
  message: AgentMessageType;
}

export function AgentMessage({ message }: AgentMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 px-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {isUser ? (
        <Avatar name="You" size="sm" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-purple-500" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-500/80 text-white rounded-2xl rounded-br-md'
            : 'bg-white/40 dark:bg-white/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-2xl rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
