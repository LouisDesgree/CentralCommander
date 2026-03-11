'use client';

import { EmailListItem } from './EmailListItem';
import { Skeleton } from '@/components/ui/Skeleton';
import { Mail } from 'lucide-react';
import type { Email } from '@/types/email';
import type { Mailbox } from '@/stores/emailStore';

interface EmailListProps {
  emails: Email[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect?: (email: Email) => void;
  mailbox?: Mailbox;
}

export function EmailList({ emails, isLoading, selectedId, onSelect, mailbox = 'inbox' }: EmailListProps) {
  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 border-b border-white/10">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    const emptyLabel = mailbox === 'sent' ? 'No sent emails' : mailbox === 'all' ? 'No emails' : 'Inbox is empty';
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{emptyLabel}</h3>
        <p className="text-sm text-gray-400 text-center">No emails match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10 dark:divide-white/5">
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          isSelected={selectedId === email.id}
          onClick={() => onSelect?.(email)}
          isSentView={mailbox === 'sent'}
        />
      ))}
    </div>
  );
}
