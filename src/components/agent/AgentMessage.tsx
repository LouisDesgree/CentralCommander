'use client';

import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Bot, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AgentMessage as AgentMessageType } from '@/types/agent';

function renderMarkdown(text: string) {
  // Split by lines, render bold/italic inline
  return text.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let last = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index));
      if (match[1] !== undefined) parts.push(<strong key={key++}>{match[1]}</strong>);
      else if (match[2] !== undefined) parts.push(<em key={key++}>{match[2]}</em>);
      last = match.index + match[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>;
  });
}

interface AgentMessageProps {
  message: AgentMessageType;
}

export function AgentMessage({ message }: AgentMessageProps) {
  const isUser = message.role === 'user';
  const router = useRouter();
  const previews = message.emailPreviews ?? [];

  return (
    <div className={cn('flex gap-3 px-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {isUser ? (
        <Avatar name="You" size="sm" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-purple-500" />
        </div>
      )}
      <div className={cn('flex flex-col gap-3', isUser ? 'items-end max-w-[80%]' : 'flex-1 min-w-0')}>
        {message.content && (
          <div
            className={cn(
              'px-4 py-3 text-sm leading-relaxed',
              isUser
                ? 'bg-blue-500/80 text-white rounded-2xl rounded-br-md'
                : 'bg-white/40 dark:bg-white/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-2xl rounded-bl-md'
            )}
          >
            <div className="whitespace-pre-wrap">{renderMarkdown(message.content)}</div>
          </div>
        )}

        {previews.length > 0 && (
          <div className="w-full grid grid-cols-2 gap-2">
            {previews.map((email) => (
              <button
                key={email.id}
                onClick={() => router.push(`/email/${email.id}`)}
                className={cn(
                  'text-left p-3 rounded-2xl',
                  'bg-white/40 dark:bg-white/10 backdrop-blur-lg',
                  'border border-white/20 dark:border-white/10',
                  'hover:bg-white/60 dark:hover:bg-white/20 transition-colors',
                  'flex flex-col gap-1 min-w-0'
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-3 h-3 text-blue-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {email.from}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {email.subject}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                  {email.snippet}
                </p>
                {email.date && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
