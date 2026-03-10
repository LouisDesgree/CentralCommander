'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Send } from 'lucide-react';

interface AgentInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function AgentInput({ onSend, disabled }: AgentInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div
      className={cn(
        'fixed bottom-14 inset-x-0 z-30',
        'bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl',
        'border-t border-white/20 dark:border-white/10',
        'px-4 py-3',
        'pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]'
      )}
    >
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask your AI assistant..."
          rows={1}
          className={cn(
            'flex-1 bg-white/40 dark:bg-white/10 backdrop-blur-lg',
            'border border-white/20 dark:border-white/10',
            'rounded-2xl px-4 py-2.5',
            'text-sm text-gray-900 dark:text-white',
            'placeholder:text-gray-400',
            'focus:ring-2 focus:ring-blue-500/50',
            'outline-none resize-none max-h-32 transition-all'
          )}
          style={{ minHeight: '40px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0',
            value.trim() && !disabled
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
