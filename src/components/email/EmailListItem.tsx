'use client';

import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { Star, Paperclip } from 'lucide-react';
import type { Email } from '@/types/email';

interface EmailListItemProps {
  email: Email;
  isSelected?: boolean;
  onClick?: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 text-left transition-colors',
        'hover:bg-white/20 dark:hover:bg-white/5',
        'border-b border-white/10 dark:border-white/5',
        isSelected && 'bg-blue-500/10 dark:bg-blue-500/10',
        email.isUnread && 'bg-white/5'
      )}
    >
      <Avatar name={email.from.name} src={null} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-sm truncate',
              email.isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {email.from.name}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {formatRelativeTime(email.date)}
          </span>
        </div>
        <p
          className={cn(
            'text-sm truncate mt-0.5',
            email.isUnread ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {email.subject}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {email.snippet}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {email.aiCategory && (
            <Badge variant="primary">{email.aiCategory}</Badge>
          )}
          {email.isStarred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
          {email.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-gray-400" />}
        </div>
      </div>
    </button>
  );
}
