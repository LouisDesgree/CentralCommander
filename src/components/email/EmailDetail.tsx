'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmailSummaryCard } from './EmailSummaryCard';
import { formatRelativeTime } from '@/lib/utils';
import { Reply, ReplyAll, Forward, Archive, Trash2, Sparkles } from 'lucide-react';
import type { Email } from '@/types/email';

interface EmailDetailProps {
  email: Email;
  onReply?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onAIReply?: () => void;
}

export function EmailDetail({ email, onReply, onArchive, onDelete, onAIReply }: EmailDetailProps) {
  return (
    <div className="space-y-4 pb-24">
      <EmailSummaryCard emailId={email.id} />

      <GlassCard padding="md">
        <div className="flex items-start gap-3 mb-4">
          <Avatar name={email.from.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{email.from.name}</span>
              <span className="text-xs text-gray-400">{formatRelativeTime(email.date)}</span>
            </div>
            <p className="text-xs text-gray-400 truncate">{email.from.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              To: {email.to.map((t) => t.name || t.email).join(', ')}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">{email.subject}</h2>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {email.labelNames.filter((l) => !['INBOX', 'UNREAD', 'IMPORTANT'].includes(l)).map((label) => (
            <Badge key={label} variant="default">{label}</Badge>
          ))}
        </div>

        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: email.body.html || email.body.text.replace(/\n/g, '<br>') }}
        />
      </GlassCard>

      <div className="fixed bottom-16 inset-x-0 z-30 px-4 pb-2">
        <GlassCard variant="elevated" padding="sm" className="flex items-center justify-around">
          <Button variant="ghost" size="sm" icon={<Reply className="w-4 h-4" />} onClick={onReply}>
            Reply
          </Button>
          <Button variant="ghost" size="sm" icon={<ReplyAll className="w-4 h-4" />}>
            All
          </Button>
          <Button variant="ghost" size="sm" icon={<Forward className="w-4 h-4" />}>
            Fwd
          </Button>
          <Button variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4 text-purple-500" />} onClick={onAIReply}>
            AI
          </Button>
          <Button variant="ghost" size="sm" icon={<Archive className="w-4 h-4" />} onClick={onArchive} />
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-red-400" />} onClick={onDelete} />
        </GlassCard>
      </div>
    </div>
  );
}
