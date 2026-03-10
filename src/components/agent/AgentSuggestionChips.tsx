'use client';

import { cn } from '@/lib/cn';
import { Sparkles, Inbox, AlertTriangle, PenLine } from 'lucide-react';

interface AgentSuggestionChipsProps {
  onSelect: (suggestion: string) => void;
}

const suggestions = [
  { label: 'Summarize inbox', icon: Inbox, prompt: 'Summarize my recent inbox emails' },
  { label: "What's urgent?", icon: AlertTriangle, prompt: 'Find urgent emails that need my immediate attention' },
  { label: 'Draft reply', icon: PenLine, prompt: 'Help me draft a reply to my latest email' },
  { label: 'Categorize', icon: Sparkles, prompt: 'Categorize my unread emails' },
];

export function AgentSuggestionChips({ onSelect }: AgentSuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
      {suggestions.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.label}
            onClick={() => onSelect(s.prompt)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
              'bg-white/20 dark:bg-white/10 backdrop-blur-lg',
              'border border-white/20 dark:border-white/10',
              'text-gray-600 dark:text-gray-300',
              'hover:bg-white/30 dark:hover:bg-white/15 active:scale-95'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
