'use client';

import { cn } from '@/lib/cn';
import { Inbox, Send, Mail } from 'lucide-react';
import type { Mailbox } from '@/stores/emailStore';

interface MailboxTabsProps {
  active: Mailbox;
  onChange: (mailbox: Mailbox) => void;
}

const tabs: { label: string; value: Mailbox; icon: typeof Inbox }[] = [
  { label: 'Inbox', value: 'inbox', icon: Inbox },
  { label: 'Sent', value: 'sent', icon: Send },
  { label: 'All Mail', value: 'all', icon: Mail },
];

export function MailboxTabs({ active, onChange }: MailboxTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              active === tab.value
                ? 'bg-blue-500/15 text-blue-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
